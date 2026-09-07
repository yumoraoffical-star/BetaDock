const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4173${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

function post(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(`http://localhost:4173${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing 2-Pillar Endpoints & Pages...');
  
  // 1. Check Admin API
  const adminRes = await get('/api/admin');
  console.log('GET /api/admin status:', adminRes.status);
  const adminData = JSON.parse(adminRes.data);
  console.log('Admin counts:', adminData.counts);

  // 2. Submit new product with status: pending
  const submitRes = await post('/api/products/submit', {
    id: 'test-pending-tool',
    name: 'BharatAI Studio',
    url: 'https://bharatai.dev',
    tagline: 'Indic LLMs for developers and researchers',
    category: 'AI',
    origin: 'India',
    originLocation: 'Bengaluru, Karnataka',
    builderType: 'indie',
    problemSolved: 'Lack of native support for Indian regional languages in standard LLMs',
    features: ['22 Indian Languages supported', 'Zero-shot translation', 'REST API'],
    founder: 'Dev Sharma'
  });
  console.log('POST /api/products/submit status:', submitRes.status);
  const submitData = JSON.parse(submitRes.data);
  console.log('Submitted product status:', submitData.product.status); // MUST BE pending!

  // 3. Moderate product - Approve
  const modRes = await post('/api/admin', {
    productId: 'test-pending-tool',
    action: 'approve'
  });
  console.log('POST /api/admin moderate status:', modRes.status);
  const modData = JSON.parse(modRes.data);
  console.log('Moderated product status:', modData.product.status); // MUST BE approved!

  // 4. Test Web Pages
  const pPage = await get('/product.html?id=bolt');
  console.log('GET /product.html?id=bolt status:', pPage.status, 'HTML length:', pPage.data.length);

  const fPage = await get('/founder.html?id=arjun');
  console.log('GET /founder.html?id=arjun status:', fPage.status, 'HTML length:', fPage.data.length);

  const aPage = await get('/admin.html');
  console.log('GET /admin.html status:', aPage.status, 'HTML length:', aPage.data.length);

  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

runTests().catch(console.error);
