/**
 * LAUNCH STUDIO ENGINE (launch-studio.js)
 * Coordinates UI interactions across Understand, Strategize, Create,
 * Assets, and Calendar stages using AIService and CampaignService.
 */

let activeProduct = null;
let activeStrategy = null;
let activeCampaign = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('stage-understand')) return;

  initStudioStageNav();
  await loadStudioProducts();
  setupStudioActionHandlers();
});

// Stepper Tab Navigation
function initStudioStageNav() {
  const stepBtns = document.querySelectorAll('.launch-stepper .step-btn');
  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stage = btn.getAttribute('data-stage');
      switchStudioStage(stage);
    });
  });
}

function switchStudioStage(stageName) {
  const stepBtns = document.querySelectorAll('.launch-stepper .step-btn');
  const panels = document.querySelectorAll('.studio-stage-panel');

  stepBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-stage') === stageName);
  });

  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `stage-${stageName}`);
  });

  window.scrollTo({ top: 180, behavior: 'smooth' });
}

// Load products and initialize active product
async function loadStudioProducts() {
  const products = await ProductService.getAllProducts();
  const select = document.getElementById('studioProductSelect');
  if (!select || products.length === 0) return;

  // Check URL parameters (e.g. ?id=ld-1 or ?url=https://...)
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id');
  const targetUrl = urlParams.get('url');

  select.innerHTML = products.map(p => `
    <option value="${p.id}" ${targetId === p.id ? 'selected' : ''}>
      ${p.icon || '🚀'} ${escapeHtml(p.name)} (${p.category})
    </option>
  `).join('');

  if (targetUrl) {
    const urlInput = document.getElementById('studioUrlInput');
    if (urlInput) urlInput.value = targetUrl;
    await analyzeAndRunStudio(targetUrl, null);
    return;
  }

  const selectedId = targetId || products[0].id;
  activeProduct = products.find(p => p.id === selectedId) || products[0];
  await refreshStudioForProduct(activeProduct);
}

// Switcher & Action Handlers
function setupStudioActionHandlers() {
  const select = document.getElementById('studioProductSelect');
  const btnAnalyzeUrl = document.getElementById('btnAnalyzeUrl');
  const urlInput = document.getElementById('studioUrlInput');
  const btnReanalyze = document.getElementById('btnReanalyze');
  const btnGenerateFull = document.getElementById('btnGenerateFullCampaign');
  const btnQuickRegenAll = document.getElementById('btnQuickRegenAll');

  if (select) {
    select.addEventListener('change', async (e) => {
      const products = getProducts();
      activeProduct = products.find(p => p.id === e.target.value) || products[0];
      await refreshStudioForProduct(activeProduct);
      showToast(`Switched active product to ${activeProduct.name}`, 'success');
    });
  }

  if (btnAnalyzeUrl) {
    btnAnalyzeUrl.addEventListener('click', async () => {
      const rawUrl = urlInput?.value.trim();
      if (!rawUrl) {
        showToast('Please enter a valid website URL!', 'gold');
        urlInput?.focus();
        return;
      }
      btnAnalyzeUrl.innerHTML = '<span>⏳ Analyzing...</span>';
      btnAnalyzeUrl.disabled = true;
      await analyzeAndRunStudio(rawUrl, null);
      btnAnalyzeUrl.innerHTML = '<span>Analyze & Launch →</span>';
      btnAnalyzeUrl.disabled = false;
    });
  }

  if (btnReanalyze) {
    btnReanalyze.addEventListener('click', async () => {
      if (!activeProduct) return;
      btnReanalyze.textContent = '⏳ Analyzing...';
      btnReanalyze.disabled = true;
      await refreshStudioForProduct(activeProduct, true);
      btnReanalyze.textContent = '🔄 Re-Analyze';
      btnReanalyze.disabled = false;
      showToast('✨ Product Intelligence refreshed!', 'success');
    });
  }

  if (btnGenerateFull) {
    btnGenerateFull.addEventListener('click', async () => {
      btnGenerateFull.innerHTML = '<span>⏳ Generating Campaign...</span>';
      btnGenerateFull.disabled = true;
      await generateCampaignForActiveProduct();
      btnGenerateFull.innerHTML = '<span>⚡ Generate Launch Campaign</span>';
      btnGenerateFull.disabled = false;
      showToast('🚀 Fresh multi-channel launch campaign generated!', 'success');
    });
  }

  if (btnQuickRegenAll) {
    btnQuickRegenAll.addEventListener('click', async () => {
      btnQuickRegenAll.innerHTML = '<span>⏳ Generating...</span>';
      btnQuickRegenAll.disabled = true;
      await generateCampaignForActiveProduct();
      btnQuickRegenAll.innerHTML = '<span>⚡ Regenerate Entire Campaign</span>';
      btnQuickRegenAll.disabled = false;
      switchStudioStage('create');
      showToast('✨ Multi-channel campaign regenerated!', 'success');
    });
  }
}

// Master refresh for selected product
async function refreshStudioForProduct(product, forceReanalyze = false) {
  const campaignNameEl = document.getElementById('activeCampaignProductName');
  if (campaignNameEl) {
    campaignNameEl.textContent = product.name || 'Your Product';
  }

  // 1. Understand (Intelligence)
  const intel = await AIService.analyzeProduct(product.url || 'https://example.com', product);
  renderProductIntelligence(intel);

  // 2. Strategize (Marketing Strategy)
  activeStrategy = await AIService.generateStrategy(product);
  renderMarketingStrategy(activeStrategy);

  // 3. Create (Campaign Content)
  let campaign = CampaignService.getCampaign(product.id);
  if (!campaign || forceReanalyze) {
    campaign = await AIService.generateCampaign(product, activeStrategy);
    CampaignService.saveCampaign(product.id, campaign);
  }
  activeCampaign = campaign;
  renderCampaignCards(activeCampaign);

  // 4. Assets (Marketing Assets Studio)
  await renderMarketingAssets(product);

  // 5. Calendar (Content Calendar)
  renderContentCalendar(product.id);
}

// Analyze from raw URL
async function analyzeAndRunStudio(url, nameHint) {
  const intel = await AIService.analyzeProduct(url);
  activeProduct = {
    id: `temp-${Date.now()}`,
    name: intel.name,
    url: intel.url,
    tagline: intel.tagline,
    description: intel.description,
    category: intel.category,
    pricing: intel.pricing,
    icon: '🚀'
  };

  await refreshStudioForProduct(activeProduct, true);
  switchStudioStage('understand');
  showToast(`✨ Analyzed ${intel.name}! Full launch workflow ready.`, 'success');
}

/* ==========================================================================
   RENDER STAGE 1: PRODUCT INTELLIGENCE
   ========================================================================== */

function renderProductIntelligence(intel) {
  const nameEl = document.getElementById('intelProductName');
  const taglineEl = document.getElementById('intelProductTagline');
  const whatEl = document.getElementById('intelWhatItDoes');
  const audEl = document.getElementById('intelTargetAudience');
  const probEl = document.getElementById('intelProblemSolved');
  const uspEl = document.getElementById('intelUSP');
  const catEl = document.getElementById('intelCategoryPricing');
  const compEl = document.getElementById('intelCompetitors');
  const posEl = document.getElementById('intelPositioning');

  if (nameEl) nameEl.textContent = intel.name;
  if (taglineEl) taglineEl.textContent = intel.tagline;
  if (whatEl) whatEl.textContent = intel.whatItDoes;
  if (audEl) audEl.textContent = intel.targetAudience;
  if (probEl) probEl.textContent = intel.problemSolved;
  if (uspEl) uspEl.textContent = intel.usp;
  if (catEl) catEl.textContent = `Category: ${intel.category} | Pricing: ${intel.pricing}`;
  if (compEl) compEl.textContent = Array.isArray(intel.competitors) ? intel.competitors.join(', ') : intel.competitors;
  if (posEl) posEl.textContent = intel.suggestedPositioning;
}

/* ==========================================================================
   RENDER STAGE 2: MARKETING STRATEGY
   ========================================================================== */

function renderMarketingStrategy(strategy) {
  const oneLinerEl = document.getElementById('stratOneLiner');
  if (oneLinerEl && strategy.positioning) {
    oneLinerEl.textContent = strategy.positioning.oneLiner;
  }

  // Render Channel Recommendations
  const channelContainer = document.getElementById('channelStrategyContainer');
  if (channelContainer && strategy.channelStrategy) {
    channelContainer.innerHTML = strategy.channelStrategy.map(ch => `
      <div class="channel-card-item">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
            <span>${ch.icon}</span>
            <span>${escapeHtml(ch.channel)}</span>
          </div>
          <span class="channel-badge-pill">Fit: ${ch.fitScore}</span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.4;">
          ${escapeHtml(ch.reason)}
        </p>
        <div style="font-size: 0.75rem; color: var(--cyan); font-weight: 600;">
          Cadence: ${escapeHtml(ch.recommendedFrequency)}
        </div>
      </div>
    `).join('');
  }

  // Render 7-Day Blueprint
  const blueprintContainer = document.getElementById('blueprintListContainer');
  if (blueprintContainer && strategy.campaignStrategy?.days) {
    blueprintContainer.innerHTML = strategy.campaignStrategy.days.map(d => `
      <div class="blueprint-row">
        <span class="blueprint-day-pill">${escapeHtml(d.day)}</span>
        <div style="flex: 1;">
          <strong style="color: var(--text-main); font-size: 0.9rem;">${escapeHtml(d.focus)}:</strong>
          <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 6px;">${escapeHtml(d.description)}</span>
        </div>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   RENDER STAGE 3: MULTI-CHANNEL CAMPAIGN GENERATOR
   ========================================================================== */

async function generateCampaignForActiveProduct() {
  if (!activeProduct) return;
  activeCampaign = await AIService.generateCampaign(activeProduct, activeStrategy);
  CampaignService.saveCampaign(activeProduct.id, activeCampaign);
  renderCampaignCards(activeCampaign);
}

function renderCampaignCards(campaign) {
  const container = document.getElementById('campaignCardsContainer');
  if (!container || !campaign || !campaign.channels) return;

  container.innerHTML = Object.entries(campaign.channels).map(([key, item]) => {
    return `
      <div class="campaign-platform-card" id="card-channel-${key}">
        <div>
          <div class="platform-card-head">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">${item.icon}</span>
              <div>
                <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">${escapeHtml(item.platform)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(item.title)}</div>
              </div>
            </div>
            <span class="channel-badge-pill">${escapeHtml(item.badge || 'Ready')}</span>
          </div>

          <textarea 
            class="content-display-textarea" 
            id="textarea-channel-${key}"
            placeholder="Generated post content..."
          >${escapeHtml(item.content)}</textarea>

          ${item.reelConcept ? `
            <div style="margin-bottom: 12px; padding: 10px; background: rgba(168, 85, 247, 0.08); border: 1px dashed rgba(168, 85, 247, 0.3); border-radius: 8px; font-size: 0.8rem;">
              <strong style="color: var(--purple);">🎬 Reel Concept:</strong> ${escapeHtml(item.reelConcept)}
            </div>
          ` : ''}

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
            ${(item.tags || []).map(t => `<span class="tag-item">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>

        <div class="platform-actions-bar">
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-ghost btn-sm" onclick="copyChannelContent('${key}')">
              📋 Copy
            </button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="regenerateChannelContent('${key}')">
              🔄 Regenerate
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="saveChannelContent('${key}')">
              💾 Save
            </button>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" style="color: var(--coral);" onclick="deleteChannelCard('${key}')" title="Delete Content Item">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Channel actions
function copyChannelContent(key) {
  const textarea = document.getElementById(`textarea-channel-${key}`);
  if (!textarea) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    showToast(`Copied ${key.toUpperCase()} launch post to clipboard!`, 'success');
  });
}

function saveChannelContent(key) {
  const textarea = document.getElementById(`textarea-channel-${key}`);
  if (!textarea || !activeProduct) return;

  CampaignService.updateChannelContent(activeProduct.id, key, textarea.value);
  showToast(`Saved changes for ${key.toUpperCase()}`, 'success');
}

async function regenerateChannelContent(key) {
  if (!activeProduct || !activeStrategy) return;

  const card = document.getElementById(`card-channel-${key}`);
  if (card) card.style.opacity = '0.5';

  const newItem = await AIService.generateSocialContent(activeProduct, activeStrategy, key);
  if (newItem && activeCampaign && activeCampaign.channels) {
    activeCampaign.channels[key] = newItem;
    CampaignService.saveCampaign(activeProduct.id, activeCampaign);
    renderCampaignCards(activeCampaign);
    showToast(`🔄 Regenerated copy for ${key.toUpperCase()}`, 'success');
  }

  if (card) card.style.opacity = '1';
}

function deleteChannelCard(key) {
  if (!activeProduct || !activeCampaign) return;
  CampaignService.deleteChannelItem(activeProduct.id, key);
  delete activeCampaign.channels[key];
  renderCampaignCards(activeCampaign);
  showToast(`Removed item for ${key.toUpperCase()}`);
}

/* ==========================================================================
   RENDER STAGE 4: MARKETING ASSETS STUDIO
   ========================================================================== */

async function renderMarketingAssets(product) {
  const container = document.getElementById('assetsStudioContainer');
  if (!container) return;

  const assetTypes = [
    'social-graphic',
    'launch-poster',
    'promo-banner',
    'instagram-story',
    'ad-creative',
    'feature-announcement',
    'pinterest-pin',
    'reel-concept'
  ];

  const assets = await Promise.all(assetTypes.map(t => AIService.generateAsset(product, t)));

  container.innerHTML = assets.map(asset => `
    <div class="asset-box-card">
      <div class="asset-canvas-stage" style="background: ${asset.bgGradient};">
        <span class="asset-badge-banner" style="border: 1px solid ${asset.accentColor}; color: ${asset.accentColor}">
          ${escapeHtml(asset.badge)}
        </span>
        <div class="asset-canvas-title">${escapeHtml(asset.headline)}</div>
        <p class="asset-canvas-sub">${escapeHtml(asset.subhead)}</p>
        <div style="margin-top: 14px; font-size: 0.75rem; font-weight: 700; color: ${asset.accentColor};">
          ${escapeHtml(asset.ctaText)}
        </div>
      </div>

      <div class="asset-meta-row">
        <div>
          <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">${escapeHtml(asset.title)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(asset.dimensions)} • ${escapeHtml(asset.platform)}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-ghost btn-sm" onclick="copyAssetContent('${escapeHtml(asset.headline)} - ${escapeHtml(asset.subhead)}')">📋</button>
          <button class="btn btn-primary btn-sm" onclick="showToast('📥 Asset template downloaded in high-res PNG (Mock)', 'success')">Export</button>
        </div>
      </div>
    </div>
  `).join('');
}

function copyAssetContent(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Asset copy copied to clipboard!', 'success');
  });
}

/* ==========================================================================
   RENDER STAGE 5: CONTENT CALENDAR
   ========================================================================== */

function renderContentCalendar(productId) {
  const container = document.getElementById('calendarDaysContainer');
  if (!container) return;

  const calendar = CampaignService.getCalendar(productId) || [];

  container.innerHTML = calendar.map(item => {
    const isDone = item.status === 'Completed';

    return `
      <div class="calendar-day-box">
        <div class="cal-day-header">${escapeHtml(item.day)}</div>
        
        <div class="cal-item-pill ${isDone ? 'status-completed' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: var(--text-main);">${escapeHtml(item.platform)}</strong>
            <span style="font-size: 0.7rem; color: var(--cyan);">${escapeHtml(item.time)}</span>
          </div>

          <div style="color: var(--text-secondary); font-size: 0.75rem; line-height: 1.35; margin: 4px 0;">
            ${escapeHtml(item.type)}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <button 
              type="button" 
              class="btn-sm" 
              style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px; background: ${isDone ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}; color: ${isDone ? 'var(--mint)' : 'var(--text-muted)'};"
              onclick="toggleCalendarStatus('${productId}', '${item.id}')"
            >
              ${isDone ? '✓ Completed' : '○ Mark Done'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCalendarStatus(productId, itemId) {
  CampaignService.toggleCalendarItemStatus(productId, itemId);
  renderContentCalendar(productId);
  showToast('Calendar item status updated!', 'success');
}

// 1-Click Social Media Broadcast Intents
function broadcastChannel(channel) {
  if (!activeProduct) return;
  const productUrl = activeProduct.url || window.location.origin;
  const productName = activeProduct.name || 'Our product';
  const tagline = activeProduct.tagline || 'AI launch on BetaDock';
  const channelData = activeCampaign && activeCampaign.channels ? activeCampaign.channels[channel] : null;

  if (channel === 'x') {
    const rawContent = channelData?.content || `🚀 Just launched ${productName} on @BetaDockHQ! ${tagline}\n\nCheck out the launch & exclusive deal: ${productUrl} #buildinpublic #indiehackers`;
    const tweetText = rawContent.length > 270 ? rawContent.substring(0, 250) + '... ' + productUrl : rawContent;
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(intentUrl, '_blank', 'width=600,height=500');
    showToast('🐦 Opening X (Twitter) launch post composer...', 'success');
  } else if (channel === 'linkedin') {
    if (channelData?.content) {
      navigator.clipboard.writeText(channelData.content);
    }
    const intentUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`;
    window.open(intentUrl, '_blank', 'width=600,height=600');
    showToast('💼 Copied LinkedIn post copy to clipboard & opened LinkedIn!', 'success');
  } else if (channel === 'reddit') {
    if (channelData?.content) {
      navigator.clipboard.writeText(channelData.content);
    }
    const title = `Show r/SideProject: ${productName} – ${tagline}`;
    const intentUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(productUrl)}`;
    window.open(intentUrl, '_blank', 'width=700,height=600');
    showToast('🤖 Copied Reddit markdown copy to clipboard & opened Reddit submit!', 'success');
  } else if (channel === 'producthunt') {
    if (channelData?.content) {
      navigator.clipboard.writeText(channelData.content);
    }
    showToast('🐱 Copied Product Hunt Maker Intro comment to clipboard!', 'success');
  }
}
