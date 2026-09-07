/**
 * PAYMENT SERVICE ABSTRACTION
 * Handles tier checkout and boost upgrades.
 * Clearly demarcates sandbox test mode vs production gateway (Stripe/Razorpay).
 * Never falsely claims real financial transactions occurred.
 */

const PaymentService = {
  isSandbox: true,

  getTiers() {
    return [
      {
        id: 'free',
        name: 'Free Discovery',
        price: 0,
        billing: 'forever',
        features: ['Permanent directory listing', 'Standard 3-5 day review', 'Upvote eligibility', 'Embed badges']
      },
      {
        id: 'fast-track',
        name: 'Fast-Track Boost',
        price: 19,
        billing: 'one-time launch',
        features: ['Guaranteed 24-hour review', '48-hour homepage top spotlight', 'Do-follow SEO backlink', '+45 upvote kickstart', 'Category priority pin']
      },
      {
        id: 'pro',
        name: 'Pro Maker Studio',
        price: 29,
        billing: 'monthly subscription',
        features: ['Unlimited submissions', 'Instant zero-wait approval', 'Weekly Radar newsletter spotlight', 'Full AI Launch Studio access', 'Priority support']
      }
    ];
  },

  /**
   * Initiate Checkout Modal / Flow
   * In sandbox mode: Displays an explicit test transaction simulator with clear notice.
   */
  initiateCheckout(tierId, productName = 'BetaDock Listing') {
    const tier = this.getTiers().find(t => t.id === tierId) || this.getTiers()[1];
    
    // Create or reuse modal
    let modal = document.getElementById('paymentModalBackdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'paymentModalBackdrop';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 460px;">
          <button type="button" class="modal-close-btn" onclick="document.getElementById('paymentModalBackdrop').classList.remove('open')">✕</button>
          <div id="paymentModalBody"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const modalBody = document.getElementById('paymentModalBody');
    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 2.4rem; margin-bottom: 8px;">💳</div>
        <h3 style="font-size: 1.4rem; margin-bottom: 4px;">${escapeHtml(tier.name)}</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">For: <strong>${escapeHtml(productName)}</strong></p>
        <div style="margin: 16px 0; padding: 14px; background: rgba(245, 186, 39, 0.08); border: 1px dashed var(--primary); border-radius: 10px;">
          <span style="font-size: 2rem; font-weight: 800; color: var(--primary); font-family: var(--font-heading);">$${tier.price}</span>
          <span style="font-size: 0.85rem; color: var(--text-muted);"> / ${tier.billing}</span>
          <div style="margin-top: 6px; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
            ⚠️ Sandbox Mode (Simulated Gateway)
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label class="form-label" style="font-size: 0.8rem;">Test Email for Receipt</label>
        <input type="email" id="testPaymentEmail" class="form-control" value="founder@example.com" />
      </div>

      <button type="button" class="btn btn-primary" style="width: 100%;" onclick="PaymentService.confirmSandboxPayment('${tier.id}', '${escapeHtml(productName)}')">
        Confirm Test Payment ($${tier.price})
      </button>
      <p style="text-align: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 10px;">
        Zero money will be charged. Connect Stripe / Razorpay keys for live production.
      </p>
    `;

    modal.classList.add('open');
  },

  confirmSandboxPayment(tierId, productName) {
    const modal = document.getElementById('paymentModalBackdrop');
    if (modal) modal.classList.remove('open');

    showToast(`⚡ Test Payment confirmed for ${productName}! Boost activated in sandbox mode.`, 'success');
  }
};
