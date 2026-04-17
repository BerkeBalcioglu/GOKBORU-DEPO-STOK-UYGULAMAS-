import React, { useState, useEffect, useRef } from 'react';
import { Package, ArrowRightLeft, History, LayoutDashboard, Download, Upload, Wrench, Undo2, Redo2 } from 'lucide-react';
import Inventory from './components/Inventory';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import MaintenancePanel from './components/MaintenancePanel';
import EmanetPanel from './components/EmanetPanel';
import { exportToExcel, importFromExcel } from './utils/excelUtils';

// Mock Initial Data
const initialInventoryData = [
  { id: 1, code: 'GKB-001', name: 'Jeneratör', model: '7.5 kVA', usage: 'Kurtarma', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf A1', minStock: 1 },
  { id: 2, code: 'GKB-002', name: 'Jeneratör', model: '7.5 kVA', usage: 'Anakamp', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf A1', minStock: 1 },
  { id: 3, code: 'GKB-003', name: 'Jeneratör', model: '2 kVA (çanta tipi)', usage: 'Anakamp', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf A2', minStock: 1 },
  { id: 4, code: 'GKB-004', name: 'Ağır Hizmet Kırıcı ve Uçları', model: '16 kg veya Muadil', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf B1', minStock: 2 },
  { id: 5, code: 'GKB-005', name: 'Kırıcı-Delici ve Uçları', model: '11 kg veya Muadil', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf B1', minStock: 2 },
  { id: 6, code: 'GKB-006', name: 'Motorlu Testere', model: 'Minimum 50 cm Pala', usage: 'Kurtarma', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf B2', minStock: 1 },
  { id: 7, code: 'GKB-007', name: 'Balyoz', model: '5 kg', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C1', minStock: 4 },
  { id: 8, code: 'GKB-008', name: 'Çekiç', model: '2 kg', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C1', minStock: 4 },
  { id: 9, code: 'GKB-009', name: 'Murç', model: '', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C1', minStock: 2 },
  { id: 10, code: 'GKB-010', name: 'Topuklu Manivela', model: 'Minimum 150 cm', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C2', minStock: 2 },
  { id: 11, code: 'GKB-011', name: 'Balta', model: 'Orta Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C2', minStock: 2 },
  { id: 12, code: 'GKB-012', name: 'Demir Kesme Makası', model: 'Küçük Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C2', minStock: 2 },
  { id: 13, code: 'GKB-013', name: 'Demir Kesme Makası', model: 'Orta Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C3', minStock: 2 },
  { id: 14, code: 'GKB-014', name: 'Demir Kesme Makası', model: 'Büyük Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C3', minStock: 2 },
  { id: 15, code: 'GKB-015', name: 'Kürek', model: 'Kısa Metal Saplı', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D1', minStock: 4 },
  { id: 16, code: 'GKB-016', name: 'Kürek', model: 'Uzun Ahşap Saplı', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D1', minStock: 4 },
  { id: 17, code: 'GKB-017', name: 'Kazma', model: 'Ahşap Saplı', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D1', minStock: 2 },
  { id: 18, code: 'GKB-018', name: 'Kova', model: 'Metal veya Sağlam Kauçuk', usage: 'Kurtarma', quantity: 5, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D2', minStock: 5 },
  { id: 19, code: 'GKB-019', name: 'LED Aydınlatma', model: 'Bataryalı', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E1', minStock: 4 },
  { id: 20, code: 'GKB-020', name: 'LED Aydınlatma', model: '50 W Ayaklı', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E1', minStock: 2 },
  { id: 21, code: 'GKB-021', name: 'Yakıt ve Yağ Hunisi', model: 'Büyük-Orta-Küçük', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E2', minStock: 2 },
  { id: 22, code: 'GKB-022', name: 'Tamir ve Bakım Alet Çantası', model: 'Gerekli Aletler Dahil', usage: 'Lojistik', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E2', minStock: 1 },
  { id: 23, code: 'GKB-023', name: 'İlk Yardım Çantası', model: '', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Medikal Depo', shelf: 'Raf F1', minStock: 2 },
  { id: 24, code: 'GKB-024', name: 'El Telsizi', model: '', usage: 'İletişim', quantity: 8, unit: 'Adet', warehouse: 'İletişim Depo', shelf: 'Raf F1', minStock: 8 },
  { id: 25, code: 'GKB-025', name: 'GPS veya GAIA Uygulama (Cep)', model: '', usage: 'İletişim', quantity: 2, unit: 'Adet', warehouse: 'İletişim Depo', shelf: 'Raf F1', minStock: 2 },
  { id: 26, code: 'GKB-026', name: 'Yangın Söndürme Cihazı', model: 'ABC Tozlu', usage: 'Kurtarma', quantity: 10, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf F2', minStock: 10 },
  { id: 27, code: 'GKB-027', name: 'Hazır Yemek Paketi', model: 'Kişi başı 3 Öğün x Gün', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G1', minStock: 15 },
  { id: 28, code: 'GKB-028', name: 'Su', model: 'Günlük 3 Litre İçme Suyu', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G1', minStock: 15 },
  { id: 29, code: 'GKB-029', name: 'Büyük Çay Kazanı', model: '', usage: 'Personel', quantity: 1, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G2', minStock: 1 },
  { id: 30, code: 'GKB-030', name: 'Yeter Miktarda Çay,Kahve,Bardak', model: '', usage: 'Lojistik', quantity: 1, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G2', minStock: 1 },
  { id: 31, code: 'GKB-031', name: 'Emniyet Şeridi', model: '', usage: 'Kurtarma', quantity: 3, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf H1', minStock: 3 },
  { id: 32, code: 'GKB-032', name: 'Megafon', model: '', usage: 'Kurtarma', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf H1', minStock: 1 },
  { id: 33, code: 'GKB-033', name: 'Sprey Boya', model: 'Farklı Renklerde', usage: 'Kurtarma', quantity: 3, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf H1', minStock: 3 },
  { id: 34, code: 'GKB-034', name: 'Baret', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 1', minStock: 30 },
  { id: 35, code: 'GKB-035', name: 'Baret Lambası', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 1', minStock: 30 },
  { id: 36, code: 'GKB-036', name: 'El Projektörü', model: '', usage: 'Personel', quantity: 8, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 1', minStock: 8 },
  { id: 37, code: 'GKB-037', name: 'İş Eldiveni', model: '', usage: 'Personel', quantity: 90, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 2', minStock: 90 },
  { id: 38, code: 'GKB-038', name: 'Göz Koruyucu', model: '', usage: 'Personel', quantity: 60, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 2', minStock: 60 },
  { id: 39, code: 'GKB-039', name: 'Kulak Koruyucu', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 2', minStock: 30 },
  { id: 40, code: 'GKB-040', name: 'Solunum Yolu Koruyucu (Maske)', model: '', usage: 'Personel', quantity: 90, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 3', minStock: 90 },
  { id: 41, code: 'GKB-041', name: 'İş Botu', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 3', minStock: 30 },
  { id: 42, code: 'GKB-042', name: 'Kıyafet', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 4', minStock: 30 },
  { id: 43, code: 'GKB-043', name: 'Uyku Tulumu', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 4', minStock: 30 },
  { id: 44, code: 'GKB-044', name: 'Mat', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 5', minStock: 30 },
  { id: 45, code: 'GKB-045', name: 'Çadır', model: 'Personel', usage: 'Personel', quantity: 15, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 5', minStock: 15 },
  { id: 46, code: 'GKB-046', name: 'Farklı Ebatlarda Çadır', model: 'Lojistik ve Yönetim amaçlı', usage: 'Anakamp', quantity: 6, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 5', minStock: 6 }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [savedTransactionNotes, setSavedTransactionNotes] = useState([]);
  const [savedMaintenanceNotes, setSavedMaintenanceNotes] = useState([]);
  const [emanetler, setEmanetler] = useState([]);
  const fileInputRef = useRef(null);

  // Undo/Redo Refs & States
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isUndoRedo = useRef(false);

  // Load from LocalStorage or use initial
  useEffect(() => {
    const savedInventory = localStorage.getItem('akut_inventory');
    const savedTransactions = localStorage.getItem('akut_transactions');
    const savedMaintenances = localStorage.getItem('gkb_maintenances');
    const savedTxNotes = localStorage.getItem('gkb_saved_tx_notes');
    const savedMxNotes = localStorage.getItem('gkb_saved_mx_notes');
    const savedEmanetler = localStorage.getItem('gkb_emanetler');
    
    if (savedInventory) {
      const parsed = JSON.parse(savedInventory);
      if (parsed.length < 10) {
        setInventory(initialInventoryData);
      } else {
        setInventory(parsed);
      }
    } else {
      setInventory(initialInventoryData);
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    if (savedMaintenances) {
      setMaintenances(JSON.parse(savedMaintenances));
    }
    if (savedTxNotes) {
      setSavedTransactionNotes(JSON.parse(savedTxNotes));
    }
    if (savedMxNotes) setSavedMaintenanceNotes(JSON.parse(savedMxNotes));
    if (savedEmanetler) setEmanetler(JSON.parse(savedEmanetler));
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem('akut_inventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('akut_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (maintenances.length > 0) {
      localStorage.setItem('gkb_maintenances', JSON.stringify(maintenances));
    }
  }, [maintenances]);

  useEffect(() => {
    localStorage.setItem('gkb_saved_tx_notes', JSON.stringify(savedTransactionNotes));
  }, [savedTransactionNotes]);

  useEffect(() => { localStorage.setItem('gkb_saved_mx_notes', JSON.stringify(savedMaintenanceNotes)); }, [savedMaintenanceNotes]);
  useEffect(() => { localStorage.setItem('gkb_emanetler', JSON.stringify(emanetler)); }, [emanetler]);

  // Undo/Redo History Tracker
  useEffect(() => {
    if (inventory.length === 0 && transactions.length === 0 && maintenances.length === 0) return; // Prevent saving empty initial states if not loaded
    
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    const snapshot = {
      inventory: JSON.parse(JSON.stringify(inventory)),
      transactions: JSON.parse(JSON.stringify(transactions)),
      maintenances: JSON.parse(JSON.stringify(maintenances))
    };

    let newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 30) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [inventory, transactions, maintenances]);

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedo.current = true;
      const currentState = historyRef.current[historyIndexRef.current];
      historyIndexRef.current -= 1;
      const prevState = historyRef.current[historyIndexRef.current];
      
      // Hangi verinin değiştiğini bul ve o sekmeye git
      if (JSON.stringify(currentState.maintenances) !== JSON.stringify(prevState.maintenances)) {
        setActiveTab('maintenance');
      } else if (JSON.stringify(currentState.transactions) !== JSON.stringify(prevState.transactions)) {
        setActiveTab('history');
      } else if (JSON.stringify(currentState.inventory) !== JSON.stringify(prevState.inventory)) {
        setActiveTab('inventory');
      }

      setInventory(prevState.inventory);
      setTransactions(prevState.transactions);
      setMaintenances(prevState.maintenances);
      
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedo.current = true;
      const currentState = historyRef.current[historyIndexRef.current];
      historyIndexRef.current += 1;
      const nextState = historyRef.current[historyIndexRef.current];
      
      // Hangi verinin değiştiğini bul ve o sekmeye git
      if (JSON.stringify(currentState.maintenances) !== JSON.stringify(nextState.maintenances)) {
        setActiveTab('maintenance');
      } else if (JSON.stringify(currentState.transactions) !== JSON.stringify(nextState.transactions)) {
        setActiveTab('history');
      } else if (JSON.stringify(currentState.inventory) !== JSON.stringify(nextState.inventory)) {
        setActiveTab('inventory');
      }

      setInventory(nextState.inventory);
      setTransactions(nextState.transactions);
      setMaintenances(nextState.maintenances);
      
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  };

  // Klavye kısayolları (Ctrl+Z ve Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Input veya textarea içindeyken formun kendi ctrl+z özelliğini ezme
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTransaction = (itemId, type, amount, note, newItemDetails = null) => {
    let numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) return false;

    let success = false;
    let itemDetails = null;

    if (newItemDetails) {
      // Create new item
      const newItem = {
        id: Date.now(),
        code: newItemDetails.code || `GKB-${Math.floor(Math.random() * 10000)}`,
        name: newItemDetails.name,
        usage: newItemDetails.usage,
        model: newItemDetails.model || '',
        quantity: numericAmount,
        minStock: newItemDetails.minStock || 5,
        unit: newItemDetails.unit || 'Adet',
        location: newItemDetails.location || '-'
      };
      
      setInventory(prev => [...prev, newItem]);
      itemDetails = newItem;
      success = true;
      type = 'girdi'; // Forcing 'girdi' because it's a new item addition
    } else {
      // Existing item transaction
      setInventory(prev => {
        return prev.map(item => {
          if (item.id === itemId) {
            itemDetails = { ...item };
            if (type === 'girdi') {
              success = true;
              return { ...item, quantity: item.quantity + numericAmount };
            } else if (type === 'cikti') {
              success = true;
              if (item.quantity < numericAmount) {
                // Eksiye düşmek yerine sıfırla
                numericAmount = item.quantity;
              }
              return { ...item, quantity: item.quantity - numericAmount };
            }
          }
          return item;
        });
      });
    }

    // Delay transaction log update slightly
    setTimeout(() => {
      if (success && itemDetails) {
        const newTransaction = {
          id: Date.now(),
          itemId: itemDetails.id,
          itemName: itemDetails.name,
          type: type,
          amount: numericAmount,
          date: new Date().toISOString(),
          note: note || ''
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setActiveTab('inventory');
      } else if (!success) {
        alert('İşlem başarısız! Yetersiz stok veya hatalı miktar.');
      }
    }, 50);

    return success;
  };

  const handleUpdateItem = (updatedItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    alert('Ürün başarıyla güncellendi.');
  };

  const handleDeleteItem = (itemId) => {
    if(window.confirm('Bu ürünü tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
      // Also clean up maintenance logs
      setMaintenances(prev => prev.filter(m => m.itemId !== itemId));
      alert('Ürün silindi.');
    }
  };

  // --- Maintenance Functions ---
  const handleAddMaintenance = (newMaintenance) => {
    const maintenance = {
      ...newMaintenance,
      id: Date.now()
    };
    setMaintenances(prev => [maintenance, ...prev]);
    alert('Bakım kaydı başarıyla eklendi.');
  };

  const handleUpdateMaintenance = (updatedMaintenance) => {
    setMaintenances(prev => prev.map(m => m.id === updatedMaintenance.id ? updatedMaintenance : m));
    alert('Bakım kaydı güncellendi.');
  };

  const handleDeleteMaintenance = (id) => {
    if (window.confirm('Bu bakım kaydını silmek istediğinize emin misiniz?')) {
      setMaintenances(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleGenerateAutoMaintenance = () => {
    if (!window.confirm('DİKKAT: Stoktaki kayıtlı cihazlar için son 2 yıla ait otomatik bakım geçmişi üretilecek. Onaylıyor musunuz?')) return;

    const newRecords = [];
    const today = new Date();
    
    inventory.forEach(item => {
      const name = item.name.toLowerCase();
      
      let type = '';
      if (name.includes('jeneratör')) type = 'jeneratör';
      else if (name.includes('kırıcı') || name.includes('delici') || name.includes('hilti')) type = 'kırıcı';
      else if (name.includes('testere')) type = 'testere';
      else if (name.includes('makas')) type = 'makas';
      else if (name.includes('aydınlatma') || name.includes('projektör')) type = 'aydınlatma';
      else if (name.includes('telsiz')) type = 'telsiz';
      else if (name.includes('gps') || name.includes('gaia')) type = 'gps';
      else if (name.includes('yangın')) type = 'yangın';
      else if (name.includes('çadır')) type = 'çadır';

      if (!type) return;

      // Son 2 yıl için (24 ay) her ay kayıt üret
      for (let i = 1; i <= 24; i++) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        d.setDate(Math.floor(Math.random() * 28) + 1);

        let details = "";
        let person = "Depo Sorumlusu";

        if (type === 'jeneratör') {
          if (i % 12 === 0) { details = "1. Yıllık Tam Periyodik Bakım\n2. Buji, yağ ve filtre değişimi\n3. Yük testi"; person = "Yetkili Servis"; }
          else if (i % 6 === 0) details = "1. 6 Aylık bakım\n2. Yağ kontrolü ve filtre temizliği";
          else if (i % 3 === 0) details = "1. Görsel kontrol\n2. Hava filtresi temizliği\n3. Çalıştırma testi";
          else details = "Aylık standart test (15 dk) ve akü kontrolü.";
        } 
        else if (type === 'kırıcı') {
          if (i % 12 === 0) { details = "1. Şanzıman yağı değişimi\n2. Kömür değişimi\n3. İzolasyon testi"; person = "Yetkili Servis"; }
          else if (i % 6 === 0) details = "1. Kömür ve rotor kontrolü\n2. İç mekanik temizlik";
          else if (i % 3 === 0) details = "1. Uç mandreni yağlaması\n2. Kablo yalıtım kontrolü";
          else details = "Aylık görsel ve tetik-çalışma kontrolü.";
        }
        else if (type === 'testere') {
          if (i % 12 === 0) { details = "1. Motor tam servis\n2. Buji ve yakıt filtresi değişimi\n3. Karbüratör ayarı"; person = "Yetkili Servis"; }
          else if (i % 6 === 0) details = "1. Pala temizliği ve yağlaması\n2. Zincir bileme";
          else if (i % 3 === 0) details = "1. Hava filtresi temizliği\n2. Buji kontrolü";
          else details = "Aylık zincir gerginlik kontrolü ve 5 dk boşta çalıştırma.";
        }
        else if (type === 'makas') {
          if (i % 12 === 0) details = "1. Mafsal sıkılık testi\n2. Tam söküm ve temizlik";
          else if (i % 3 === 0) details = "1. Mekanik/hidrolik yağlama\n2. Hareketli parça bakımı";
          else details = "Aylık ağız açıklığı ve keskinlik kontrolü.";
        }
        else if (type === 'aydınlatma') {
          if (i % 12 === 0) details = "1. Kablo ve soket korozyon temizliği\n2. LED çip kontrolü";
          else if (i % 3 === 0) details = "Batarya tam deşarj-şarj döngüsü yapıldı.";
          else details = "Aylık aç-kapa testi ve batarya şarj seviye kontrolü.";
        }
        else if (type === 'telsiz') {
          if (i % 12 === 0) details = "1. Anten değişim kontrolü\n2. Soket oksit temizliği";
          else if (i % 3 === 0) details = "Batarya tam deşarj-şarj kalibrasyonu yapıldı.";
          else details = "Aylık PTT / Tuş basım ve sinyal testi.";
        }
        else if (type === 'yangın') {
          if (i % 6 === 0) details = "1. Toz çökmesini engellemek için cihaz tersyüz edildi ve çalkalandı.";
          else details = "Aylık manometre basınç kontrolü ve mühür/pim sağlamlık testi yapıldı.";
        }
        else if (type === 'çadır') {
          if (i % 12 === 0) details = "1. Pol (direk) deformasyon testi\n2. Su itici kaplama kontrolü";
          else if (i % 6 === 0) details = "Kumaş yırtık kontrolü ve fermuar silikon yağlaması yapıldı.";
          else continue; // Aylık veya 3 aylık bakım yok
        }
        else if (type === 'gps') {
          if (i % 6 === 0) details = "1. Yazılım ve harita güncellemeleri kontrol edildi.\n2. Pil ve sızdırmazlık kılıfı kontrolü.";
          else continue; // Sadece 6 ayda bir
        }

        newRecords.push({
          id: Date.now() + Math.random(),
          itemId: item.id,
          itemName: item.name,
          itemCode: item.code || '-',
          date: d.toISOString().split('T')[0],
          details: details,
          person: person,
          nextDate: null
        });
      }
    });

    setMaintenances(prev => [...newRecords, ...prev]);
    alert(`${newRecords.length} adet detaylı otomatik bakım geçmişi başarıyla üretildi!`);
  };

  const handleExport = () => {
    exportToExcel(inventory, transactions);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importFromExcel(file, inventory, (newInventory, stats) => {
      setInventory(newInventory);
      alert(`Excel başarıyla yüklendi!\n${stats.new} yeni ürün eklendi, ${stats.updated} ürün güncellendi.`);
      if(fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  // Emanet handlers
  const handleAddEmanet = (em) => {
    if (Array.isArray(em)) {
      setEmanetler(prev => [...em, ...prev]);
    } else {
      setEmanetler(prev => [em, ...prev]);
    }
  };
  const handleReturnEmanet = (id) => setEmanetler(prev => prev.map(e => e.id === id ? { ...e, status: 'iade', iadeDate: new Date().toISOString() } : e));
  const handleDeleteEmanet = (id) => { if (window.confirm('Bu emanet kaydını silmek istediğinize emin misiniz?')) setEmanetler(prev => prev.filter(e => e.id !== id)); };
  
  const handleDeductEmanet = (em) => {
    if (window.confirm(`${em.amount} adet ${em.itemName} stoktan tamamen düşülecektir. İşlemi onaylıyor musunuz?`)) {
      const success = handleTransaction(em.itemId, 'cikti', em.amount, `Emanetten Düşüm (${em.personName})`);
      if (success) {
        setEmanetler(prev => prev.map(e => e.id === em.id ? { ...e, status: 'dusuldu', dusumDate: new Date().toISOString() } : e));
        alert('Stok başarıyla düşüldü.');
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Stok Durumu', icon: <Package size={20} /> },
    { id: 'transaction', label: 'Girdi / Çıktı Yap', icon: <ArrowRightLeft size={20} /> },
    { id: 'emanet', label: 'Emanet Takibi', icon: <ArrowRightLeft size={20} /> },
    { id: 'maintenance', label: 'Bakım Takibi', icon: <Wrench size={20} /> },
    { id: 'history', label: 'İşlem Geçmişi', icon: <History size={20} /> }
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow-blue)' }}>
            <Package color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', margin: 0, lineHeight: 1.2 }} className="text-gradient">GÖKBÖRÜ ARAMA KURTARMA</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stok Yöneticisi</span>
          </div>
        </div>

        {/* Undo / Redo Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button 
            onClick={handleUndo} 
            disabled={!canUndo}
            className="btn" 
            style={{ 
              flex: 1, 
              background: canUndo ? 'rgba(255,255,255,0.05)' : 'transparent', 
              color: canUndo ? '#fff' : 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              padding: '6px',
              justifyContent: 'center',
              borderRadius: '8px'
            }}
            title="Geri Al"
          >
            <Undo2 size={16} />
          </button>
          <button 
            onClick={handleRedo} 
            disabled={!canRedo}
            className="btn" 
            style={{ 
              flex: 1, 
              background: canRedo ? 'rgba(255,255,255,0.05)' : 'transparent', 
              color: canRedo ? '#fff' : 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              padding: '6px',
              justifyContent: 'center',
              borderRadius: '8px'
            }}
            title="İleri Al"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                padding: '12px 16px',
                background: activeTab === item.id ? 'var(--bg-card-hover)' : 'transparent',
                color: activeTab === item.id ? 'var(--text-main)' : 'var(--text-muted)',
                borderLeft: activeTab === item.id ? '3px solid var(--accent-blue)' : '3px solid transparent',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <span style={{ color: activeTab === item.id ? 'var(--accent-blue)' : 'inherit' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }} 
          />
          <button onClick={handleImportClick} className="btn btn-outline" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
            <Upload size={16} />
            Excel'den Yükle
          </button>
          <button onClick={handleExport} className="btn btn-primary" style={{ justifyContent: 'center', fontSize: '0.85rem', marginBottom: '24px' }}>
            <Download size={16} />
            Excel İndir
          </button>

          {/* Admin Menu Item (Bottom Left) */}
          <button
            onClick={() => setActiveTab('admin')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              background: activeTab === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--status-red)' : 'var(--text-muted)',
              borderLeft: activeTab === 'admin' ? '3px solid var(--status-red)' : '3px solid transparent',
              borderRadius: '0 8px 8px 0',
              marginTop: 'auto',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span style={{ color: activeTab === 'admin' ? 'var(--status-red)' : 'inherit' }}>
              <Package size={20} />
            </span>
            Yönetici
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div>
            <h2>{activeTab === 'admin' ? 'Yönetici Paneli' : activeTab === 'emanet' ? 'Emanet Takibi' : menuItems.find(m => m.id === activeTab)?.label}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>GÖKBÖRÜ Arama Kurtarma Derneği Envanter Yönetimi.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <div style={{ background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
               {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', minHeight: 'calc(100vh - 160px)' }}>
          {activeTab === 'dashboard' && <Dashboard inventory={inventory} transactions={transactions} maintenances={maintenances} />}
          {activeTab === 'inventory' && <Inventory inventory={inventory} />}
          {activeTab === 'transaction' && <TransactionForm inventory={inventory} onTransaction={handleTransaction} savedNotes={savedTransactionNotes} setSavedNotes={setSavedTransactionNotes} />}
          {activeTab === 'maintenance' && <MaintenancePanel inventory={inventory} maintenances={maintenances} onAdd={handleAddMaintenance} onUpdate={handleUpdateMaintenance} onDelete={handleDeleteMaintenance} savedNotes={savedMaintenanceNotes} setSavedNotes={setSavedMaintenanceNotes} />}
          {activeTab === 'emanet' && <EmanetPanel inventory={inventory} emanetler={emanetler} onAdd={handleAddEmanet} onReturn={handleReturnEmanet} onDelete={handleDeleteEmanet} onDeduct={handleDeductEmanet} />}
          {activeTab === 'history' && <TransactionHistory transactions={transactions} />}
          {activeTab === 'admin' && <AdminPanel inventory={inventory} transactions={transactions} emanetler={emanetler} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} maintenances={maintenances} onUpdateMaintenance={handleUpdateMaintenance} onDeleteMaintenance={handleDeleteMaintenance} onGenerateAuto={handleGenerateAutoMaintenance} />}
        </div>
      </div>
    </div>
  );
}

export default App;
