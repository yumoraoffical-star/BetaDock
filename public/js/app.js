/**
 * LAUNCHDOCK CORE APP ENGINE
 * Handles directory rendering, live voting, AI auto-fill, modal views,
 * embed badge generation, and maker dashboard analytics.
 */

document.addEventListener('DOMContentLoaded', () => {
  initToasts();
  initAuthUI();
  
  // Page-specific initialization
  if (document.getElementById('directoryGrid')) {
    initDirectoryView();
  }
  if (document.getElementById('submitProductForm')) {
    initSubmissionView();
  }
  if (document.getElementById('dashboardTableBody')) {
    initDashboardView();
  }
});

/* ==========================================================================
   AUTHENTICATION & USER PROFILE UI
   ========================================================================== */

function initAuthUI() {
  const authContainer = document.getElementById('headerAuthContainer');
  if (!authContainer) return;

  if (typeof SupabaseClient === 'undefined') return;
  const user = SupabaseClient.getUser();

  if (user) {
    authContainer.innerHTML = `
      <div class="user-profile-menu" title="${escapeHtml(user.email)}">
        <img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" class="user-avatar-img" />
        <span class="user-display-name">${escapeHtml(user.name)}</span>
        <button type="button" class="btn-signout" onclick="SupabaseClient.signOut()" title="Sign Out">✕</button>
      </div>
    `;

    // Auto-fill in submit form if present
    const founderInput = document.getElementById('founderName');
    if (founderInput && !founderInput.value) {
      founderInput.value = user.name;
    }
  } else {
    authContainer.innerHTML = `
      <button type="button" class="btn btn-google btn-sm" id="googleSignInBtn" onclick="handleGoogleSignIn()">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Sign In</span>
      </button>
    `;
  }
}

function handleGoogleSignIn() {
  if (typeof SupabaseClient !== 'undefined') {
    showToast('Redirecting to Google Sign-In...', 'gold');
    SupabaseClient.signInWithGoogle();
  }
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */

function initToasts() {
  if (!document.getElementById('toastContainer')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

function showToast(message, type = 'gold') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '🚀'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ==========================================================================
   DIRECTORY VIEW (index.html)
   ========================================================================== */

let currentCategory = 'all';
let currentSort = 'trending';
let dealsOnly = false;
let testersOnly = false;
let searchQuery = '';

function initDirectoryView() {
  renderPodiumRace();
  renderDirectory();
  initRaceCountdown();
  setupSearchAndFilters();
  setupModalHandlers();
  syncWithSupabase();
}

async function syncWithSupabase() {
  if (typeof SupabaseClient !== 'undefined') {
    const cloudProducts = await SupabaseClient.getProducts();
    if (cloudProducts && cloudProducts.length > 0) {
      saveProducts(cloudProducts);
      renderPodiumRace();
      renderDirectory();
    }
  }
}

// Daily Dock Race Podium (Top 3 Upvoted)
function renderPodiumRace() {
  const podiumContainer = document.getElementById('podiumGrid');
  if (!podiumContainer) return;

  const products = getProducts();
  const userVotes = getUserVotes();

  // Sort by upvotes descending
  const sorted = [...products].sort((a, b) => b.upvotes - a.upvotes);
  const top3 = sorted.slice(0, 3);

  podiumContainer.innerHTML = top3.map((product, index) => {
    const rank = index + 1;
    const isUpvoted = userVotes.includes(product.id);
    const rankLabel = rank === 1 ? '🥇 #1 Today' : rank === 2 ? '🥈 #2 Today' : '🥉 #3 Today';

    return `
      <div class="podium-card rank-${rank}" onclick="openProductModal('${product.id}')">
        <span class="rank-badge">${rankLabel}</span>
        
        <div class="card-top">
          <div class="product-icon" style="background: ${product.iconBg}22; color: ${product.iconBg}">
            ${product.icon}
          </div>
          <div class="product-info-top">
            <span class="product-category-tag">${product.category}</span>
            <div class="product-name">${escapeHtml(product.name)}</div>
          </div>
        </div>

        <p class="product-tagline">${escapeHtml(product.tagline)}</p>

        <div class="card-perks-row">
          ${product.featured ? `<span class="featured-badge">⭐ Featured</span>` : ''}
          ${product.deal && product.deal.hasDeal ? `<span class="deal-badge">🏷️ ${escapeHtml(product.deal.text)}</span>` : ''}
        </div>

        <div class="card-footer">
          <a href="${product.url}" target="_blank" rel="noopener noreferrer" class="visit-link" onclick="handleOutboundClick(event, '${product.id}', '${product.url}')">
            Visit Website ↗
          </a>

          <button type="button" class="upvote-btn ${isUpvoted ? 'upvoted' : ''}" id="vote-btn-podium-${product.id}" onclick="handleVote(event, '${product.id}')">
            <span class="upvote-arrow">▲</span>
            <span class="upvote-count">${product.upvotes}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Main Directory Grid
function renderDirectory() {
  const grid = document.getElementById('directoryGrid');
  const countElement = document.getElementById('resultCount');
  if (!grid) return;

  let products = getProducts();
  const userVotes = getUserVotes();

  // Search Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Category Filter
  if (currentCategory !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
  }

  // Deals Only Filter
  if (dealsOnly) {
    products = products.filter(p => p.deal && p.deal.hasDeal);
  }

  // Testers Only Filter
  if (testersOnly) {
    products = products.filter(p => p.testersWanted && (p.testerClaimed || 0) < (p.testerSpots || 10));
  }

  // Sort
  if (currentSort === 'trending') {
    products.sort((a, b) => b.upvotes - a.upvotes);
  } else if (currentSort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSort === 'featured') {
    products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.upvotes - a.upvotes);
  }

  if (countElement) {
    countElement.innerHTML = `Showing <strong>${products.length}</strong> products`;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No matching tools found</h3>
        <p>Try searching for a different keyword, category, or clear filters.</p>
        <button class="btn btn-ghost btn-sm" style="margin-top: 16px;" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => {
    const isUpvoted = userVotes.includes(product.id);
    return `
      <div class="product-card ${product.featured ? 'is-featured' : ''}" onclick="openProductModal('${product.id}')">
        <div class="product-card-header">
          <div class="product-icon" style="background: ${product.iconBg}22; color: ${product.iconBg}">
            ${product.icon}
          </div>
          <div class="product-card-title-group">
            <div class="product-card-title">
              ${escapeHtml(product.name)}
              ${product.featured ? `<span class="featured-badge" style="font-size:0.65rem;">Featured</span>` : ''}
            </div>
            <div class="product-card-meta">
              <span class="category-badge-chip">${product.category}</span>
              <span class="pricing-badge-chip">${product.pricing}</span>
            </div>
          </div>
        </div>

        <p class="product-card-desc">${escapeHtml(product.tagline)}</p>

        <div class="product-card-tags">
          ${(product.tags || []).slice(0, 3).map(tag => `<span class="tag-item">#${escapeHtml(tag)}</span>`).join('')}
          ${product.deal && product.deal.hasDeal ? `<span class="deal-badge">🏷️ ${escapeHtml(product.deal.text)}</span>` : ''}
          ${product.testersWanted ? `
            <span class="tester-spot-badge">
              🎯 ${product.testerClaimed || 0}/${product.testerSpots || 10} Testers
            </span>
          ` : ''}
        </div>

        ${product.testersWanted ? `
          <div class="tester-progress-wrap">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-secondary);">
              <span>${(product.testerSpots || 10) - (product.testerClaimed || 0)} beta spots remaining</span>
              <span style="color: var(--mint); font-weight: 700;">Reward Available</span>
            </div>
            <div class="tester-progress-bar-bg">
              <div class="tester-progress-bar-fill" style="width: ${Math.min(100, Math.round(((product.testerClaimed || 0) / (product.testerSpots || 10)) * 100))}%;"></div>
            </div>
          </div>
        ` : ''}

        <div class="card-footer">
          <a href="${product.url}" target="_blank" rel="noopener noreferrer" class="visit-link" onclick="handleOutboundClick(event, '${product.id}', '${product.url}')">
            Visit ↗
          </a>

          <button type="button" class="upvote-btn ${isUpvoted ? 'upvoted' : ''}" id="vote-btn-grid-${product.id}" onclick="handleVote(event, '${product.id}')">
            <span class="upvote-arrow">▲</span>
            <span class="upvote-count">${product.upvotes}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Live Countdown Timer for Today's Dock Race
function initRaceCountdown() {
  const timerElement = document.getElementById('raceTimerCountdown');
  if (!timerElement) return;

  function update() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const diffMs = midnight - now;
    const hours = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((diffMs % (1000 * 60)) / 1000)).padStart(2, '0');

    timerElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
  }

  update();
  setInterval(update, 1000);
}

// Filter and Search Handlers
function setupSearchAndFilters() {
  const searchInput = document.getElementById('directorySearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const sortSelect = document.getElementById('sortSelect');
  const dealsToggle = document.getElementById('dealsOnlyToggle');
  const testersToggle = document.getElementById('testersOnlyToggle');
  const categoryPills = document.querySelectorAll('.filter-pill');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      }
      renderDirectory();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        renderDirectory();
      }
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderDirectory();
    });
  }

  if (dealsToggle) {
    dealsToggle.addEventListener('click', () => {
      dealsOnly = !dealsOnly;
      dealsToggle.classList.toggle('active', dealsOnly);
      renderDirectory();
    });
  }

  if (testersToggle) {
    testersToggle.addEventListener('click', () => {
      testersOnly = !testersOnly;
      testersToggle.classList.toggle('active', testersOnly);
      renderDirectory();
    });
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      renderDirectory();
    });
  });
}

function resetFilters() {
  currentCategory = 'all';
  searchQuery = '';
  dealsOnly = false;
  currentSort = 'trending';

  const searchInput = document.getElementById('directorySearchInput');
  if (searchInput) searchInput.value = '';

  const dealsToggle = document.getElementById('dealsOnlyToggle');
  if (dealsToggle) dealsToggle.classList.remove('active');

  const categoryPills = document.querySelectorAll('.filter-pill');
  categoryPills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-category') === 'all');
  });

  renderDirectory();
}

// Live Voting System
function handleVote(event, productId) {
  event.stopPropagation(); // prevent modal opening

  const products = getProducts();
  let userVotes = getUserVotes();
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) return;

  const hasVoted = userVotes.includes(productId);

  if (hasVoted) {
    // Unvote
    products[productIndex].upvotes = Math.max(0, products[productIndex].upvotes - 1);
    userVotes = userVotes.filter(id => id !== productId);
    showToast(`Removed upvote for ${products[productIndex].name}`);
  } else {
    // Upvote
    products[productIndex].upvotes += 1;
    userVotes.push(productId);
    showToast(`🚀 Upvoted ${products[productIndex].name}!`, 'success');
  }

  saveProducts(products);
  saveUserVotes(userVotes);

  // Sync to Supabase Cloud
  if (typeof SupabaseClient !== 'undefined') {
    SupabaseClient.updateUpvotes(productId, products[productIndex].upvotes);
  }

  renderPodiumRace();
  renderDirectory();
}

function handleOutboundClick(event, productId, url) {
  event.stopPropagation();
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (product && product.stats) {
    product.stats.clicks = (product.stats.clicks || 0) + 1;
    saveProducts(products);
  }
}

/* ==========================================================================
   PRODUCT DETAIL MODAL
   ========================================================================== */

function setupModalHandlers() {
  const backdrop = document.getElementById('productModalBackdrop');
  if (!backdrop) return;

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeProductModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });
}

function openProductModal(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Increment view counter
  if (product.stats) {
    product.stats.views = (product.stats.views || 0) + 1;
    saveProducts(products);
  }

  const backdrop = document.getElementById('productModalBackdrop');
  const content = document.getElementById('modalContent');
  if (!backdrop || !content) return;

  const userVotes = getUserVotes();
  const isUpvoted = userVotes.includes(product.id);

  content.innerHTML = `
    <div class="modal-header-section">
      <div class="modal-icon" style="background: ${product.iconBg}25; color: ${product.iconBg}">
        ${product.icon}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
          <h2 style="font-size: 1.6rem; margin: 0;">${escapeHtml(product.name)}</h2>
          ${product.featured ? `<span class="featured-badge">⭐ Featured</span>` : ''}
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="category-badge-chip">${product.category}</span>
          <span class="pricing-badge-chip">${product.pricing}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">By ${escapeHtml(product.founder || 'Maker')}</span>
        </div>
      </div>
    </div>

    <p style="font-size: 1.05rem; color: var(--text-main); margin-bottom: 20px; line-height: 1.5;">
      ${escapeHtml(product.tagline)}
    </p>

    ${product.deal && product.deal.hasDeal ? `
      <div class="modal-deal-box">
        <div>
          <div style="font-weight: 700; color: var(--coral); margin-bottom: 2px;">🎁 Exclusive BetaDock Deal</div>
          <div style="font-size: 0.88rem; color: var(--text-secondary);">${escapeHtml(product.deal.text)}</div>
        </div>
        <div class="coupon-code-pill" id="couponBadge" onclick="copyCouponCode('${escapeHtml(product.deal.code)}')">
          <span>${escapeHtml(product.deal.code)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); cursor: pointer;">📋 Copy</span>
        </div>
      </div>
    ` : ''}

    <!-- FIRST 10 TESTERS & BETA FEEDBACK SECTION -->
    ${product.testersWanted ? `
      <div class="modal-tester-box">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--cyan); display: flex; align-items: center; gap: 6px;">
              🧪 First 10 Beta Testers Wanted!
            </div>
            <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 2px;">
              Test this tool, leave constructive feedback, and claim the founder's reward.
            </div>
          </div>
          <span class="tester-spot-badge" style="font-size: 0.85rem; padding: 4px 10px;">
            ${(product.testerSpots || 10) - (product.testerClaimed || 0)} of ${product.testerSpots || 10} spots left
          </span>
        </div>

        <div class="tester-reward-pill">
          ${escapeHtml(product.testerReward || '🎁 Free Pro Account Access')}
        </div>

        <!-- Feedback Form -->
        <div class="feedback-form-box">
          <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main); margin-bottom: 6px;">
            Leave Beta Feedback & Claim Reward:
          </div>

          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 4px;">Your Rating:</div>
          <div class="star-rating-group" id="starRatingGroup">
            <span class="star-rating-item active" data-val="1" onclick="setStarRating(1)">★</span>
            <span class="star-rating-item active" data-val="2" onclick="setStarRating(2)">★</span>
            <span class="star-rating-item active" data-val="3" onclick="setStarRating(3)">★</span>
            <span class="star-rating-item active" data-val="4" onclick="setStarRating(4)">★</span>
            <span class="star-rating-item active" data-val="5" onclick="setStarRating(5)">★</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="feedbackUser" class="form-control" style="font-size: 0.85rem;" placeholder="Your Name or Handle *" required />
            <input type="email" id="feedbackEmail" class="form-control" style="font-size: 0.85rem;" placeholder="Your Email (to get reward) *" required />
          </div>

          <div class="form-group" style="margin-bottom: 10px;">
            <input type="text" id="feedbackGood" class="form-control" style="font-size: 0.85rem;" placeholder="What worked well / favorite feature? *" required />
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <input type="text" id="feedbackBad" class="form-control" style="font-size: 0.85rem;" placeholder="What was confusing or buggy? Any suggestions?" />
          </div>

          <button type="button" class="btn btn-mint btn-sm" style="width: 100%;" onclick="submitBetaFeedback('${product.id}')">
            Submit Feedback & Claim Reward 🎁
          </button>
        </div>

        <!-- Existing Feedback Reviews -->
        ${product.feedbacks && product.feedbacks.length > 0 ? `
          <div class="feedback-list-section">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main); margin-bottom: 10px;">
              Recent Tester Reviews (${product.feedbacks.length})
            </div>
            ${product.feedbacks.map(fb => `
              <div class="feedback-comment-card">
                <div class="feedback-comment-header">
                  <span style="font-weight: 700; color: var(--text-main);">${escapeHtml(fb.user)}</span>
                  <span style="color: var(--primary); font-size: 0.85rem;">${'★'.repeat(fb.rating || 5)}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">
                  <strong style="color: var(--mint);">👍 Liked:</strong> ${escapeHtml(fb.good)}
                </div>
                ${fb.bad ? `
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    <strong style="color: var(--coral);">💡 Suggestion:</strong> ${escapeHtml(fb.bad)}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    ` : ''}

    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">About the Product</h4>
      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">
        ${escapeHtml(product.description || product.tagline)}
      </p>
    </div>

    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
      ${(product.tags || []).map(tag => `<span class="tag-item" style="padding: 4px 10px; font-size: 0.8rem;">#${escapeHtml(tag)}</span>`).join('')}
    </div>

    <!-- RELATED PRODUCTS IN CATEGORY -->
    ${(() => {
      const rels = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
      if (rels.length === 0) return '';
      return `
        <div style="margin-bottom: 22px; padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
          <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 10px;">
            More in ${escapeHtml(product.category)}
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px;">
            ${rels.map(rp => `
              <div onclick="openProductModal('${rp.id}')" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: border-color 0.2s;">
                <span style="font-size: 1.2rem;">${rp.icon || '🚀'}</span>
                <div style="overflow: hidden;">
                  <div style="font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main);">${escapeHtml(rp.name)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">▲ ${rp.upvotes} upvotes</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    })()}

    <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 20px; gap: 12px; flex-wrap: wrap;">
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button type="button" class="btn btn-mint" onclick="handleVoteModal('${product.id}')">
          <span>▲ Upvote</span>
          <span style="font-family: monospace; font-size: 1rem; margin-left: 4px;">${product.upvotes}</span>
        </button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="copyProductShare('${product.id}')">
          🔗 Share Link
        </button>
        <a href="/product?id=${product.id}" class="btn btn-ghost btn-sm" style="text-decoration: none;">
          📄 Full Page
        </a>
        <a href="launch.html?id=${product.id}" class="btn btn-outline btn-sm" style="border-color: rgba(245,186,39,0.45); color: var(--primary); text-decoration: none;">
          ⚡ Launch in AI Studio →
        </a>
      </div>

      <a href="${product.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" onclick="handleOutboundClick(event, '${product.id}', '${product.url}')">
        Visit Website ↗
      </a>
    </div>
  `;

  backdrop.classList.add('open');
}

function copyProductShare(productId) {
  const url = `${window.location.origin}/product?id=${productId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('🔗 Product launch link copied to clipboard!', 'success');
  }).catch(() => {
    window.location.href = `/product?id=${productId}`;
  });
}

function closeProductModal() {
  const backdrop = document.getElementById('productModalBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function handleVoteModal(productId) {
  const fakeEvent = { stopPropagation: () => {} };
  handleVote(fakeEvent, productId);
  openProductModal(productId); // re-render modal with updated vote
}

function copyCouponCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Copied coupon code: ${code}!`, 'success');
  }).catch(() => {
    showToast(`Code: ${code}`);
  });
}

let currentRating = 5;

function setStarRating(val) {
  currentRating = val;
  const stars = document.querySelectorAll('#starRatingGroup .star-rating-item');
  stars.forEach((s, idx) => {
    s.classList.toggle('active', idx < val);
  });
}

function submitBetaFeedback(productId) {
  const user = document.getElementById('feedbackUser')?.value.trim();
  const email = document.getElementById('feedbackEmail')?.value.trim();
  const good = document.getElementById('feedbackGood')?.value.trim();
  const bad = document.getElementById('feedbackBad')?.value.trim() || '';

  if (!user || !email || !good) {
    showToast('Please fill in Name, Email and what worked well!', 'gold');
    return;
  }

  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (!product.feedbacks) product.feedbacks = [];
  product.feedbacks.unshift({
    user,
    email,
    rating: currentRating,
    good,
    bad,
    date: new Date().toISOString().split('T')[0]
  });

  // Increment tester claimed
  product.testerClaimed = Math.min(product.testerSpots || 10, (product.testerClaimed || 0) + 1);
  saveProducts(products);

  // Sync feedback to Supabase
  if (typeof SupabaseClient !== 'undefined') {
    SupabaseClient.createFeedback(productId, {
      user,
      email,
      rating: currentRating,
      good,
      bad
    });
  }

  showToast(`🎁 Feedback submitted! Reward sent to ${email}`, 'success');

  // Re-render modal with updated reviews
  openProductModal(productId);
  renderDirectory();
}

/* ==========================================================================
   MAKER SUBMISSION & AI AUTO-FILL VIEW (submit.html)
   ========================================================================== */

function initSubmissionView() {
  setupAiAutoFill();
  setupLivePreviewListeners();
  setupTierSelector();
  setupFormSubmission();
}

function setupAiAutoFill() {
  const aiBtn = document.getElementById('aiAutoFillBtn');
  const aiInput = document.getElementById('aiUrlInput');

  if (!aiBtn || !aiInput) return;

  aiBtn.addEventListener('click', () => {
    const rawUrl = aiInput.value.trim();
    if (!rawUrl) {
      showToast('Please enter a website URL first!', 'gold');
      aiInput.focus();
      return;
    }

    aiBtn.innerHTML = `<span>⏳ Extracting Metadata...</span>`;
    aiBtn.disabled = true;

    // Simulate AI extraction intelligence
    setTimeout(() => {
      simulateAiExtraction(rawUrl);
      aiBtn.innerHTML = `<span>✨ Auto-Fill with AI</span>`;
      aiBtn.disabled = false;
      showToast('✨ AI successfully auto-filled product fields!', 'success');
    }, 900);
  });
}

function simulateAiExtraction(rawUrl) {
  let hostname = '';
  try {
    const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    hostname = urlObj.hostname.replace('www.', '');
  } catch (e) {
    hostname = rawUrl;
  }

  const baseName = hostname.split('.')[0];
  const capitalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

  // Preset smart mock inferences based on keywords or default
  const nameField = document.getElementById('productName');
  const urlField = document.getElementById('productUrl');
  const taglineField = document.getElementById('productTagline');
  const categoryField = document.getElementById('productCategory');
  const descField = document.getElementById('productDesc');
  const tagsField = document.getElementById('productTags');
  const iconField = document.getElementById('productIcon');

  if (nameField) nameField.value = `${capitalizedName} AI`;
  if (urlField) urlField.value = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  if (taglineField) taglineField.value = `Next-generation ${capitalizedName} engine designed to automate modern workflows seamlessly.`;
  if (categoryField) categoryField.value = 'AI Tools';
  if (descField) descField.value = `${capitalizedName} provides an intuitive dashboard for makers and dev teams to ship faster, eliminate friction, and accelerate organic growth with zero code.`;
  if (tagsField) tagsField.value = 'AI, SaaS, Automation, Productivity';
  if (iconField) iconField.value = '🚀';

  updateLivePreview();
}

function setupLivePreviewListeners() {
  const inputs = ['productName', 'productTagline', 'productCategory', 'productIcon', 'dealText'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLivePreview);
    }
  });
}

function updateLivePreview() {
  const name = document.getElementById('productName')?.value || 'Your Awesome Product';
  const tagline = document.getElementById('productTagline')?.value || 'A brief, punchy one-liner describing what your tool solves for users.';
  const category = document.getElementById('productCategory')?.value || 'AI Tools';
  const icon = document.getElementById('productIcon')?.value || '🚀';
  const dealText = document.getElementById('dealText')?.value || '';

  const prevName = document.getElementById('previewName');
  const prevTagline = document.getElementById('previewTagline');
  const prevCategory = document.getElementById('previewCategory');
  const prevIcon = document.getElementById('previewIcon');
  const prevDeal = document.getElementById('previewDeal');

  if (prevName) prevName.textContent = name;
  if (prevTagline) prevTagline.textContent = tagline;
  if (prevCategory) prevCategory.textContent = category;
  if (prevIcon) prevIcon.textContent = icon;

  if (prevDeal) {
    if (dealText.trim()) {
      prevDeal.style.display = 'inline-flex';
      prevDeal.innerHTML = `🏷️ ${escapeHtml(dealText)}`;
    } else {
      prevDeal.style.display = 'none';
    }
  }
}

let selectedTier = 'fast-track';

function setupTierSelector() {
  const tierCards = document.querySelectorAll('.tier-select-card');
  tierCards.forEach(card => {
    card.addEventListener('click', () => {
      tierCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedTier = card.getAttribute('data-tier');
    });
  });
}

function setupFormSubmission() {
  const form = document.getElementById('submitProductForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const url = document.getElementById('productUrl').value.trim();
    const tagline = document.getElementById('productTagline').value.trim();
    const category = document.getElementById('productCategory').value;
    const desc = document.getElementById('productDesc').value.trim();
    const icon = document.getElementById('productIcon').value.trim() || '🚀';
    const tagsRaw = document.getElementById('productTags').value.trim();
    const founder = document.getElementById('founderName').value.trim() || 'Anonymous Maker';
    const dealText = document.getElementById('dealText').value.trim();
    const dealCode = document.getElementById('dealCode').value.trim();

    if (!name || !url || !tagline) {
      showToast('Please fill in all required fields!', 'gold');
      return;
    }

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [category];
    const isFeatured = selectedTier === 'fast-track' || selectedTier === 'pro';
    const enableTesters = document.getElementById('enableTestersCheckbox')?.checked || false;
    const testerReward = document.getElementById('testerRewardInput')?.value.trim() || '🎁 Free Pro Account Access';

    const newProduct = {
      id: `ld-${Date.now()}`,
      name,
      url,
      tagline,
      category,
      description: desc || tagline,
      icon,
      iconBg: '#F5BA27',
      pricing: 'Freemium',
      upvotes: isFeatured ? 45 : 1, // fast-track kickstart
      featured: isFeatured,
      deal: {
        hasDeal: Boolean(dealText && dealCode),
        text: dealText,
        code: dealCode
      },
      testersWanted: enableTesters,
      testerSpots: 10,
      testerClaimed: 0,
      testerReward: enableTesters ? testerReward : '',
      feedbacks: [],
      founder,
      tags,
      tier: selectedTier || (isFeatured ? 'fast-track' : 'free'),
      promoted: false,
      createdAt: new Date().toISOString().split('T')[0],
      stats: { views: 1, clicks: 0 }
    };

    const products = getProducts();
    products.unshift(newProduct);
    saveProducts(products);

    // Sync to Supabase Cloud
    if (typeof SupabaseClient !== 'undefined') {
      SupabaseClient.createProduct(newProduct);
    }

    // Send instant mobile alert to Admin (Telegram / Discord webhook)
    if (typeof NotificationService !== 'undefined') {
      NotificationService.sendLaunchAlert(newProduct);
    }

    // Save as maker's active submission for dashboard
    localStorage.setItem('betadock_maker_last_product', JSON.stringify(newProduct));

    showToast('🎉 Product submitted! Opening AI Launch Studio...', 'success');

    setTimeout(() => {
      window.location.href = `launch.html?id=${newProduct.id}`;
    }, 1200);
  });
}

/* ==========================================================================
   MAKER DASHBOARD & EMBED BADGE GENERATOR (dashboard.html)
   ========================================================================== */

function initDashboardView() {
  renderDashboardStats();
  renderDashboardListings();
  renderDashboardFeedback();
  initEmbedBadgeBuilder();
}

function renderDashboardFeedback() {
  const tableBody = document.getElementById('dashboardFeedbackTableBody');
  if (!tableBody) return;

  const products = getProducts();
  let feedbackRows = [];

  products.forEach(p => {
    if (p.feedbacks && p.feedbacks.length > 0) {
      p.feedbacks.forEach(fb => {
        feedbackRows.push({
          productName: p.name,
          icon: p.icon,
          ...fb
        });
      });
    }
  });

  if (feedbackRows.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No beta tester reviews submitted yet. When users test your tools, their feedback and contact details will appear here.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = feedbackRows.map(row => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 700;">
          <span>${row.icon}</span>
          <span>${escapeHtml(row.productName)}</span>
        </div>
      </td>
      <td>
        <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(row.user)}</div>
        <div style="font-size: 0.78rem; color: var(--cyan); font-family: monospace;">${escapeHtml(row.email || 'tester@example.com')}</div>
      </td>
      <td style="color: var(--primary); font-size: 0.9rem;">
        ${'★'.repeat(row.rating || 5)}
      </td>
      <td style="max-width: 260px; font-size: 0.85rem; color: var(--text-main);">
        ${escapeHtml(row.good)}
      </td>
      <td style="max-width: 240px; font-size: 0.85rem; color: var(--text-secondary);">
        ${escapeHtml(row.bad || 'None')}
      </td>
      <td style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap;">
        ${row.date || 'Today'}
      </td>
    </tr>
  `).join('');
}

function renderDashboardStats() {
  const products = getProducts();
  const totalUpvotes = products.reduce((acc, p) => acc + (p.upvotes || 0), 0);
  const totalViews = products.reduce((acc, p) => acc + ((p.stats && p.stats.views) || 0), 0);
  const totalClicks = products.reduce((acc, p) => acc + ((p.stats && p.stats.clicks) || 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  const upvotesEl = document.getElementById('dashTotalUpvotes');
  const viewsEl = document.getElementById('dashTotalViews');
  const clicksEl = document.getElementById('dashTotalClicks');
  const ctrEl = document.getElementById('dashCtr');

  if (upvotesEl) upvotesEl.textContent = totalUpvotes.toLocaleString();
  if (viewsEl) viewsEl.textContent = totalViews.toLocaleString();
  if (clicksEl) clicksEl.textContent = totalClicks.toLocaleString();
  if (ctrEl) ctrEl.textContent = `${ctr}%`;
}

function renderDashboardListings() {
  const tableBody = document.getElementById('dashboardTableBody');
  if (!tableBody) return;

  const products = getProducts();

  tableBody.innerHTML = products.map(product => {
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 1.5rem;">${product.icon}</div>
            <div>
              <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(product.name)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${product.category}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="status-pill ${product.featured ? 'status-featured' : 'status-live'}">
            ${product.featured ? '⭐ Featured Spotlight' : '🟢 Live in Directory'}
          </span>
        </td>
        <td style="font-family: monospace; font-weight: 700; color: var(--mint);">
          ${product.upvotes}
        </td>
        <td>${(product.stats && product.stats.views) || 0}</td>
        <td>${(product.stats && product.stats.clicks) || 0}</td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-ghost btn-sm" onclick="handleDashboardBoost('${product.id}')">
              ${product.featured ? '⚡ Extend Boost' : '🚀 Boost ($19)'}
            </button>
            <a href="${product.url}" target="_blank" class="btn btn-ghost btn-sm">Visit ↗</a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleDashboardBoost(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  product.featured = true;
  product.upvotes += 50; // simulated boost injection
  saveProducts(products);

  showToast(`⚡ Boost activated for ${product.name}! Upvotes +50 and pinned to Featured!`, 'success');
  renderDashboardStats();
  renderDashboardListings();
}

// Embed Badge Generator
let currentBadgeTheme = 'dark';
let currentBadgeType = 'featured';

function initEmbedBadgeBuilder() {
  const themeSelect = document.getElementById('badgeThemeSelect');
  const typeSelect = document.getElementById('badgeTypeSelect');
  const copyHtmlBtn = document.getElementById('copyBadgeHtmlBtn');
  const copyMdBtn = document.getElementById('copyBadgeMdBtn');

  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      currentBadgeTheme = e.target.value;
      updateBadgePreview();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentBadgeType = e.target.value;
      updateBadgePreview();
    });
  }

  if (copyHtmlBtn) {
    copyHtmlBtn.addEventListener('click', () => {
      const code = generateBadgeCode('html');
      navigator.clipboard.writeText(code).then(() => {
        showToast('Embed HTML code copied!', 'success');
      });
    });
  }

  if (copyMdBtn) {
    copyMdBtn.addEventListener('click', () => {
      const code = generateBadgeCode('markdown');
      navigator.clipboard.writeText(code).then(() => {
        showToast('Embed Markdown copied!', 'success');
      });
    });
  }

  updateBadgePreview();
}

function updateBadgePreview() {
  const previewBox = document.getElementById('liveBadgeContainer');
  const codeDisplay = document.getElementById('badgeCodeDisplay');
  if (!previewBox) return;

  let themeClass = 'ld-badge-dark';
  if (currentBadgeTheme === 'gold') themeClass = 'ld-badge-gold';
  if (currentBadgeTheme === 'minimal') themeClass = 'ld-badge-minimal';

  const badgeText = currentBadgeType === 'upvote' ? '▲ Upvote us on BetaDock' : '🚀 Featured on BetaDock';

  previewBox.innerHTML = `
    <a href="https://betadock.example.com" target="_blank" class="ld-embed-badge ${themeClass}">
      <span style="font-size: 1.2rem;">🚀</span>
      <span>${badgeText}</span>
    </a>
  `;

  if (codeDisplay) {
    codeDisplay.textContent = generateBadgeCode('html');
  }
}

function generateBadgeCode(format) {
  const badgeText = currentBadgeType === 'upvote' ? '▲ Upvote us on BetaDock' : 'Featured on BetaDock';
  const siteUrl = 'https://betadock.example.com';

  if (format === 'markdown') {
    return `[![${badgeText}](${siteUrl}/badges/${currentBadgeTheme}.svg)](${siteUrl})`;
  } else {
    return `<a href="${siteUrl}" target="_blank"><img src="${siteUrl}/badges/${currentBadgeTheme}.svg" alt="${badgeText}" style="height: 48px;" /></a>`;
  }
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
