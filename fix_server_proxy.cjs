const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const proxyEndpoint = `
app.get("/api/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "Missing url" });
  try {
    const response = await fetch(targetUrl);
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

if (!code.includes('/api/proxy')) {
  code = code.replace('// Vite middleware for development', proxyEndpoint + '\n  // Vite middleware for development');
  fs.writeFileSync('server.ts', code);
}
