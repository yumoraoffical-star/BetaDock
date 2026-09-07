const https = require('https');

// Helper to load .env if running standalone
function loadEnv() {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        val = val.trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}
loadEnv();

function getRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function extractJson(str) {
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(str.substring(start, end + 1));
  }
  return JSON.parse(str.replace(/```json/g, '').replace(/```/g, '').trim());
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const data = await getRequestBody(req);
    const productUrl = data.url || 'https://example.com';
    const productName = data.name || 'Your Product';
    const category = data.category || 'AI Tools';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server' }));
      return;
    }

    const prompt = `You are a product marketing strategist. Analyze the product URL: "${productUrl}".
Generate a high-converting launch strategy in valid JSON with these exact keys:
{
  "name": "${productName}",
  "tagline": "A punchy 1-sentence value proposition",
  "description": "2-sentence compelling description",
  "whatItDoes": "Core functionality breakdown",
  "targetAudience": "Specific buyer persona",
  "problemSolved": "Key frustration eliminated",
  "usp": "Unique selling proposition / Moat",
  "category": "${category}",
  "pricing": "Freemium / Free / Pro",
  "competitors": ["Comp 1", "Comp 2", "Comp 3", "Comp 4"],
  "suggestedPositioning": "Strategic market positioning hook"
}
Return ONLY the raw JSON object, no markdown code fences.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    });

    const geminiReq = https.request(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (geminiRes) => {
      let raw = '';
      geminiRes.on('data', chunk => { raw += chunk; });
      geminiRes.on('end', () => {
        try {
          const parsedRes = JSON.parse(raw);
          const aiText = parsedRes.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!aiText) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Gemini did not return text', details: raw }));
            return;
          }

          const resultJson = extractJson(aiText);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(resultJson));
        } catch (e) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to parse Gemini output', raw }));
        }
      });
    });

    geminiReq.on('error', (err) => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    });

    geminiReq.write(payload);
    geminiReq.end();

  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message }));
  }
};
