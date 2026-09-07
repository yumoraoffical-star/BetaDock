const STORAGE_KEY = 'betadock_products_v2';
const VOTES_KEY = 'betadock_user_votes_v2';

const INITIAL_PRODUCTS = [
  {
    id: 'youmika',
    name: 'Youmika',
    tagline: 'Autonomous AI marketing and multi-channel launch engine for makers and startups.',
    category: 'AI Tools',
    icon: '⚡',
    iconBg: '#10B981',
    pricing: 'Freemium',
    url: 'https://youmika.site',
    upvotes: 48,
    rank: 1,
    featured: true,
    isPodium: true,
    deal: {
      hasDeal: true,
      text: 'Lifetime Free Starter Tier for Early Founders',
      code: 'YOUMIKA100'
    },
    testersWanted: true,
    testerSpots: 10,
    testerClaimed: 3,
    testerReward: '🎁 Free Pro Tier Access for 6 Months',
    feedbacks: [],
    description: 'Youmika automates founder marketing by generating high-converting Twitter hooks, Reddit launch posts, LinkedIn thought-leadership stories, and positioning strategy in under 60 seconds.',
    founder: 'Abhishek Megwansi',
    tags: ['AI Marketing', 'Launch', 'SaaS', 'Automation'],
    createdAt: '2026-09-07',
    stats: { views: 1840, clicks: 490 }
  },
  {
    id: 'betadock',
    name: 'BetaDock',
    tagline: 'Submit once. Launch everywhere. AI-powered product discovery and command center.',
    category: 'DevTools',
    icon: '🚀',
    iconBg: '#F5BA27',
    pricing: 'Free',
    url: 'https://betadock.youmika.site',
    upvotes: 42,
    rank: 2,
    featured: true,
    isPodium: true,
    deal: {
      hasDeal: true,
      text: 'Free Listing for Next 100 Founders',
      code: 'LAUNCHFREE'
    },
    testersWanted: true,
    testerSpots: 10,
    testerClaimed: 4,
    testerReward: '🎁 Verified Founder Badge on Listing',
    feedbacks: [],
    description: 'BetaDock is the next-generation launchpad connecting early-stage makers with genuine beta testers, daily leaderboard competition, and multi-channel AI marketing tools.',
    founder: 'BetaDock Team',
    tags: ['Directory', 'ProductHunt', 'Marketing', 'IndieHacker'],
    createdAt: '2026-09-07',
    stats: { views: 2450, clicks: 680 }
  },
  {
    id: 'cursor',
    name: 'Cursor',
    tagline: 'The AI-first code editor built for lightning-fast pair programming and refactoring.',
    category: 'DevTools',
    icon: '💻',
    iconBg: '#3B82F6',
    pricing: 'Freemium',
    url: 'https://cursor.com',
    upvotes: 38,
    rank: 3,
    featured: true,
    isPodium: true,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    testersWanted: false,
    description: 'Cursor is a fork of VS Code with deep AI integration. Chat with your entire codebase, edit multiple lines at once, and generate full features seamlessly.',
    founder: 'Anysphere',
    tags: ['AI Code', 'IDE', 'Developer', 'Productivity'],
    createdAt: '2026-09-01',
    stats: { views: 3200, clicks: 890 }
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    tagline: 'Where knowledge begins. Conversational AI search engine with live web citations.',
    category: 'AI Tools',
    icon: '🔍',
    iconBg: '#6366F1',
    pricing: 'Freemium',
    url: 'https://perplexity.ai',
    upvotes: 35,
    rank: 4,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    testersWanted: false,
    description: 'Perplexity gives direct answers with trusted sources cited in real-time. Eliminates endless Google link browsing for researchers and builders.',
    founder: 'Aravind Srinivas',
    tags: ['Search', 'Research', 'AI', 'Knowledge'],
    createdAt: '2026-08-30',
    stats: { views: 2800, clicks: 640 }
  },
  {
    id: 'supabase',
    name: 'Supabase',
    tagline: 'The open-source Firebase alternative with PostgreSQL, Auth, and Edge Functions.',
    category: 'DevTools',
    icon: '⚡',
    iconBg: '#10B981',
    pricing: 'Freemium',
    url: 'https://supabase.com',
    upvotes: 31,
    rank: 5,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    testersWanted: false,
    description: 'Build backend architectures in minutes with a dedicated Postgres database, authentication, instant REST/GraphQL APIs, and real-time subscriptions.',
    founder: 'Paul Copplestone',
    tags: ['Database', 'Postgres', 'Backend', 'OpenSource'],
    createdAt: '2026-08-25',
    stats: { views: 2400, clicks: 520 }
  },
  {
    id: 'posthog',
    name: 'PostHog',
    tagline: 'Open-source product analytics, session recordings, feature flags, and A/B testing.',
    category: 'Analytics',
    icon: '🦔',
    iconBg: '#EC4899',
    pricing: 'Freemium',
    url: 'https://posthog.com',
    upvotes: 28,
    rank: 6,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    testersWanted: false,
    description: 'Understand user behaviors on your SaaS app with high-definition session replays, custom conversion funnels, and automated event tracking.',
    founder: 'James Hawkins',
    tags: ['Analytics', 'Product', 'SessionReplay', 'Growth'],
    createdAt: '2026-08-20',
    stats: { views: 1980, clicks: 430 }
  },
  {
    id: 'calcom',
    name: 'Cal.com',
    tagline: 'Open-source, customizable scheduling infrastructure for founders and teams.',
    category: 'Productivity',
    icon: '📅',
    iconBg: '#F59E0B',
    pricing: 'Freemium',
    url: 'https://cal.com',
    upvotes: 24,
    rank: 7,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    testersWanted: false,
    description: 'White-label calendar booking links that integrate with Google Calendar, Zoom, Stripe, and Webhooks. Take control of your daily schedule.',
    founder: 'Peer Richelsen',
    tags: ['Calendar', 'Meetings', 'Productivity', 'OpenSource'],
    createdAt: '2026-08-15',
    stats: { views: 1650, clicks: 380 }
  },
  {
    id: 'resend',
    name: 'Resend',
    tagline: 'The modern email API for developers. Deliver transactional emails with React templates.',
    category: 'Marketing',
    icon: '✉️',
    iconBg: '#8B5CF6',
    pricing: 'Freemium',
    url: 'https://resend.com',
    upvotes: 21,
    rank: 8,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    testersWanted: false,
    description: 'Clean REST API and SDKs for sending onboarding emails, password resets, and newsletters with 99.9% inbox deliverability.',
    founder: 'Zeno Rocha',
    tags: ['Email', 'Developer', 'API', 'Marketing'],
    createdAt: '2026-08-10',
    stats: { views: 1520, clicks: 310 }
  }
];

// Storage helpers
function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getUserVotes() {
  const saved = localStorage.getItem(VOTES_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

function saveUserVotes(votes) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}
