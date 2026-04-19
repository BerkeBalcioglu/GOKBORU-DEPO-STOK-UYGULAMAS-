const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Local backup path
const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 1. Cloud Backup Proxy (POST)
app.post('/cloud-backup', async (req, res) => {
  const { url, payload } = req.body;
  
  if (!url || !payload) {
    return res.status(400).json({ success: false, message: 'URL veya veri eksik.' });
  }

  try {
    // Also save a local file backup as safety
    const localFile = path.join(BACKUP_DIR, `local_backup_${new Date().toISOString().slice(0,10)}.json`);
    fs.writeFileSync(localFile, JSON.stringify(payload, null, 2));

    // Proxy to Google Apps Script
    // We use axios because it handles redirects (302) automatically
    const response = await axios.post(url.trim(), payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ success: true, cloudResponse: response.data });
  } catch (error) {
    console.error('Cloud Backup Error:', error.message);
    // If Google fails, we still have the local file success
    res.status(500).json({ 
      success: false, 
      message: 'Bulut yedekleme başarısız oldu ancak yerel yedek alındı.',
      error: error.message 
    });
  }
});

// 2. Cloud Pull Proxy (GET)
app.get('/cloud-pull', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ success: false, message: 'URL eksik.' });
  }

  try {
    const response = await axios.get(url.trim());
    res.json(response.data);
  } catch (error) {
    console.error('Cloud Pull Error:', error.message);
    res.status(500).json({ success: false, message: 'Buluttan veri çekme başarısız.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`GOKBORU Cloud Proxy running at http://localhost:${PORT}`);
});
