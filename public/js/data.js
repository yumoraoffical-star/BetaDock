const STORAGE_KEY = 'betadock_products_v3';
const VOTES_KEY = 'betadock_user_votes_v3';
const COMMENTS_KEY = 'betadock_comments_v3';

const INITIAL_PRODUCTS = [
  {
    id: 'youmika',
    name: 'Youmika',
    tagline: 'Autonomous AI marketing and multi-channel launch engine for makers and startups.',
    category: 'AI',
    icon: '⚡',
    iconBg: '#10B981',
    pricing: 'Freemium',
    url: 'https://youmika.site',
    upvotes: 48,
    rank: 1,
    featured: true,
    isPodium: true,
    status: 'approved',
    origin: 'India',
    originLocation: 'Maharashtra, India',
    builderType: 'startup',
    problemSolved: 'Makers spend 80% of their time struggling to write marketing copy across Reddit, Twitter, and LinkedIn instead of building their product. Youmika automates high-converting multi-channel distribution in under 60 seconds.',
    features: [
      'Multi-channel AI copy generation (X threads, Reddit posts, LinkedIn stories)',
      'Automated 7-day launch schedule blueprint with actionable steps',
      'Target persona & Ideal Customer Profile (ICP) discovery',
      'Instant OpenGraph social assets and visual canvas generator'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ],
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
    founder: 'Abhishek',
    founderId: 'abhishek',
    founderProfile: {
      id: 'abhishek',
      name: 'Abhishek',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Abhishek&backgroundColor=10b981',
      bio: 'Full-stack AI developer & founder of Youmika and BetaDock. Passionate about empowering indie makers across India & worldwide.',
      location: 'Maharashtra, India',
      isIndia: true,
      website: 'https://youmika.site',
      twitter: 'https://x.com',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      launchesCount: 2,
      upvotesCount: 90
    },
    tags: ['#GenerativeAI', '#Marketing', '#SaaS', '#Automation'],
    createdAt: '2026-09-07',
    stats: { views: 1840, clicks: 490 },
    comments: [
      {
        id: 'c-1',
        user: 'Vikram Sharma',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram&backgroundColor=38bdf8',
        comment: 'Brilliant launch engine! The Reddit launch prompt saved our team at least 4 days of writing.',
        date: '2026-09-07',
        isFounderReply: false
      },
      {
        id: 'c-2',
        user: 'Abhishek (Maker)',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Abhishek&backgroundColor=10b981',
        comment: 'Thanks Vikram! The next update includes automated subreddit discovery based on your product niche.',
        date: '2026-09-07',
        isFounderReply: true
      }
    ]
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
    status: 'approved',
    origin: 'India',
    originLocation: 'India',
    builderType: 'indie',
    problemSolved: 'Early-stage builders lack high-authority discovery, genuine beta testers, and automated launch marketing. BetaDock unifies discovery and launch into one seamless platform.',
    features: [
      'Dual-pillar platform: Discover trending tools + Automated AI Launch Studio',
      'Daily Dock Race podium with velocity-based rankings',
      'Verified beta tester recruitment hub with founder rewards',
      'Embeddable live badges for landing pages and GitHub repositories'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ],
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
    founder: 'Abhishek',
    founderId: 'abhishek',
    founderProfile: {
      id: 'abhishek',
      name: 'Abhishek',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Abhishek&backgroundColor=10b981',
      bio: 'Full-stack AI developer & founder of Youmika and BetaDock. Passionate about empowering indie makers across India & worldwide.',
      location: 'Maharashtra, India',
      isIndia: true,
      website: 'https://youmika.site',
      twitter: 'https://x.com',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      launchesCount: 2,
      upvotesCount: 90
    },
    tags: ['#Directory', '#ProductHunt', '#Marketing', '#IndieHacker'],
    createdAt: '2026-09-07',
    stats: { views: 2450, clicks: 680 },
    comments: [
      {
        id: 'c-3',
        user: 'Pooja Iyer',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Pooja&backgroundColor=f5ba27',
        comment: 'Love the Made in India spotlight and the speed of the AI extraction! Best Product Hunt alternative so far.',
        date: '2026-09-07',
        isFounderReply: false
      }
    ]
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
    status: 'approved',
    origin: 'Global',
    originLocation: 'San Francisco, USA',
    builderType: 'startup',
    problemSolved: 'Traditional IDEs lack deep contextual understanding of complete multi-file codebases, slowing down modern engineering velocity.',
    features: [
      'Full codebase semantic indexing and chat',
      'Multi-line AI inline edits and intelligent refactoring',
      'One-click VS Code extension compatibility and keybindings'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    ],
    deal: { hasDeal: false, text: '', code: '' },
    testersWanted: false,
    description: 'Cursor is a fork of VS Code with deep AI integration. Chat with your entire codebase, edit multiple lines at once, and generate full features seamlessly.',
    founder: 'Anysphere',
    founderId: 'anysphere',
    founderProfile: {
      id: 'anysphere',
      name: 'Anysphere Team',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Anysphere&backgroundColor=3b82f6',
      bio: 'Building the future of software development through human-AI symbiosis.',
      location: 'San Francisco, USA',
      isIndia: false,
      website: 'https://cursor.com',
      twitter: 'https://x.com/cursor_ai',
      github: 'https://github.com/getcursor',
      launchesCount: 1,
      upvotesCount: 38
    },
    tags: ['#AICode', '#DevTools', '#Productivity', '#IDE'],
    createdAt: '2026-09-01',
    stats: { views: 3200, clicks: 890 },
    comments: []
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    tagline: 'Where knowledge begins. Conversational AI search engine with live web citations.',
    category: 'AI',
    icon: '🔍',
    iconBg: '#6366F1',
    pricing: 'Freemium',
    url: 'https://perplexity.ai',
    upvotes: 35,
    rank: 4,
    featured: false,
    status: 'approved',
    origin: 'Global',
    originLocation: 'San Francisco, USA',
    builderType: 'startup',
    problemSolved: 'Traditional web searches return lists of SEO-bloated links rather than direct, synthesized answers with trustworthy academic and live citations.',
    features: [
      'Real-time web search synthesis with clickable source citations',
      'Focus modes for academic papers, YouTube, Reddit, and computational queries',
      'Pro discovery collections and shareable research pages'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
    ],
    deal: { hasDeal: false, text: '', code: '' },
    testersWanted: false,
    description: 'Perplexity AI delivers direct answers with live source citations, real-time web discovery, and customized focus modes for students and researchers.',
    founder: 'Aravind Srinivas',
    founderId: 'aravind',
    founderProfile: {
      id: 'aravind',
      name: 'Aravind Srinivas',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Aravind&backgroundColor=6366f1',
      bio: 'Co-founder & CEO of Perplexity AI. Former researcher at OpenAI & DeepMind.',
      location: 'San Francisco, USA',
      isIndia: false,
      website: 'https://perplexity.ai',
      twitter: 'https://x.com/AravSrinivas',
      launchesCount: 1,
      upvotesCount: 35
    },
    tags: ['#Search', '#Research', '#AI', '#Knowledge'],
    createdAt: '2026-09-02',
    stats: { views: 2800, clicks: 710 },
    comments: []
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
    status: 'approved',
    origin: 'Global',
    originLocation: 'Singapore / Remote',
    builderType: 'opensource',
    problemSolved: 'Proprietary backend-as-a-service platforms lock developers into non-relational document databases without direct SQL flexibility.',
    features: [
      'Dedicated PostgreSQL database with row-level security (RLS)',
      'Instant REST and GraphQL APIs generated from database schema',
      'Realtime WebSocket subscriptions and scalable Edge Functions'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'
    ],
    deal: { hasDeal: false, text: '', code: '' },
    testersWanted: false,
    description: 'Build backend architectures in minutes with a dedicated Postgres database, authentication, instant REST/GraphQL APIs, and real-time subscriptions.',
    founder: 'Paul Copplestone',
    founderId: 'copplestone',
    founderProfile: {
      id: 'copplestone',
      name: 'Paul Copplestone',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Copplestone&backgroundColor=10b981',
      bio: 'Co-founder of Supabase. Open source advocate building open infrastructure.',
      location: 'Remote',
      isIndia: false,
      website: 'https://supabase.com',
      twitter: 'https://x.com/kiwicopple',
      github: 'https://github.com/supabase',
      launchesCount: 1,
      upvotesCount: 31
    },
    tags: ['#PostgreSQL', '#OpenSource', '#Backend', '#Database'],
    createdAt: '2026-09-03',
    stats: { views: 2100, clicks: 540 },
    comments: []
  },
  {
    id: 'v0-dev',
    name: 'v0 by Vercel',
    tagline: 'Generative UI system powered by AI. Generate responsive React and Tailwind components.',
    category: 'Design',
    icon: '🎨',
    iconBg: '#EC4899',
    pricing: 'Freemium',
    url: 'https://v0.dev',
    upvotes: 28,
    rank: 6,
    featured: false,
    status: 'approved',
    origin: 'Global',
    originLocation: 'San Francisco, USA',
    builderType: 'startup',
    problemSolved: 'Translating design thoughts into clean, accessible React + Tailwind code is time-consuming for product developers.',
    features: [
      'Generative UI from natural language prompts',
      'Clean JSX, React, and Tailwind CSS exports',
      'Figma import and version-controlled iterative design tweaks'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    ],
    deal: { hasDeal: false, text: '', code: '' },
    testersWanted: false,
    description: 'v0 creates production-grade user interfaces from natural language prompts, outputting modular React code with Tailwind CSS ready to paste into your app.',
    founder: 'Guillermo Rauch',
    founderId: 'rauchg',
    founderProfile: {
      id: 'rauchg',
      name: 'Guillermo Rauch',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rauch&backgroundColor=ec4899',
      bio: 'CEO of Vercel. Creator of Next.js and socket.io.',
      location: 'San Francisco, USA',
      isIndia: false,
      website: 'https://vercel.com',
      twitter: 'https://x.com/rauchg',
      launchesCount: 1,
      upvotesCount: 28
    },
    tags: ['#React', '#UI', '#Design', '#Tailwind'],
    createdAt: '2026-09-04',
    stats: { views: 1950, clicks: 430 },
    comments: []
  },
  {
    id: 'student-devfolio',
    name: 'CampusForge',
    tagline: 'Collaborative student workspace for hackathons, project teams, and campus startups.',
    category: 'Student Projects',
    icon: '🎓',
    iconBg: '#F59E0B',
    pricing: 'Free',
    url: 'https://campusforge.dev',
    upvotes: 26,
    rank: 7,
    featured: false,
    status: 'approved',
    origin: 'India',
    originLocation: 'Bengaluru, India',
    builderType: 'student',
    problemSolved: 'Student engineering teams struggle to find teammates with matching tech stacks for hackathons and college capstone projects.',
    features: [
      'Automated hackathon team matching based on GitHub skill graph',
      'Integrated project workspace with kanban and task assignments',
      'Direct showcase portfolio for campus recruiters'
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
    ],
    deal: {
      hasDeal: true,
      text: 'Free Verified Student Builder Pass',
      code: 'STUDENT2026'
    },
    testersWanted: true,
    testerSpots: 15,
    testerClaimed: 8,
    testerReward: '🎁 Free Hackathon Starter Kit + Swag Box',
    feedbacks: [],
    description: 'Built by college students in Bengaluru, CampusForge is an open collaborative ecosystem for engineering students to build, launch, and showcase side projects.',
    founder: 'Rohan Deshmukh',
    founderId: 'rohan-dev',
    founderProfile: {
      id: 'rohan-dev',
      name: 'Rohan Deshmukh',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rohan&backgroundColor=f59e0b',
      bio: 'Final year CS undergrad & campus builder. Building platforms for next-gen student coders.',
      location: 'Bengaluru, India',
      isIndia: true,
      website: 'https://campusforge.dev',
      twitter: 'https://x.com',
      github: 'https://github.com',
      launchesCount: 1,
      upvotesCount: 26
    },
    tags: ['#StudentProjects', '#Education', '#Hackathons', '#MadeInIndia'],
    createdAt: '2026-09-06',
    stats: { views: 1400, clicks: 390 },
    comments: []
  }
];

// Product Data Service
function getProducts() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn('Cache parse error, restoring default catalog.');
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getUserVotes() {
  const cached = localStorage.getItem(VOTES_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveUserVotes(votes) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

// Time-Weighted Velocity Trending Score Calculator
// Uses HackerNews/Reddit Gravity Decay Formula:
// Score = (Upvotes * 3 + Comments * 2 + Views * 0.1) / (Hours_Since_Launch + 2)^1.3
function calculateTrendingScore(product, timeframe = 'today') {
  const upvotes = product.upvotes || 0;
  const commentsCount = (product.comments && product.comments.length) || 0;
  const views = (product.stats && product.stats.views) || 0;
  
  if (timeframe === 'all-time') {
    return upvotes * 10 + commentsCount * 5 + views;
  }
  
  const createdDate = new Date(product.createdAt || '2026-09-01');
  const now = new Date();
  const hoursSinceLaunch = Math.max(0, (now - createdDate) / (1000 * 60 * 60));
  
  const gravity = timeframe === 'today' ? 1.4 : 1.1;
  const engagement = (upvotes * 3) + (commentsCount * 2) + (views * 0.1);
  return engagement / Math.pow(hoursSinceLaunch + 2, gravity);
}

// Export for module systems or window globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    INITIAL_PRODUCTS,
    getProducts,
    saveProducts,
    getUserVotes,
    saveUserVotes,
    calculateTrendingScore
  };
}
