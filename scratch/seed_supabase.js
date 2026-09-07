// Script to seed initial products into Supabase once schema is applied
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://fszgqexkqbifqthuvkzw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzemdxZXhrcWJpZnF0aHV2a3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDU0MDAsImV4cCI6MjEwNDI4MTQwMH0.XBcaR5wAHjcnn4DIc76ic9DyCjb3NeCV5A6R_o_9Xj4';

// Read data.js to get INITIAL_PRODUCTS
const dataContent = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');

// Parse INITIAL_PRODUCTS using Function
const fn = new Function(dataContent + '; return INITIAL_PRODUCTS;');
const products = fn();

console.log(`Found ${products.length} products to seed into Supabase.`);

async function seed() {
  for (const product of products) {
    const payload = JSON.stringify({
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
      tier: product.tier || (product.featured ? 'fast-track' : 'free'),
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
    });

    await new Promise((resolve) => {
      const req = https.request(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        }
      }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          console.log(`[${res.statusCode}] Seeded: ${product.name}`);
          resolve();
        });
      });
      req.on('error', (e) => {
        console.error('Error seeding', product.name, e);
        resolve();
      });
      req.write(payload);
      req.end();
    });
  }
  console.log('Seeding complete!');
}

seed();
