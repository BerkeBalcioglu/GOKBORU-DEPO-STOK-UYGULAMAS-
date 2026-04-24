const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'backups', 'gkb_database.json');

if (fs.existsSync(dbPath)) {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  const demirbasKeywords = [
    'Jeneratör', 'Kırıcı', 'Testere', 'Balyoz', 'Çekiç', 'Balta', 'Makas', 
    'Kürek', 'Kazma', 'Kova', 'LED', 'Huni', 'Çanta', 'Telsiz', 'GPS', 
    'Söndürme', 'Kazan', 'Megafon', 'Baret', 'Projektör', 'Göz Koruyucu', 
    'Kulak Koruyucu', 'Bot', 'Kıyafet', 'Tulum', 'Mat', 'Çadır'
  ];

  data.inventory = data.inventory.map(item => {
    // If it already has a category and it's not Diğer/Sarf, keep it
    // But user wants us to implement Demirbaş
    const isDemirbas = demirbasKeywords.some(kw => item.name.toLowerCase().includes(kw.toLowerCase()));
    const isGida = item.name.toLowerCase().includes('yemek') || item.name.toLowerCase().includes('su') || item.name.toLowerCase().includes('çay') || item.name.toLowerCase().includes('kahve');
    
    if (isGida) {
      item.category = 'Sarf(Gıda)';
    } else if (isDemirbas) {
      item.category = 'Demirbaş';
    } else if (!item.category) {
      item.category = 'Diğer';
    }
    
    if (item.registrationNumber === undefined) {
      item.registrationNumber = '';
    }
    
    return item;
  });

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log('Database migrated successfully with Demirbaş and Sicil No support.');
} else {
  console.log('No database file found to migrate.');
}
