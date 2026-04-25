import * as XLSX from 'xlsx';

export const exportToExcel = (inventory, transactions, maintenances = [], emanetler = []) => {
  const wb = XLSX.utils.book_new();

  // 1. Inventory Sheet
  const inventoryData = inventory.map(item => ({
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
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  wsInventory['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Stok_Durumu');

  // 2. Emanetler Sheet
  const emanetData = emanetler.map(em => ({
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
  const wsEmanet = XLSX.utils.json_to_sheet(emanetData);
  wsEmanet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsEmanet, 'Emanet_Listesi');

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
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Islem_Gecmisi');

  // 4. Maintenances Sheet
  const maintenanceData = maintenances.map(m => ({
    'Tarih': new Date(m.date).toLocaleDateString('tr-TR'),
    'Malzeme': m.itemName,
    'Stok No': m.itemCode || '-',
    'Barkod No': m.registrationNumber || '-',
    'İşlem Detayı': m.details,
    'Yapan Kişi/Kurum': m.person,
    'Sonraki Bakım': m.nextDate ? new Date(m.nextDate).toLocaleDateString('tr-TR') : '-'
  }));
  const wsMaintenances = XLSX.utils.json_to_sheet(maintenanceData);
  wsMaintenances['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsMaintenances, 'Bakim_Gecmisi');

  XLSX.writeFile(wb, `GOKBORU_Sistem_Yedek_${new Date().toISOString().slice(0,10)}.xlsx`);
};

export const importFromExcel = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const result = {
        inventory: [],
        transactions: [],
        maintenances: [],
        emanetler: []
      };

      // 1. Inventory Import
      const invSheet = workbook.Sheets['Stok_Durumu'] || workbook.Sheets[workbook.SheetNames[0]];
      if (invSheet) {
        const invJson = XLSX.utils.sheet_to_json(invSheet);
        result.inventory = invJson.map(row => ({
          id: Date.now() + Math.random(),
          code: row['Stok No'] || row['Ürün Kodu'] || row['Kod'] || '',
          name: row['Malzeme Adı'] || row['Adı'] || 'İsimsiz Ürün',
          registrationNumber: row['Barkod No'] || row['Sicil No'] || '',
          serialNumber: row['Seri No'] || '',
          category: row['Kategori'] || 'Diğer',
          quantity: parseInt(row['Miktar'] || row['Stok Miktarı'] || row['Adet']) || 0,
          unit: row['Birim'] || 'Adet',
          warehouse: row['Depo Yeri'] || row['Depo'] || 'Ana Depo',
          shelf: row['Raf/Kabin'] || row['Raf'] || '-',
          usage: row['Kullanım Yeri'] || row['Kullanım'] || '-',
          model: row['Model'] || '-',
          minStock: parseInt(row['Min Stok']) || 5,
          lastUpdated: row['Son Güncelleme'] ? new Date(row['Son Güncelleme']).getTime() : Date.now()
        }));
      }

      // 2. Transactions Import
      const txSheet = workbook.Sheets['Islem_Gecmisi'];
      if (txSheet) {
        const txJson = XLSX.utils.sheet_to_json(txSheet);
        result.transactions = txJson.map(row => ({
          id: Date.now() + Math.random(),
          date: row['Tarih'] ? new Date(row['Tarih']).toISOString() : new Date().toISOString(),
          type: row['İşlem Tipi']?.includes('Girdi') ? 'girdi' : (row['İşlem Tipi']?.includes('Çıktı') ? 'cikti' : 'transfer'),
          itemName: row['Malzeme Adı'],
          amount: parseInt(row['Miktar']) || 0,
          note: row['Not/Açıklama'] || ''
        }));
      }

      // 3. Maintenances Import
      const mxSheet = workbook.Sheets['Bakim_Gecmisi'];
      if (mxSheet) {
        const mxJson = XLSX.utils.sheet_to_json(mxSheet);
        result.maintenances = mxJson.map(row => ({
          id: Date.now() + Math.random(),
          date: row['Tarih'] ? new Date(row['Tarih']).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          itemName: row['Malzeme'],
          itemCode: row['Stok No'] || '',
          registrationNumber: row['Barkod No'] || '',
          details: row['İşlem Detayı'] || '',
          person: row['Yapan Kişi/Kurum'] || '',
          nextDate: row['Sonraki Bakım'] ? new Date(row['Sonraki Bakım']).toISOString().split('T')[0] : null
        }));
      }

      // 4. Emanetler Import
      const emSheet = workbook.Sheets['Emanet_Listesi'];
      if (emSheet) {
        const emJson = XLSX.utils.sheet_to_json(emSheet);
        result.emanetler = emJson.map(row => ({
          id: Date.now() + Math.random(),
          personName: row['Kişi Ad Soyad'],
          region: row['Bölge/Birim'] || '',
          itemName: row['Malzeme Adı'],
          itemCode: row['Stok No'] || '',
          registrationNumber: row['Barkod No'] || '',
          amount: parseInt(row['Adet']) || 0,
          dateStr: row['Tarih']?.split(' ')[0] || '',
          timeStr: row['Tarih']?.split(' ')[1] || '',
          status: row['Durum']?.includes('Emanet') ? 'aktif' : (row['Durum']?.includes('İade') ? 'iade' : 'dusuldu'),
          note: row['Not'] || ''
        }));
      }

      callback(result);
    } catch (error) {
      alert("Excel yükleme hatası: " + error.message);
    }
  };
  reader.readAsArrayBuffer(file);
};

export const exportMaintenancesToExcel = (maintenances, inventory = []) => {
  const wb = XLSX.utils.book_new();
  const maintenanceData = maintenances.map(m => ({
    'Tarih': new Date(m.date).toLocaleDateString('tr-TR'),
    'Malzeme': m.itemName,
    'Stok No': m.itemCode || '-',
    'Barkod No': m.registrationNumber || '-',
    'İşlem Detayı': m.details,
    'Yapan Kişi/Kurum': m.person,
    'Sonraki Bakım': m.nextDate ? new Date(m.nextDate).toLocaleDateString('tr-TR') : '-'
  }));
  const wsMaintenances = XLSX.utils.json_to_sheet(maintenanceData);
  wsMaintenances['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsMaintenances, 'Bakim_Gecmisi');
  XLSX.writeFile(wb, `GOKBORU_Bakim_Listesi_${new Date().toISOString().slice(0,10)}.xlsx`);
};


