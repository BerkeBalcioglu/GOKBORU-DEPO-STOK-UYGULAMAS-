const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Local database path
const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_JSON_PATH = path.join(BACKUP_DIR, 'gkb_database.json');
const DB_EXCEL_PATH = path.join(BACKUP_DIR, 'gkb_database.xlsx');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 1. Save Local Database (Automatic)
app.post('/save-local-db', (req, res) => {
  const payload = req.body;
  
  try {
    // Save as JSON (Primary Data Store)
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(payload, null, 2));

    // Save as Excel (User Accessible Database)
    const wb = XLSX.utils.book_new();

    // Inventory
    const invData = (payload.inventory || []).map(item => ({
      'Stok No': item.code || '-',
      'Malzeme Adı': item.name,
      'Barkod No': item.registrationNumber || '-',
      'Seri No': item.serialNumber || '-',
      'Kategori': item.category || 'Diğer',
      'Miktar': item.quantity,
      'Birim': item.unit || 'Adet',
      'Depo': item.warehouse || '-',
      'Raf': item.shelf || '-',
      'Min Stok': item.minStock || 5,
      'Kullanım': item.usage || '-',
      'Model': item.model || '-',
      'Son Güncelleme': item.lastUpdated ? new Date(item.lastUpdated).toLocaleString('tr-TR') : '-'
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invData), 'Stok');

    // Transactions
    const txData = (payload.transactions || []).map(tx => ({
      'Tarih': tx.date,
      'İşlem Tipi': tx.type,
      'Malzeme Adı': tx.itemName,
      'Miktar': tx.amount,
      'Not': tx.note || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txData), 'Islemler');

    // Maintenances
    const mxData = (payload.maintenances || []).map(m => ({
      'Tarih': m.date,
      'Malzeme': m.itemName,
      'Stok No': m.itemCode || '-',
      'Barkod No': m.registrationNumber || '-',
      'Detay': m.details,
      'Yapan': m.person,
      'Sonraki Bakım': m.nextDate || '-'
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mxData), 'Bakimlar');
    
    // Emanetler
    const emData = (payload.emanetler || []).map(em => ({
      'Kişi': em.personName,
      'Bölge': em.region || '-',
      'Malzeme': em.itemName,
      'Stok No': em.itemCode || '-',
      'Barkod No': em.registrationNumber || '-',
      'Miktar': em.amount,
      'Tarih': em.dateStr + ' ' + em.timeStr,
      'Durum': em.status,
      'Not': em.note || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(emData), 'Emanetler');

    XLSX.writeFile(wb, DB_EXCEL_PATH);

    res.json({ success: true, message: 'Veri tabanı başarıyla güncellendi (Excel ve JSON).' });
  } catch (error) {
    console.error('Save DB Error:', error.message);
    res.status(500).json({ success: false, message: 'Yerel kayıt hatası.', error: error.message });
  }
});

// 2. Load Local Database
app.get('/load-local-db', (req, res) => {
  try {
    if (fs.existsSync(DB_JSON_PATH)) {
      const data = fs.readFileSync(DB_JSON_PATH, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ success: false, message: 'Veri tabanı henüz oluşturulmamış.' });
    }
  } catch (error) {
    console.error('Load DB Error:', error.message);
    res.status(500).json({ success: false, message: 'Veri çekme hatası.' });
  }
});

// 3. Cloud Backup Proxy (POST)
app.post('/cloud-backup', async (req, res) => {
  const { url, payload } = req.body;
  
  if (!url || !payload) {
    return res.status(400).json({ success: false, message: 'URL veya veri eksik.' });
  }

  try {
    const localFile = path.join(BACKUP_DIR, `cloud_snapshot_${new Date().toISOString().slice(0,10)}.json`);
    fs.writeFileSync(localFile, JSON.stringify(payload, null, 2));

    const response = await axios.post(url.trim(), payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ success: true, cloudResponse: response.data });
  } catch (error) {
    console.error('Cloud Backup Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Bulut yedekleme başarısız oldu ancak yerel yedek alındı.',
      error: error.message 
    });
  }
});

// 4. Cloud Pull Proxy (GET)
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
  console.log(`GOKBORU Database Server running at http://localhost:${PORT}`);
});
