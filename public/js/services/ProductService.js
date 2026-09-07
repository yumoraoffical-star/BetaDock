/**
 * PRODUCT SERVICE
 * Unified data layer for BetaDock products.
 * Bridges mock seeds, localStorage, and Supabase cloud.
 */

const ProductService = {
  // Get all products (syncing with Supabase if available)
  async getAllProducts() {
    // Try Supabase first if online and available
    if (typeof SupabaseClient !== 'undefined') {
      try {
        const cloudProducts = await SupabaseClient.getProducts();
        if (cloudProducts && cloudProducts.length > 0) {
          saveProducts(cloudProducts);
          return cloudProducts;
        }
      } catch (e) {
        console.warn('ProductService: Using local storage fallback.');
      }
    }
    return getProducts();
  },

  // Get single product by ID
  getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id) || null;
  },

  // Get products by category
  getProductsByCategory(category) {
    const products = getProducts();
    if (!category || category === 'all') return products;
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  },

  // Curated collections
  getCollections() {
    const products = getProducts();
    return [
      {
        id: 'col-ai',
        title: '🤖 AI Solopreneur Toolkit',
        tagline: 'Autonomous agents and workflows to run a 1-person software business.',
        count: 4,
        products: products.filter(p => p.category === 'AI Tools' || (p.tags && p.tags.includes('Automation')))
      },
      {
        id: 'col-dev',
        title: '🛠️ Developer Productivity Stack',
        tagline: 'High-leverage developer utilities, documentation tools, and debuggers.',
        count: 3,
        products: products.filter(p => p.category === 'DevTools')
      },
      {
        id: 'col-growth',
        title: '📈 SaaS Growth & Revenue Engine',
        tagline: 'Analytics, Stripe forecasting, and high-conversion ad engines.',
        count: 3,
        products: products.filter(p => p.category === 'Analytics' || p.category === 'Marketing' || p.category === 'Fintech')
      }
    ];
  },

  // Save or update product
  async saveProduct(product) {
    const products = getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...product };
    } else {
      products.unshift(product);
    }

    saveProducts(products);

    // Sync to Supabase if available
    if (typeof SupabaseClient !== 'undefined') {
      try {
        await SupabaseClient.createProduct(product);
      } catch (e) {
        // Non-blocking
      }
    }

    return product;
  }
};
