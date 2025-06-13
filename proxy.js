const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

const SOCCERDATA_API_KEY = process.env.SOCCERDATA_API_KEY;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/proxy', async (req, res) => {
  const { path, ...query } = req.query;
  if (!path) return res.status(400).json({ error: "Missing 'path' query parameter" });

  const queryParams = new URLSearchParams(query).toString();
  const url = `https://api.soccerdataapi.com/${path}/?${queryParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': SOCCERDATA_API_KEY,
        'Accept-Encoding': 'gzip'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});
