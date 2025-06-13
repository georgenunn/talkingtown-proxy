const express = require('express');
const fetch = require('node-fetch');
const zlib = require('zlib');
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

    const encoding = response.headers.get('content-encoding');
    const buffer = await response.buffer();

    if (encoding === 'gzip') {
      zlib.gunzip(buffer, (err, decoded) => {
        if (err) {
          res.status(500).send("Failed to decompress gzip response: " + err.message);
        } else {
          res.status(response.status).send(decoded.toString());
        }
      });
    } else {
      res.status(response.status).send(buffer.toString());
    }

  } catch (err) {
    res.status(500).send('Proxy error: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Proxy running on port ${port}`);
});
