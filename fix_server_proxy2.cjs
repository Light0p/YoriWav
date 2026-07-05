const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newProxy = `
app.get("/api/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "Missing url" });
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace(/app\.get\("\/api\/proxy", async \(req, res\) => \{[\s\S]*?\}\);/, newProxy.trim());
fs.writeFileSync('server.ts', code);
