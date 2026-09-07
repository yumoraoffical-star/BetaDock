const https = require('https');

// Helper to load .env if running standalone
function loadEnv() {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        val = val.trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}
loadEnv();

function getRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    if (req.body && typeof req.body === 'string') {
      try {
        resolve(JSON.parse(req.body));
        return;
      } catch (e) {
        resolve({});
        return;
      }
    }
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const data = await getRequestBody(req);
    const product = data.product || {};

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
      console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID missing in server environment.');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, reason: 'Telegram keys not configured on server' }));
      return;
    }

    const isPaid = product.tier === 'fast-track' || product.tier === 'pro' || product.featured;
    const tierName = isPaid ? '⚡ PAID FAST-TRACK ($19)' : '🆓 FREE QUEUE ($0)';

    const tweetText = `🚀 New Launch on @BetaDockHQ: ${product.name} - ${product.tagline || ''}${product.deal && product.deal.hasDeal ? `\n🏷️ Deal: ${product.deal.text} (Code: ${product.deal.code})` : ''}\n\nCheck out 👉 ${product.url || 'https://betadock.com'}\n#buildinpublic #indiehackers`;

    const htmlMsg = `🚨 <b>NEW LAUNCH ON BETADOCK!</b>\n\n` +
      `<b>Product:</b> ${product.name || 'New Product'} ${product.icon || '🚀'}\n` +
      `<b>Plan:</b> ${tierName}\n` +
      `<b>Founder:</b> ${product.founder || 'Maker'}\n` +
      `<b>Website:</b> ${product.url || 'N/A'}\n` +
      (product.deal && product.deal.hasDeal ? `<b>🏷️ Deal:</b> ${product.deal.text} (Code: <code>${product.deal.code}</code>)\n` : '') +
      `\n🐦 <b>Ready Tweet for @BetaDockHQ:</b>\n` +
      `<code>${tweetText}</code>`;

    const payload = JSON.stringify({
      chat_id: chatId,
      text: htmlMsg,
      parse_mode: 'HTML'
    });

    const telegramReq = https.request(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (telegramRes) => {
      let raw = '';
      telegramRes.on('data', chunk => { raw += chunk; });
      telegramRes.on('end', () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, delivered: true }));
      });
    });

    telegramReq.on('error', (err) => {
      console.error('Error sending Telegram alert:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err.message }));
    });

    telegramReq.write(payload);
    telegramReq.end();

  } catch (parseErr) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid JSON request' }));
  }
};
