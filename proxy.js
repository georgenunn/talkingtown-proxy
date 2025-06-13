const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

const SOCCERDATA_API_KEY = process.env.SOCCERDATA_API_KEY;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/proxy', async (req, res) => {
  const { path, ...query } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path param' });

  const queryParams = new URLSearchParams(query).toString();
  const url = `https://api.soccerdataapi.com/${path}/?${queryParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': SOCCERDATA_API_KEY
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});