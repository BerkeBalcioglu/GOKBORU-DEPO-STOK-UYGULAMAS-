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

    // 1. Inventory Sheet
    const invData = (payload.inventory || []).map(item => ({
      'Stok No': item.code || '-',
      'Malzeme Adı': item.name,
      'Barkod No': item.registrationNumber || '-',
      'Seri No': item.serialNumber || '-',
      'Kategori': item.category || 'Diğer',
      'Miktar': item.quantity,
      'Birim': item.unit || 'Adet',
      'Depo Yeri': item.warehouse || 'Ana Depo',
      'Raf/Kabin': item.shelf || '-',
      'Kullanım Yeri': item.usage || '-',
      'Model': item.model || '-',
      'Min Stok': item.minStock || 5,
      'Son Güncelleme': item.lastUpdated ? new Date(item.lastUpdated).toLocaleString('tr-TR') : '-'
    }));
    const wsInventory = XLSX.utils.json_to_sheet(invData);
    wsInventory['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsInventory, 'Stok_Durumu');

    // 2. Emanetler Sheet
    const emData = (payload.emanetler || []).map(em => ({
      'Kişi Ad Soyad': em.personName,
      'Bölge/Birim': em.region || '-',
      'Malzeme Adı': em.itemName,
      'Stok No': em.itemCode || '-',
      'Barkod No': em.registrationNumber || '-',
      'Adet': em.amount,
      'Tarih': em.dateStr + ' ' + em.timeStr,
      'Durum': em.status === 'aktif' ? 'Emanette' : (em.status === 'iade' ? 'İade Edildi' : 'Stoktan Düşüldü'),
      'Not': em.note || ''
    }));
    const wsEmanet = XLSX.utils.json_to_sheet(emData);
    wsEmanet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsEmanet, 'Emanet_Listesi');

    // 3. Depo Listesi (Yeni)
    const warehouseMap = {};
    (payload.inventory || []).forEach(item => {
      const w = item.warehouse || 'Ana Depo';
      if (!warehouseMap[w]) warehouseMap[w] = { name: w, itemsCount: 0, totalStock: 0 };
      warehouseMap[w].itemsCount += 1;
      warehouseMap[w].totalStock += item.quantity;
    });
    const warehouseData = Object.values(warehouseMap).map(w => ({
      'Depo Adı': w.name,
      'Farklı Kalem Ürün Sayısı': w.itemsCount,
      'Toplam Stok Adedi': w.totalStock
    }));
    const wsWarehouses = XLSX.utils.json_to_sheet(warehouseData);
    wsWarehouses['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsWarehouses, 'Depo_Listesi');

    // 4. Girdi/Cikti Gecmisi (Yeni ayrım)
    const ioTransactions = (payload.transactions || []).filter(tx => tx.type !== 'transfer');
    const ioData = ioTransactions.map(tx => ({
      'Tarih': new Date(tx.date).toLocaleString('tr-TR'),
      'İşlem Tipi': tx.type === 'girdi' ? 'Girdi (+)' : 'Çıktı (-)',
      'Malzeme Adı': tx.itemName,
      'Miktar': tx.amount,
      'Not/Açıklama': tx.note || ''
    }));
    const wsIO = XLSX.utils.json_to_sheet(ioData);
    wsIO['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsIO, 'Girdi_Cikti_Gecmisi');

    // 5. Transfer Gecmisi (Yeni ayrım)
    const transferTransactions = (payload.transactions || []).filter(tx => tx.type === 'transfer');
    const transferData = transferTransactions.map(tx => ({
      'Tarih': new Date(tx.date).toLocaleString('tr-TR'),
      'Malzeme Adı': tx.itemName,
      'Miktar': tx.amount,
      'Transfer Detayı (Nereden -> Nereye)': tx.note || ''
    }));
    const wsTransfer = XLSX.utils.json_to_sheet(transferData);
    wsTransfer['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsTransfer, 'Transfer_Gecmisi');

    // 6. Maintenances Sheet
    const mxData = (payload.maintenances || []).map(m => ({
      'Tarih': new Date(m.date).toLocaleDateString('tr-TR'),
      'Malzeme': m.itemName,
      'Stok No': m.itemCode || '-',
      'Barkod No': m.registrationNumber || '-',
      'İşlem Detayı': m.details,
      'Yapan Kişi/Kurum': m.person,
      'Sonraki Bakım': m.nextDate ? new Date(m.nextDate).toLocaleDateString('tr-TR') : '-'
    }));
    const wsMaintenances = XLSX.utils.json_to_sheet(mxData);
    wsMaintenances['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsMaintenances, 'Bakim_Gecmisi');

    // 7. Sistem Notları
    const notesData = [];
    (payload.savedTransactionNotes || []).forEach(n => notesData.push({ 'Kategori': 'İşlem Notu', 'Not': n }));
    (payload.savedMaintenanceNotes || []).forEach(n => notesData.push({ 'Kategori': 'Bakım Notu', 'Not': n }));
    if (notesData.length === 0) notesData.push({ 'Kategori': '-', 'Not': 'Kayıtlı not bulunamadı.' });
    
    const wsNotes = XLSX.utils.json_to_sheet(notesData);
    wsNotes['!cols'] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Sistem_Notlari');

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
