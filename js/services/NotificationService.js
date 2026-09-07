/**
 * NOTIFICATION SERVICE (NotificationService.js)
 * Sends instant mobile alerts to Platform Admin via secure backend /api/notify
 * (keeps Telegram Bot Token and Chat ID private in server .env).
 */

const NOTIFICATION_STORAGE_KEY = 'betadock_admin_webhook_url';

const NotificationService = {
  getWebhookUrl() {
    return localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '';
  },

  setWebhookUrl(url) {
    if (!url) {
      localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, url.trim());
  },

  /**
   * Send instant launch alert via secure backend /api/notify
   */
  async sendLaunchAlert(product) {
    // 1. Dispatch through secure serverless backend (tokens are hidden in .env)
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product })
      });
    } catch (err) {
      console.warn('Backend notification dispatch error:', err);
    }

    // 2. Also send via custom Webhook if configured by user in settings
    const webhookUrl = this.getWebhookUrl();
    if (webhookUrl) {
      const isPaid = product.tier === 'fast-track' || product.tier === 'pro' || product.featured;
      const tierName = isPaid ? '⚡ PAID FAST-TRACK ($19)' : '🆓 FREE QUEUE ($0)';
      const tweetText = `🚀 New Launch on @BetaDockHQ: ${product.name} - ${product.tagline || ''}\n\nCheck out 👉 ${product.url}\n#buildinpublic #indiehackers`;

      if (webhookUrl.includes('discord.com/api/webhooks')) {
        return this.sendDiscordWebhook(webhookUrl, { product, tierName, isPaid, tweetText });
      } else if (webhookUrl.includes('api.telegram.org')) {
        return this.sendTelegramMessage(webhookUrl, { product, tierName, isPaid, tweetText });
      } else {
        return this.sendGenericWebhook(webhookUrl, {
          event: 'new_maker_submission',
          product,
          tier: product.tier,
          isPaid,
          tweetText,
          timestamp: new Date().toISOString()
        });
      }
    }
    return true;
  },

  // Discord Rich Embed
  async sendDiscordWebhook(url, { product, tierName, isPaid, tweetText }) {
    try {
      const payload = {
        username: 'BetaDock Bot',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BetaDockAlert',
        content: isPaid ? '🚨 **NEW PAID $19 FAST-TRACK LAUNCH ALERT!**' : '🔔 **New Product Submitted on BetaDock**',
        embeds: [
          {
            title: `${product.icon || '🚀'} ${product.name}`,
            url: product.url,
            color: isPaid ? 0xF5BA27 : 0x22C55E, // Gold for paid, Mint for free
            fields: [
              { name: 'Plan Tier', value: tierName, inline: true },
              { name: 'Founder', value: product.founder || 'Maker', inline: true },
              { name: 'Category', value: product.category || 'AI Tools', inline: true },
              { name: 'Tagline', value: product.tagline || 'N/A', inline: false },
              { name: '🏷️ Deal Offer', value: product.deal && product.deal.hasDeal ? `${product.deal.text} (Code: \`${product.deal.code}\`)` : 'None', inline: false },
              { name: '🐦 Ready-to-Post Tweet for @BetaDockHQ', value: `\`\`\`\n${tweetText}\n\`\`\``, inline: false }
            ],
            footer: { text: 'BetaDock Launch Operations' },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.warn('Error sending Discord webhook alert:', err);
      return false;
    }
  },

  // Telegram Bot Message
  async sendTelegramMessage(url, { product, tierName, tweetText }) {
    try {
      const text = `🚨 *NEW LAUNCH ON BETADOCK*\n\n*Product:* ${product.name}\n*Plan:* ${tierName}\n*Website:* ${product.url}\n*Founder:* ${product.founder || 'Maker'}\n\n*🐦 Ready Tweet:*\n\`${tweetText}\``;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, parse_mode: 'Markdown' })
      });
      return res.ok;
    } catch (err) {
      console.warn('Error sending Telegram alert:', err);
      return false;
    }
  },

  // Generic webhook (Slack, n8n, Zapier)
  async sendGenericWebhook(url, data) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (err) {
      console.warn('Error sending generic webhook alert:', err);
      return false;
    }
  },

  // Test Ping from Admin Settings
  async sendTestPing() {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) return { success: false, message: 'Please enter a valid webhook URL first!' };

    const sampleProduct = {
      name: 'DocuFast AI',
      url: 'https://docufast.ai',
      tagline: 'Summarize 50-page PDFs into key bullet points in 5 seconds.',
      category: 'AI Tools',
      tier: 'fast-track',
      founder: 'Rahul (@rahul_builds)',
      icon: '⚡',
      deal: { hasDeal: true, text: '30% Lifetime Discount', code: 'DOCU30' }
    };

    const success = await this.sendLaunchAlert(sampleProduct);
    if (success) {
      return { success: true, message: '🔔 Test ping sent successfully to your mobile alert channel!' };
    } else {
      return { success: false, message: 'Failed to send ping. Please check if your Webhook URL is correct.' };
    }
  }
};
