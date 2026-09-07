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

// Scrape live HTML metadata & headings from user's product URL
function fetchWebsiteMetadata(targetUrl) {
  return new Promise((resolve) => {
    try {
      let parsedUrl;
      try {
        parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      } catch (e) {
        resolve('No URL metadata available.');
        return;
      }

      const client = parsedUrl.protocol === 'http:' ? require('http') : require('https');
      const req = client.get(parsedUrl.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BetaDockBot/1.0; +https://betadock.youmika.site)',
          'Accept': 'text/html,application/xhtml+xml'
        },
        timeout: 4500
      }, (res) => {
        // Handle redirect
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          try {
            const redirectUrl = new URL(res.headers.location, parsedUrl.href);
            fetchWebsiteMetadata(redirectUrl.href).then(resolve);
            return;
          } catch (e) {
            // ignore
          }
        }

        let html = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          if (html.length < 30000) html += chunk;
        });
        res.on('end', () => {
          try {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : '';

            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i) ||
                              html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
            const description = descMatch ? descMatch[1].trim() : '';

            const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
            const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : '';

            // Extract h1 and h2
            const headings = [];
            const hMatch = html.matchAll(/<(h1|h2)[^>]*>([^<]+)<\/\1>/gi);
            for (const m of hMatch) {
              const text = m[2].replace(/\s+/g, ' ').trim();
              if (text && text.length > 3 && !headings.includes(text)) {
                headings.push(text);
                if (headings.length >= 4) break;
              }
            }

            const cleanText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                                  .replace(/<[^>]+>/g, ' ')
                                  .replace(/\s+/g, ' ')
                                  .trim()
                                  .substring(0, 800);

            const summary = [
              title ? `Page Title: ${title}` : '',
              ogTitle && ogTitle !== title ? `OG Title: ${ogTitle}` : '',
              description ? `Meta Description: ${description}` : '',
              headings.length ? `Headings: ${headings.join(' | ')}` : '',
              cleanText ? `Content Preview: ${cleanText}` : ''
            ].filter(Boolean).join('\n');

            resolve(summary || 'Site reached, but minimal meta content found.');
          } catch (e) {
            resolve('Could not parse site metadata.');
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve('Website request timed out.');
      });

      req.on('error', () => {
        resolve('Could not reach website directly.');
      });
    } catch (e) {
      resolve('Invalid URL.');
    }
  });
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

    // 1. Fetch real website metadata from productUrl
    const liveSiteContext = await fetchWebsiteMetadata(productUrl);

    const prompt = `You are an elite startup growth strategist and product positioning copywriter.
Analyze this real live product and website content:
URL: "${productUrl}"
Product Name: "${productName}"
Suggested Category: "${category}"

--- REAL LIVE WEBSITE CONTENT SCRAPED ---
${liveSiteContext}
-----------------------------------------

Generate a high-converting, accurate launch intelligence strategy in valid JSON with these exact keys:
{
  "name": "${productName}",
  "tagline": "A punchy 1-sentence value proposition based on the real site",
  "description": "2-sentence compelling description of what this product actually does",
  "whatItDoes": "Core functionality breakdown explaining real features",
  "targetAudience": "Specific buyer persona / user who desperately needs this",
  "problemSolved": "Key frustration or bottleneck this tool eliminates",
  "usp": "Unique selling proposition / Moat vs alternatives",
  "category": "${category}",
  "pricing": "Freemium / Free / Paid / Free Trial",
  "competitors": ["Realistic Competitor 1", "Competitor 2", "Competitor 3", "Competitor 4"],
  "suggestedPositioning": "Strategic market positioning hook for Twitter and ProductHunt"
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
