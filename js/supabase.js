/**
 * SUPABASE CLOUD SYNC FOR BETADOCK
 * Handles cloud persistence for products, live upvotes, and beta tester reviews.
 * Includes seamless offline/localStorage fallback.
 */

const SUPABASE_URL = 'https://fszgqexkqbifqthuvkzw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemdxZXhrcWJpZnF0aHV2a3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDU0MDAsImV4cCI6MjEwNDI4MTQwMH0.XBcaR5wAHjcnn4DIc76ic9DyCjb3NeCV5A6R_o_9Xj4';
const GOOGLE_CLIENT_ID = '981485584657-nj911bdi4vba39irsnbdjhi66mjcgbdl.apps.googleusercontent.com';
const USER_SESSION_KEY = 'betadock_user_session';

const SupabaseClient = {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },

  // Google OAuth Trigger
  signInWithGoogle() {
    const currentUrl = window.location.origin + window.location.pathname;
    // Redirects to Supabase Google OAuth endpoint
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(currentUrl)}`;
  },

  // Email & Maker Pass Sign-In
  signInWithEmail(email, name) {
    if (!email) return null;
    const cleanEmail = email.trim();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];
    const user = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      name: cleanName,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=f5ba27,38bdf8,10b981`
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('betadock:auth-change', { detail: { user } }));
    return user;
  },

  isAuthenticated() {
    return Boolean(this.getUser());
  },

  // Check URL hash for OAuth redirect token or cached session
  checkAuthSession() {
    // Check if returning from Supabase OAuth with hash
    if (window.location.hash && window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        try {
          // Decode JWT payload
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));

          const user = {
            id: payload.sub,
            email: payload.email,
            name: payload.user_metadata?.full_name || payload.email.split('@')[0],
            avatar: payload.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${payload.email}`
          };

          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
          // Clean hash from URL without refreshing
          history.replaceState(null, null, window.location.pathname + window.location.search);
          return user;
        } catch (e) {
          console.error('Error decoding Supabase auth token:', e);
        }
      }
    }

    // Check cached session
    const cached = localStorage.getItem(USER_SESSION_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return null; }
    }
    return null;
  },

  getUser() {
    return this.checkAuthSession();
  },

  signOut() {
    localStorage.removeItem(USER_SESSION_KEY);
    window.location.reload();
  },

  async isConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_KEY);
  },

  // Fetch all products from Supabase
  async getProducts() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
        headers: this.headers
      });

      if (!response.ok) {
        console.warn('Supabase fetch failed or table not created yet. Using local fallback.');
        return null;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      // Transform DB schema to app format
      return data.map(item => ({
        id: item.id,
        name: item.name,
        tagline: item.tagline,
        category: item.category,
        description: item.description,
        url: item.url,
        icon: item.icon || '🚀',
        iconBg: item.icon_bg || '#F5BA27',
        pricing: item.pricing || 'Freemium',
        upvotes: item.upvotes || 0,
        featured: item.featured || false,
        deal: {
          hasDeal: item.deal_has || false,
          text: item.deal_text || '',
          code: item.deal_code || ''
        },
        testersWanted: item.testers_wanted || false,
        testerSpots: item.tester_spots || 10,
        testerClaimed: item.tester_claimed || 0,
        testerReward: item.tester_reward || '',
        feedbacks: item.feedbacks || [],
        founder: item.founder || 'Maker',
        tags: item.tags || [],
        tier: item.tier || (item.featured ? 'fast-track' : 'free'),
        promoted: item.promoted || false,
        createdAt: item.created_at ? item.created_at.split('T')[0] : '2026-09-06',
        stats: item.stats || { views: 1, clicks: 0 }
      }));
    } catch (err) {
      console.warn('Network error reaching Supabase:', err);
      return null;
    }
  },

  // Insert a new product into Supabase
  async createProduct(product) {
    try {
      const payload = {
        id: product.id,
        name: product.name,
        tagline: product.tagline,
        category: product.category,
        description: product.description,
        url: product.url,
        icon: product.icon,
        icon_bg: product.iconBg || '#F5BA27',
        pricing: product.pricing || 'Freemium',
        upvotes: product.upvotes || 1,
        featured: product.featured || false,
        tier: product.tier || 'free',
        promoted: product.promoted || false,
        deal_has: product.deal ? product.deal.hasDeal : false,
        deal_text: product.deal ? product.deal.text : '',
        deal_code: product.deal ? product.deal.code : '',
        testers_wanted: product.testersWanted || false,
        tester_spots: product.testerSpots || 10,
        tester_claimed: product.testerClaimed || 0,
        tester_reward: product.testerReward || '',
        founder: product.founder || 'Maker',
        tags: product.tags || []
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('Failed to insert into Supabase products table.');
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Error inserting into Supabase:', err);
      return false;
    }
  },

  // Update upvotes in Supabase
  async updateUpvotes(productId, count) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ upvotes: count })
      });
    } catch (e) {
      // Non-blocking
    }
  },

  // Insert beta feedback
  async createFeedback(productId, feedback) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          product_id: productId,
          user_name: feedback.user,
          user_email: feedback.email,
          rating: feedback.rating,
          good: feedback.good,
          bad: feedback.bad
        })
      });
    } catch (e) {
      // Non-blocking
    }
  }
};
