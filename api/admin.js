/**
 * BETADOCK SERVERLESS ADMIN MODERATION & APPROVAL ENGINE
 * Handles server-side submission verification and admin review workflow:
 * SUBMITTED -> PENDING -> ADMIN REVIEW -> APPROVED -> LIVE
 */

const fs = require('fs');
const path = require('path');

// In-memory / persisted moderation store fallback
let memoryProducts = null;

function loadInitialProducts() {
  if (memoryProducts) return memoryProducts;
  try {
    const dataPath = path.join(__dirname, '..', 'public', 'js', 'data.js');
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      const match = content.match(/const\s+PRODUCTS_DATA\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        // Safe evaluation of initial product seed data
        memoryProducts = eval(match[1]);
        return memoryProducts;
      }
    }
  } catch (err) {
    console.error('Error loading initial products for admin:', err.message);
  }
  memoryProducts = [];
  return memoryProducts;
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const products = loadInitialProducts();

  // 1. GET /api/admin/products - List products with status counts
  if (req.method === 'GET') {
    const statusFilter = url.searchParams.get('status');
    let filtered = products;
    if (statusFilter && statusFilter !== 'all') {
      filtered = products.filter(p => (p.status || 'approved') === statusFilter);
    }

    const counts = {
      total: products.length,
      pending: products.filter(p => p.status === 'pending').length,
      approved: products.filter(p => (p.status || 'approved') === 'approved').length,
      rejected: products.filter(p => p.status === 'rejected').length,
      needs_revision: products.filter(p => p.status === 'needs_revision').length
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, counts, products: filtered }));
    return;
  }

  // Parse Body for POST requests
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const payload = body ? JSON.parse(body) : {};

      // 2. POST /api/admin/moderate - Approve, Reject, or Request Changes
      if (payload.action && payload.productId) {
        const prod = products.find(p => p.id === payload.productId);
        if (!prod) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Product not found' }));
          return;
        }

        if (payload.action === 'approve') {
          prod.status = 'approved';
          prod.approvedAt = new Date().toISOString();
        } else if (payload.action === 'reject') {
          prod.status = 'rejected';
          prod.rejectedAt = new Date().toISOString();
          prod.moderationNotes = payload.notes || 'Listing did not meet guidelines';
        } else if (payload.action === 'request_changes') {
          prod.status = 'needs_revision';
          prod.moderationNotes = payload.notes || 'Please provide more details';
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Product ${prod.name} marked as ${prod.status}`,
          product: prod
        }));
        return;
      }

      // 3. POST /api/products/submit - New Submission Enforcing Status: 'pending'
      if (payload.name && payload.url) {
        const newProduct = {
          id: payload.id || `ld-${Date.now()}`,
          name: payload.name.trim(),
          url: payload.url.trim(),
          tagline: (payload.tagline || '').trim(),
          category: payload.category || 'AI',
          description: payload.description || payload.tagline || '',
          problemSolved: payload.problemSolved || '',
          features: payload.features || [],
          screenshots: payload.screenshots || [],
          icon: payload.icon || '🚀',
          iconBg: payload.iconBg || '#F5BA27',
          pricing: payload.pricing || 'Freemium',
          upvotes: payload.tier === 'fast-track' ? 45 : 1,
          featured: payload.tier === 'fast-track' || payload.tier === 'pro',
          status: 'pending', // Strictly enforce pending status!
          origin: payload.origin || 'India',
          originLocation: payload.originLocation || '',
          builderType: payload.builderType || 'indie',
          founder: payload.founder || 'Maker',
          founderId: payload.founderId || (payload.founder ? payload.founder.toLowerCase().replace(/\s+/g, '-') : 'maker'),
          tags: payload.tags || [payload.category],
          createdAt: new Date().toISOString().split('T')[0],
          comments: []
        };

        products.unshift(newProduct);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Product submitted successfully. Status is PENDING admin review.',
          product: newProduct
        }));
        return;
      }

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid moderation action or submission payload' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  });
};
