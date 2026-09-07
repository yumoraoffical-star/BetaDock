const STORAGE_KEY = 'betadock_products_v1';
const VOTES_KEY = 'betadock_user_votes_v1';

const INITIAL_PRODUCTS = [
  {
    id: 'ld-1',
    name: 'OmniFlow AI',
    tagline: 'Autonomous AI workflows that turn prompt chains into real production apps.',
    category: 'AI Tools',
    icon: '⚡',
    iconBg: '#3B82F6',
    pricing: 'Freemium',
    url: 'https://omniflow.example.com',
    upvotes: 384,
    rank: 1,
    featured: true,
    isPodium: true,
    deal: {
      hasDeal: true,
      text: '35% OFF First 3 Months',
      code: 'DOCK35'
    },
    testersWanted: true,
    testerSpots: 10,
    testerClaimed: 7,
    testerReward: '🎁 Free 6-Month Pro Account ($180 value)',
    feedbacks: [
      {
        user: 'Sahil K.',
        rating: 5,
        good: 'The prompt chaining builder works flawlessly without lag.',
        bad: 'Would love an export button for Docker compose.',
        date: '2026-09-05'
      },
      {
        user: 'Dev Priya',
        rating: 4,
        good: 'Clean dark UI and instant API keys setup.',
        bad: 'Needs more documentation on Webhook callbacks.',
        date: '2026-09-04'
      }
    ],
    description: 'OmniFlow AI connects with your APIs, databases, and LLM keys to orchestrate self-healing pipelines in real-time. Built for agile development teams and solo makers.',
    founder: 'Aryan Sharma',
    tags: ['AI Agents', 'Automation', 'Workflow', 'Developer'],
    createdAt: '2026-09-04',
    stats: { views: 4820, clicks: 1240 }
  },
  {
    id: 'ld-2',
    name: 'SaaSmetrics Pro',
    tagline: 'Stripe analytics and MRR churn forecasting engineered for bootstrapped startups.',
    category: 'Analytics',
    icon: '📊',
    iconBg: '#10B981',
    pricing: 'Freemium',
    url: 'https://saasmetrics.example.com',
    upvotes: 329,
    rank: 2,
    featured: true,
    isPodium: true,
    deal: {
      hasDeal: true,
      text: 'Extended 30-Day Free Trial',
      code: 'LAUNCHMETRICS'
    },
    description: 'Real-time cohort retention, lifetime value predictions, and benchmark comparisons with zero setup required. Connect your Stripe account in 60 seconds.',
    founder: 'Elena Rostova',
    tags: ['SaaS', 'Stripe', 'Revenue', 'MRR'],
    createdAt: '2026-09-03',
    stats: { views: 3950, clicks: 980 }
  },
  {
    id: 'ld-3',
    name: 'DocuCraft Studio',
    tagline: 'Turn markdown notes into interactive documentation sites with instant search.',
    category: 'DevTools',
    icon: '🛠️',
    iconBg: '#F59E0B',
    pricing: 'Free',
    url: 'https://docucraft.example.com',
    upvotes: 295,
    rank: 3,
    featured: true,
    isPodium: true,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    description: 'Blazing fast static documentation builder powered by WebAssembly. Includes automatic Algolia search indexation and git-based versioning.',
    founder: 'Marcus Vance',
    tags: ['Docs', 'Markdown', 'Open Source', 'DevTools'],
    createdAt: '2026-09-02',
    stats: { views: 3100, clicks: 820 }
  },
  {
    id: 'ld-4',
    name: 'PixelForge UI',
    tagline: 'Figma-to-code component engine that spits out clean vanilla CSS & React.',
    category: 'Design',
    icon: '🎨',
    iconBg: '#EC4899',
    pricing: 'Freemium',
    url: 'https://pixelforge.example.com',
    upvotes: 218,
    featured: false,
    deal: {
      hasDeal: true,
      text: '20% Lifetime Discount',
      code: 'PIXEL20'
    },
    testersWanted: true,
    testerSpots: 10,
    testerClaimed: 3,
    testerReward: '🎨 1-Year Free Pro License ($120 value)',
    feedbacks: [
      {
        user: 'Rohit Verma',
        rating: 5,
        good: 'Vanilla CSS export is super clean without messy utility classes.',
        bad: 'Nested auto-layout groups sometimes lose flex basis.',
        date: '2026-09-02'
      }
    ],
    description: 'Stop hand-coding standard UI components. PixelForge exports atomic, production-ready design tokens and accessible React components directly from Figma frames.',
    founder: 'Nora Chen',
    tags: ['Figma', 'UI/UX', 'Design System', 'Frontend'],
    createdAt: '2026-09-01',
    stats: { views: 2450, clicks: 540 }
  },
  {
    id: 'ld-5',
    name: 'BugSentry Live',
    tagline: 'Real-time exception replay and session recording for Next.js & Node apps.',
    category: 'DevTools',
    icon: '🐛',
    iconBg: '#EF4444',
    pricing: 'Freemium',
    url: 'https://bugsentry.example.com',
    upvotes: 194,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    description: 'Watch video replays of user errors before they hit your customer support. Ultra-lightweight script weighing less than 12KB with zero frame drops.',
    founder: 'David Kim',
    tags: ['Debugging', 'Monitoring', 'Next.js', 'Telemetry'],
    createdAt: '2026-08-31',
    stats: { views: 2100, clicks: 430 }
  },
  {
    id: 'ld-6',
    name: 'CopyPulse AI',
    tagline: 'High-converting ad copy and landing page generator trained on $50M in sales.',
    category: 'Marketing',
    icon: '✍️',
    iconBg: '#8B5CF6',
    pricing: 'Paid',
    url: 'https://copypulse.example.com',
    upvotes: 182,
    featured: true,
    deal: {
      hasDeal: true,
      text: 'Get 50,000 Bonus Words',
      code: 'LAUNCHBONUS'
    },
    description: 'Generate Facebook ads, Google search ads, and persuasive landing page sections tailored to your target niche. Includes A/B test variation suggestions.',
    founder: 'Sarah Jenkins',
    tags: ['Copywriting', 'Marketing', 'AI', 'Growth'],
    createdAt: '2026-08-30',
    stats: { views: 1890, clicks: 410 }
  },
  {
    id: 'ld-7',
    name: 'MailHarbor',
    tagline: 'Transactional email sandbox and API inspector for developers.',
    category: 'DevTools',
    icon: '✉️',
    iconBg: '#06B6D4',
    pricing: 'Free',
    url: 'https://mailharbor.example.com',
    upvotes: 167,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    description: 'Test transactional email templates, inspect spam scores, and preview responsive layouts across 40+ email clients without spamming your real inbox.',
    founder: 'Vikram Patel',
    tags: ['Email', 'API', 'Developer', 'Testing'],
    createdAt: '2026-08-29',
    stats: { views: 1720, clicks: 390 }
  },
  {
    id: 'ld-8',
    name: 'FocusOrb',
    tagline: 'Minimalist Pomodoro timer with dynamic ambient soundscapes and lo-fi beats.',
    category: 'Productivity',
    icon: '🎧',
    iconBg: '#14B8A6',
    pricing: 'Free',
    url: 'https://focusorb.example.com',
    upvotes: 154,
    featured: false,
    deal: {
      hasDeal: false,
      text: '',
      code: ''
    },
    description: 'Boost your deep work sessions with beautifully synthesized binaural beats, forest rain audio, and intuitive micro-break notifications.',
    founder: 'Liam O’Connor',
    tags: ['Productivity', 'Focus', 'Audio', 'Wellness'],
    createdAt: '2026-08-28',
    stats: { views: 1540, clicks: 320 }
  },
  {
    id: 'ld-9',
    name: 'PayFlow Global',
    tagline: 'Accept crypto, UPI, and global cards with one modular drop-in checkout SDK.',
    category: 'Fintech',
    icon: '💳',
    iconBg: '#6366F1',
    pricing: 'Freemium',
    url: 'https://payflow.example.com',
    upvotes: 142,
    featured: true,
    deal: {
      hasDeal: true,
      text: '0% Processing Fees on First $5k',
      code: 'LAUNCHZERO'
    },
    description: 'Localized payment rails for cross-border software creators. Automatic VAT/GST compliance and payouts in 140+ countries.',
    founder: 'Carlos Mendez',
    tags: ['Payments', 'Checkout', 'Fintech', 'SaaS'],
    createdAt: '2026-08-27',
    stats: { views: 1420, clicks: 290 }
  }
];

// Initialize Storage if empty
function getProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(saved);
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
