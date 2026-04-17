import * as XLSX from 'xlsx';

export const exportToExcel = (inventory, transactions) => {
  // Inventory Sheet
  const inventoryData = inventory.map(item => ({
    'Ürün Kodu': item.code || '-',
    'Malzeme Adı': item.name,
    'Kullanım Yeri': item.usage,
    'Model': item.model || '-',
    'Depo Yeri': item.warehouse || 'Ana Depo',
    'Raf': item.shelf || '-',
    'Stok Miktarı': item.quantity,
    'Birim': item.unit || 'Adet',
    'Min Stok': item.minStock || 5
  }));

  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);

  // Transactions Sheet
  const transactionData = transactions.map(tx => ({
    'Tarih': new Date(tx.date).toLocaleString('tr-TR'),
    'İşlem Tipi': tx.type === 'girdi' ? 'Girdi (+)' : 'Çıktı (-)',
    'Malzeme Adı': tx.itemName,
    'Miktar': tx.amount,
    'Not/Açıklama': tx.note || ''
  }));

  const wsTransactions = XLSX.utils.json_to_sheet(transactionData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Stok Durumu');
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'İşlem Geçmişi');

  XLSX.writeFile(wb, `GOKBORU_Depo_Raporu_${new Date().toISOString().slice(0,10)}.xlsx`);
};

export const exportMaintenancesToExcel = (maintenances) => {
  const workbook = XLSX.utils.book_new();

  // Group by item name
  const grouped = maintenances.reduce((acc, curr) => {
    // Make sure sheet name is valid (max 31 chars, no special chars)
    const sheetName = (curr.itemName || 'Bilinmeyen').substring(0, 31).replace(/[\\/?*[\]]/g, '');
    if (!acc[sheetName]) acc[sheetName] = [];
    acc[sheetName].push({
      'Tarih': new Date(curr.date).toLocaleDateString('tr-TR'),
      'Malzeme Kodu': curr.itemCode || '-',
      'Malzeme Adı': curr.itemName || '-',
      'Yapılan İşlemler': curr.details || '-',
      'Bakımı Yapan': curr.person || '-',
      'Sonraki Bakım': curr.nextDate ? new Date(curr.nextDate).toLocaleDateString('tr-TR') : '-'
    });
    return acc;
  }, {});

  Object.keys(grouped).forEach(sheetName => {
    const worksheet = XLSX.utils.json_to_sheet(grouped[sheetName]);
    
    // Column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Tarih
      { wch: 20 }, // Kod
      { wch: 30 }, // Adı
      { wch: 50 }, // İşlemler
      { wch: 20 }, // Yapan
      { wch: 15 }  // Sonraki
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  if (Object.keys(grouped).length === 0) {
    const emptySheet = XLSX.utils.json_to_sheet([{ 'Bilgi': 'Henüz bakım kaydı bulunmuyor.' }]);
    XLSX.utils.book_append_sheet(workbook, emptySheet, 'Bakımlar');
  }

  XLSX.writeFile(workbook, `GOKBORU_Bakim_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const importFromExcel = (file, currentInventory, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      let updatedInventory = [...currentInventory];
      let stats = { new: 0, updated: 0 };

      jsonData.forEach(row => {
        const name = row['Malzeme Adı'] || row['Ürün Adı'] || row['Adı'] || row['Name'];
        if (!name) return;

        const code = row['Ürün Kodu'] || row['Kod'] || row['Code'] || '';
        const quantity = parseInt(row['Stok Miktarı'] || row['Adet'] || row['Miktar']) || 0;

        const existingIndex = updatedInventory.findIndex(item => 
          (code && item.code === code) || 
          (item.name.toLowerCase().trim() === name.toLowerCase().trim())
        );
        
        const itemData = {
          code: code || `GKB-${Math.floor(Math.random() * 10000)}`,
          name: name,
          usage: row['Kullanım Yeri'] || row['Kullanım'] || row['Kategori'] || 'Genel',
          quantity: quantity,
          unit: row['Birim'] || 'Adet',
          model: row['Model'] || '',
          warehouse: row['Depo Yeri'] || row['Depo'] || 'Ana Depo',
          shelf: row['Raf'] || row['Kabin'] || row['Konum'] || '',
          minStock: parseInt(row['Min Stok']) || 5
        };

        if (existingIndex >= 0) {
          updatedInventory[existingIndex] = { ...updatedInventory[existingIndex], ...itemData };
          stats.updated++;
        } else {
          updatedInventory.push({ id: Date.now() + Math.random(), ...itemData });
          stats.new++;
        }
      });

      callback(updatedInventory, stats);
    } catch (error) {
      alert("Excel dosyası okunurken hata oluştu: " + error.message);
    }
  };
  reader.readAsArrayBuffer(file);
};
