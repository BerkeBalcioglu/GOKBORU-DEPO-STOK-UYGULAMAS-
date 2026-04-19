import * as XLSX from 'xlsx';

export const exportToExcel = (inventory, transactions, maintenances = [], emanetler = []) => {
  const wb = XLSX.utils.book_new();

  // 1. Inventory Sheet
  const inventoryData = inventory.map(item => ({
    'Ürün Kodu': item.code || '-',
    'Malzeme Adı': item.name,
    'Kategori': item.category || 'Diğer',
    'Kullanım Yeri': item.usage,
    'Model': item.model || '-',
    'Depo Yeri': item.warehouse || 'Ana Depo',
    'Raf': item.shelf || '-',
    'Stok Miktarı': item.quantity,
    'Birim': item.unit || 'Adet',
    'Min Stok': item.minStock || 5,
    'Son İşlem': item.lastUpdated ? new Date(item.lastUpdated).toLocaleString('tr-TR') : '-'
  }));
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  wsInventory['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Stok Durumu');

  // 2. Emanetler Sheet (NEW)
  const emanetData = emanetler.map(em => ({
    'Kişi Ad Soyad': em.personName,
    'Bölge/Birim': em.region || '-',
    'Malzeme Adı': em.itemName,
    'Kod': em.itemCode || '-',
    'Adet': em.amount,
    'Veriliş Tarihi': em.dateStr + ' ' + em.timeStr,
    'Durum': em.status === 'aktif' ? 'Emanette' : (em.status === 'iade' ? 'İade Edildi' : 'Stoktan Düşüldü'),
    'Not': em.note || ''
  }));
  const wsEmanet = XLSX.utils.json_to_sheet(emanetData);
  wsEmanet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsEmanet, 'Emanet Listesi');

  // 3. Transactions Sheet
  const transactionData = transactions.map(tx => ({
    'Tarih': new Date(tx.date).toLocaleString('tr-TR'),
    'İşlem Tipi': tx.type === 'girdi' ? 'Girdi (+)' : tx.type === 'cikti' ? 'Çıktı (-)' : 'Transfer',
    'Malzeme Adı': tx.itemName,
    'Miktar': tx.amount,
    'Not/Açıklama': tx.note || ''
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(transactionData);
  wsTransactions['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'İşlem Geçmişi');

  // 4. Maintenances Sheet (NEW)
  const maintenanceData = maintenances.map(m => ({
    'Tarih': new Date(m.date).toLocaleDateString('tr-TR'),
    'Malzeme': m.itemName,
    'Kod': m.itemCode || '-',
    'İşlem Detayı': m.details,
    'Yapan Kişi/Kurum': m.person,
    'Sonraki Bakım': m.nextDate ? new Date(m.nextDate).toLocaleDateString('tr-TR') : '-'
  }));
  const wsMaintenances = XLSX.utils.json_to_sheet(maintenanceData);
  wsMaintenances['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 50 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsMaintenances, 'Bakım Geçmişi');

  // 5. Warehouse Summary
  const warehouses = [...new Set(inventory.map(i => i.warehouse || 'Genel'))];
  const warehouseData = warehouses.map(wh => {
    const items = inventory.filter(i => (i.warehouse || 'Genel') === wh);
    return {
      'Depo Adı': wh,
      'Toplam Çeşit': items.length,
      'Toplam Adet': items.reduce((sum, i) => sum + i.quantity, 0)
    };
  });
  const wsWarehouses = XLSX.utils.json_to_sheet(warehouseData);
  XLSX.utils.book_append_sheet(wb, wsWarehouses, 'Depo Özet');

  XLSX.writeFile(wb, `GOKBORU_Saha_Yedek_${new Date().toISOString().slice(0,10)}.xlsx`);
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
          usage: row['Kullanım Yeri'] || row['Kullanım'] || 'Genel',
          category: row['Kategori'] || row['Tür'] || 'Diğer',
          quantity: quantity,
          unit: row['Birim'] || 'Adet',
          model: row['Model'] || '',
          warehouse: row['Depo Yeri'] || row['Depo'] || 'Ana Depo',
          shelf: row['Raf'] || row['Kabin'] || '',
          minStock: parseInt(row['Min Stok']) || 5,
          lastUpdated: Date.now()
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
      alert("Excel hatası: " + error.message);
    }
  };
  reader.readAsArrayBuffer(file);
};

