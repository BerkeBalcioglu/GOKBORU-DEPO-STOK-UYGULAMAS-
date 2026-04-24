import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Package, ArrowRightLeft, History, LayoutDashboard, Download, Upload, Wrench, Undo2, Redo2, Boxes, Move } from 'lucide-react';
import Inventory from './components/Inventory';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import MaintenancePanel from './components/MaintenancePanel';
import EmanetPanel from './components/EmanetPanel';
import TransferPanel from './components/TransferPanel';
import WarehousePanel from './components/WarehousePanel';
import { exportToExcel, importFromExcel } from './utils/excelUtils';

// Mock Initial Data
const initialInventoryData = [
  { id: 1, code: 'GKB-001', name: 'Jeneratör', model: '7.5 kVA', usage: 'Kurtarma', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf A1', minStock: 1, category: 'Demirbaş', registrationNumber: 'SCL-001', serialNumber: 'SER-001' },
  { id: 2, code: 'GKB-002', name: 'Jeneratör', model: '7.5 kVA', usage: 'Anakamp', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf A1', minStock: 1, category: 'Demirbaş', registrationNumber: 'SCL-002', serialNumber: 'SER-002' },
  { id: 3, code: 'GKB-003', name: 'Jeneratör', model: '2 kVA (çanta tipi)', usage: 'Anakamp', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf A2', minStock: 1, category: 'Demirbaş', registrationNumber: 'SCL-003', serialNumber: 'SER-003' },
  { id: 4, code: 'GKB-004', name: 'Ağır Hizmet Kırıcı ve Uçları', model: '16 kg veya Muadil', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf B1', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-004', serialNumber: 'SER-004' },
  { id: 5, code: 'GKB-005', name: 'Kırıcı-Delici ve Uçları', model: '11 kg veya Muadil', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf B1', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-005', serialNumber: 'SER-005' },
  { id: 6, code: 'GKB-006', name: 'Motorlu Testere', model: 'Minimum 50 cm Pala', usage: 'Kurtarma', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf B2', minStock: 1, category: 'Demirbaş', registrationNumber: 'SCL-006', serialNumber: 'SER-006' },
  { id: 7, code: 'GKB-007', name: 'Balyoz', model: '5 kg', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C1', minStock: 4, category: 'Demirbaş', registrationNumber: 'SCL-007', serialNumber: 'SER-007' },
  { id: 8, code: 'GKB-008', name: 'Çekiç', model: '2 kg', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C1', minStock: 4, category: 'Demirbaş', registrationNumber: 'SCL-008', serialNumber: 'SER-008' },
  { id: 9, code: 'GKB-009', name: 'Murç', model: '', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C1', minStock: 2, category: 'Diğer', registrationNumber: 'SCL-009', serialNumber: 'SER-009' },
  { id: 10, code: 'GKB-010', name: 'Topuklu Manivela', model: 'Minimum 150 cm', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C2', minStock: 2, category: 'Diğer', registrationNumber: 'SCL-010', serialNumber: 'SER-010' },
  { id: 11, code: 'GKB-011', name: 'Balta', model: 'Orta Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C2', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-011', serialNumber: 'SER-011' },
  { id: 12, code: 'GKB-012', name: 'Demir Kesme Makası', model: 'Küçük Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C2', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-012', serialNumber: 'SER-012' },
  { id: 13, code: 'GKB-013', name: 'Demir Kesme Makası', model: 'Orta Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C3', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-013', serialNumber: 'SER-013' },
  { id: 14, code: 'GKB-014', name: 'Demir Kesme Makası', model: 'Büyük Boy', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf C3', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-014', serialNumber: 'SER-014' },
  { id: 15, code: 'GKB-015', name: 'Kürek', model: 'Kısa Metal Saplı', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D1', minStock: 4, category: 'Demirbaş', registrationNumber: 'SCL-015', serialNumber: 'SER-015' },
  { id: 16, code: 'GKB-016', name: 'Kürek', model: 'Uzun Ahşap Saplı', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D1', minStock: 4, category: 'Demirbaş', registrationNumber: 'SCL-016', serialNumber: 'SER-016' },
  { id: 17, code: 'GKB-017', name: 'Kazma', model: 'Ahşap Saplı', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D1', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-017', serialNumber: 'SER-017' },
  { id: 18, code: 'GKB-018', name: 'Kova', model: 'Metal veya Sağlam Kauçuk', usage: 'Kurtarma', quantity: 5, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf D2', minStock: 5, category: 'Demirbaş', registrationNumber: 'SCL-018', serialNumber: 'SER-018' },
  { id: 19, code: 'GKB-019', name: 'LED Aydınlatma', model: 'Bataryalı', usage: 'Kurtarma', quantity: 4, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E1', minStock: 4, category: 'Demirbaş', registrationNumber: 'SCL-019', serialNumber: 'SER-019' },
  { id: 20, code: 'GKB-020', name: 'LED Aydınlatma', model: '50 W Ayaklı', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E1', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-020', serialNumber: 'SER-020' },
  { id: 21, code: 'GKB-021', name: 'Yakıt ve Yağ Hunisi', model: 'Büyük-Orta-Küçük', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E2', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-021', serialNumber: 'SER-021' },
  { id: 22, code: 'GKB-022', name: 'Tamir ve Bakım Alet Çantası', model: 'Gerekli Aletler Dahil', usage: 'Lojistik', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf E2', minStock: 1, category: 'Demirbaş', registrationNumber: 'SCL-022', serialNumber: 'SER-022' },
  { id: 23, code: 'GKB-023', name: 'İlk Yardım Çantası', model: '', usage: 'Kurtarma', quantity: 2, unit: 'Adet', warehouse: 'Medikal Depo', shelf: 'Raf F1', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-023', serialNumber: 'SER-023' },
  { id: 24, code: 'GKB-024', name: 'El Telsizi', model: '', usage: 'İletişim', quantity: 8, unit: 'Adet', warehouse: 'İletişim Depo', shelf: 'Raf F1', minStock: 8, category: 'Demirbaş', registrationNumber: 'SCL-024', serialNumber: 'SER-024' },
  { id: 25, code: 'GKB-025', name: 'GPS veya GAIA Uygulama (Cep)', model: '', usage: 'İletişim', quantity: 2, unit: 'Adet', warehouse: 'İletişim Depo', shelf: 'Raf F1', minStock: 2, category: 'Demirbaş', registrationNumber: 'SCL-025', serialNumber: 'SER-025' },
  { id: 26, code: 'GKB-026', name: 'Yangın Söndürme Cihazı', model: 'ABC Tozlu', usage: 'Kurtarma', quantity: 10, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf F2', minStock: 10, category: 'Demirbaş', registrationNumber: 'SCL-026', serialNumber: 'SER-026' },
  { id: 27, code: 'GKB-027', name: 'Hazır Yemek Paketi', model: 'Kişi başı 3 Öğün x Gün', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G1', minStock: 15, category: 'Sarf(Gıda)', registrationNumber: 'SCL-027', serialNumber: 'SER-027' },
  { id: 28, code: 'GKB-028', name: 'Su', model: 'Günlük 3 Litre İçme Suyu', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G1', minStock: 15, category: 'Sarf(Gıda)', registrationNumber: 'SCL-028', serialNumber: 'SER-028' },
  { id: 29, code: 'GKB-029', name: 'Büyük Çay Kazanı', model: '', usage: 'Personel', quantity: 1, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G2', minStock: 1, category: 'Demirbaş', registrationNumber: 'SCL-029', serialNumber: 'SER-029' },
  { id: 30, code: 'GKB-030', name: 'Yeter Miktarda Çay,Kahve,Bardak', model: '', usage: 'Lojistik', quantity: 1, unit: 'Adet', warehouse: 'Lojistik Depo', shelf: 'Raf G2', minStock: 1, category: 'Sarf(Gıda)', registrationNumber: 'SCL-030', serialNumber: 'SER-030' },
  { id: 31, code: 'GKB-031', name: 'Emniyet Şeridi', model: '', usage: 'Kurtarma', quantity: 3, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf H1', minStock: 3, category: 'Sarf', registrationNumber: 'SCL-031', serialNumber: 'SER-031' },
  { id: 32, code: 'GKB-032', name: 'Megafon', model: '', usage: 'Kurtarma', quantity: 1, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf H1', minStock: 1, category: 'Demirbaş', registrationNumber: 'SCL-032', serialNumber: 'SER-032' },
  { id: 33, code: 'GKB-033', name: 'Sprey Boya', model: 'Farklı Renklerde', usage: 'Kurtarma', quantity: 3, unit: 'Adet', warehouse: 'Ana Depo', shelf: 'Raf H1', minStock: 3, category: 'Sarf', registrationNumber: 'SCL-033', serialNumber: 'SER-033' },
  { id: 34, code: 'GKB-034', name: 'Baret', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 1', minStock: 30, category: 'Demirbaş', registrationNumber: 'SCL-034', serialNumber: 'SER-034' },
  { id: 35, code: 'GKB-035', name: 'Baret Lambası', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 1', minStock: 30, category: 'Demirbaş', registrationNumber: 'SCL-035', serialNumber: 'SER-035' },
  { id: 36, code: 'GKB-036', name: 'El Projektörü', model: '', usage: 'Personel', quantity: 8, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 1', minStock: 8, category: 'Demirbaş', registrationNumber: 'SCL-036', serialNumber: 'SER-036' },
  { id: 37, code: 'GKB-037', name: 'İş Eldiveni', model: '', usage: 'Personel', quantity: 90, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 2', minStock: 90, category: 'Sarf', registrationNumber: 'SCL-037', serialNumber: 'SER-037' },
  { id: 38, code: 'GKB-038', name: 'Göz Koruyucu', model: '', usage: 'Personel', quantity: 60, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 2', minStock: 60, category: 'Demirbaş', registrationNumber: 'SCL-038', serialNumber: 'SER-038' },
  { id: 39, code: 'GKB-039', name: 'Kulak Koruyucu', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 2', minStock: 30, category: 'Demirbaş', registrationNumber: 'SCL-039', serialNumber: 'SER-039' },
  { id: 40, code: 'GKB-040', name: 'Solunum Yolu Koruyucu (Maske)', model: '', usage: 'Personel', quantity: 90, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 3', minStock: 90, category: 'Sarf', registrationNumber: 'SCL-040', serialNumber: 'SER-040' },
  { id: 41, code: 'GKB-041', name: 'İş Botu', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 3', minStock: 30, category: 'Demirbaş', registrationNumber: 'SCL-041', serialNumber: 'SER-041' },
  { id: 42, code: 'GKB-042', name: 'Kıyafet', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 4', minStock: 30, category: 'Demirbaş', registrationNumber: 'SCL-042', serialNumber: 'SER-042' },
  { id: 43, code: 'GKB-043', name: 'Uyku Tulumu', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 4', minStock: 30, category: 'Demirbaş', registrationNumber: 'SCL-043', serialNumber: 'SER-043' },
  { id: 44, code: 'GKB-044', name: 'Mat', model: '', usage: 'Personel', quantity: 30, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 5', minStock: 30, category: 'Demirbaş', registrationNumber: 'SCL-044', serialNumber: 'SER-044' },
  { id: 45, code: 'GKB-045', name: 'Çadır', model: 'Personel', usage: 'Personel', quantity: 15, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 5', minStock: 15, category: 'Demirbaş', registrationNumber: 'SCL-045', serialNumber: 'SER-045' },
  { id: 46, code: 'GKB-046', name: 'Farklı Ebatlarda Çadır', model: 'Lojistik ve Yönetim amaçlı', usage: 'Anakamp', quantity: 6, unit: 'Adet', warehouse: 'Personel Depo', shelf: 'Kabin 5', minStock: 6, category: 'Demirbaş', registrationNumber: 'SCL-046', serialNumber: 'SER-046' }
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

  // Load from Server or LocalStorage
  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const response = await fetch('http://localhost:3001/load-local-db');
        if (response.ok) {
          const data = await response.json();
          if (data.inventory) setInventory(data.inventory);
          if (data.transactions) setTransactions(data.transactions);
          if (data.maintenances) setMaintenances(data.maintenances);
          if (data.savedTransactionNotes) setSavedTransactionNotes(data.savedTransactionNotes);
          if (data.savedMaintenanceNotes) setSavedMaintenanceNotes(data.savedMaintenanceNotes);
          if (data.emanetler) setEmanetler(data.emanetler);
          console.log("Loaded data from local database server.");
          return true;
        }
      } catch (e) {
        console.warn("Local DB Server not reached, using LocalStorage.");
      }
      return false;
    };

    const loadFromLocal = () => {
      const load = (key, fallback) => {
        const saved = localStorage.getItem(key);
        try { return saved ? JSON.parse(saved) : fallback; } catch { return fallback; }
      };
      
      setInventory(load('akut_inventory', initialInventoryData));
      setTransactions(load('akut_transactions', []));
      setMaintenances(load('gkb_maintenances', []));
      setSavedTransactionNotes(load('gkb_saved_tx_notes', []));
      setSavedMaintenanceNotes(load('gkb_saved_mx_notes', []));
      setEmanetler(load('gkb_emanetler', []));
    };

    loadFromServer().then(success => {
      if (!success) loadFromLocal();
    });
  }, []);

  // Combined Save Effect (Local & Server)
  useEffect(() => {
    if (inventory.length === 0) return;

    // 1. LocalStorage
    localStorage.setItem('akut_inventory', JSON.stringify(inventory));
    localStorage.setItem('akut_transactions', JSON.stringify(transactions));
    localStorage.setItem('gkb_maintenances', JSON.stringify(maintenances));
    localStorage.setItem('gkb_saved_tx_notes', JSON.stringify(savedTransactionNotes));
    localStorage.setItem('gkb_saved_mx_notes', JSON.stringify(savedMaintenanceNotes));
    localStorage.setItem('gkb_emanetler', JSON.stringify(emanetler));

    // 2. Server (Automatic Local Excel/JSON DB)
    const syncWithServer = async () => {
      try {
        await fetch('http://localhost:3001/save-local-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            inventory, transactions, maintenances, 
            savedTransactionNotes, savedMaintenanceNotes, emanetler 
          })
        });
      } catch (e) {
        console.warn("Could not sync with local database server.");
      }
    };
    
    // Use a small timeout to debounce rapid changes if needed, 
    // but here we just call it.
    syncWithServer();

  }, [inventory, transactions, maintenances, savedTransactionNotes, savedMaintenanceNotes, emanetler]);

  // Optimized History Tracker
  useEffect(() => {
    if (inventory.length === 0) return;
    if (isUndoRedo.current) { isUndoRedo.current = false; return; }

    const snapshot = { inventory, transactions, maintenances };
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 30) newHistory.shift();
    
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, [inventory, transactions, maintenances]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedo.current = true;
      const currentState = historyRef.current[historyIndexRef.current];
      historyIndexRef.current -= 1;
      const prevState = historyRef.current[historyIndexRef.current];
      
      if (JSON.stringify(currentState.maintenances) !== JSON.stringify(prevState.maintenances)) setActiveTab('maintenance');
      else if (JSON.stringify(currentState.transactions) !== JSON.stringify(prevState.transactions)) setActiveTab('history');
      else if (JSON.stringify(currentState.inventory) !== JSON.stringify(prevState.inventory)) setActiveTab('inventory');

      setInventory(prevState.inventory);
      setTransactions(prevState.transactions);
      setMaintenances(prevState.maintenances);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedo.current = true;
      const currentState = historyRef.current[historyIndexRef.current];
      historyIndexRef.current += 1;
      const nextState = historyRef.current[historyIndexRef.current];
      
      if (JSON.stringify(currentState.maintenances) !== JSON.stringify(nextState.maintenances)) setActiveTab('maintenance');
      else if (JSON.stringify(currentState.transactions) !== JSON.stringify(nextState.transactions)) setActiveTab('history');
      else if (JSON.stringify(currentState.inventory) !== JSON.stringify(nextState.inventory)) setActiveTab('inventory');

      setInventory(nextState.inventory);
      setTransactions(nextState.transactions);
      setMaintenances(nextState.maintenances);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

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
    let finalItemDetails = null;
    let nextInventory = [...inventory];

    if (newItemDetails) {
      // Create new item
      const newItem = {
        id: Date.now(),
        code: newItemDetails.code || `GKB-${Math.floor(Math.random() * 10000)}`,
        name: newItemDetails.name,
        usage: newItemDetails.usage,
        model: newItemDetails.model || '',
        quantity: numericAmount,
        minStock: parseInt(newItemDetails.minStock) || 5,
        unit: newItemDetails.unit || 'Adet',
        warehouse: newItemDetails.warehouse || '-',
        shelf: newItemDetails.shelf || '-',
        category: newItemDetails.category || 'Diğer',
        lastUpdated: Date.now()
      };
      
      nextInventory = [...nextInventory, newItem];
      finalItemDetails = newItem;
      success = true;
      type = 'girdi';
    } else {
      // Existing item transaction
      const itemIdx = nextInventory.findIndex(it => it.id === itemId);
      if (itemIdx === -1) return false;

      const item = nextInventory[itemIdx];
      const updatedCategory = newItemDetails?.category || item.category || 'Diğer';
      
      if (type === 'girdi') {
        nextInventory[itemIdx] = { ...item, quantity: item.quantity + numericAmount, category: updatedCategory, lastUpdated: Date.now() };
        finalItemDetails = nextInventory[itemIdx];
        success = true;
      } else if (type === 'cikti') {
        if (item.quantity < numericAmount) {
          numericAmount = item.quantity;
        }
        if (numericAmount > 0) {
          nextInventory[itemIdx] = { ...item, quantity: item.quantity - numericAmount, category: updatedCategory, lastUpdated: Date.now() };
          finalItemDetails = nextInventory[itemIdx];
          success = true;
        }
      }

    }

    if (success && finalItemDetails) {
      // ATOMIC UPDATE: We update both states immediately
      const newTransaction = {
        id: Date.now(),
        itemId: finalItemDetails.id,
        itemName: finalItemDetails.name,
        type: type,
        amount: numericAmount,
        date: new Date().toISOString(),
        note: note || ''
      };

      setInventory(nextInventory);
      setTransactions(prev => [newTransaction, ...prev]);
      setActiveTab('inventory');
      return true;
    }

    return false;
  };


  const handleUpdateItem = (updatedItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? { ...updatedItem, lastUpdated: Date.now() } : item));
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
      alert('Bakım kaydı silindi.');
    }
  };

  const handleGenerateAutoMaintenance = () => {

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

      // Generate records for the last 24 months
      for (let i = 0; i <= 24; i++) {
        // If i=0, it's a "Future/Plan" or "Just done" maintenance for some items
        // But mainly we generate a history
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        d.setDate(Math.floor(Math.random() * 28) + 1);

        let details = "";
        let person = "Depo Sorumlusu";
        let isMajor = false;

        if (type === 'jeneratör') {
          if (i === 0 || i === 24) { 
            details = "2 YILLIK AĞIR BAKIM:\n1. Yağ ve tüm filtrelerin (yağ, yakıt, hava) değişimi\n2. Buji kontrolü ve gerekirse değişimi\n3. Akü voltaj ve asit testi\n4. Yük bankası testi (Load Bank Testing)\n5. Elektrik bağlantıları ve kablo korozyon temizliği"; 
            person = "Yetkili Teknik Servis";
            isMajor = true;
          }
          else if (i % 6 === 0) details = "Periyodik Kontrol: Yağ seviyesi kontrolü, yakıt kaçağı testi ve 30 dk yükte çalıştırma.";
          else if (i % 1 === 0) details = "Aylık rutin çalıştırma testi ve genel temizlik.";
        } 
        else if (type === 'kırıcı') {
          if (i === 0 || i === 24) { 
            details = "2 YILLIK BÜYÜK REVİZYON:\n1. Şanzıman yağı ve gres yenilemesi\n2. Motor kömürlerinin (fırça) kontrolü ve değişimi\n3. Rotor ve stator temizliği\n4. Mandren ve darbe mekanizması bakımı\n5. İzolasyon direnci ölçümü"; 
            person = "Bakım Atölyesi";
            isMajor = true;
          }
          else if (i % 4 === 0) details = "Kömür ve kablo bütünlük kontrolü, mandren yağlaması.";
          else details = "Rutin çalışma testi ve toz temizliği.";
        }
        else if (type === 'testere') {
          if (i === 0 || i === 24) { 
            details = "2 YILLIK MOTOR REVİZYONU:\n1. Buji, yakıt filtresi ve hava filtresi değişimi\n2. Karbüratör diyafram kontrolü ve ayarı\n3. Silindir kompresyon testi\n4. Pala ve zincir dişlisi aşınma kontrolü\n5. Debriyaj ve zincir freni güvenlik testi"; 
            person = "Teknik Servis";
            isMajor = true;
          }
          else if (i % 3 === 0) details = "Pala temizliği, zincir bileme ve yağlama kanallarının açılması.";
          else details = "Haftalık/Aylık çalıştırma testi ve zincir gerginlik kontrolü.";
        }
        else if (type === 'yangın') {
          if (i === 0 || i === 24) {
            details = "PERİYODİK DOLUM VE TEST:\n1. Hidrostatik basınç testi\n2. İtici gaz (N2) ve toz değişimi\n3. Vana ve hortum bütünlük kontrolü\n4. Mühürleme ve etiketleme";
            person = "Onaylı Dolum Tesisi";
            isMajor = true;
          } else {
            details = "Aylık basınç (manometre) kontrolü ve cihazı ters-yüz ederek tozun topaklanmasını önleme.";
          }
        }
        else if (type === 'telsiz' || type === 'gps') {
          if (i === 0 || i === 24) {
            details = "SİSTEM GÜNCELLEME VE KALİBRASYON:\n1. Batarya kapasite testi (Health Check)\n2. Yazılım/Firmware güncellemesi\n3. Anten ve konnektör oksit temizliği\n4. Sinyal güç ve modülasyon testi";
            isMajor = true;
          } else if (i % 6 === 0) {
            details = "Batarya derin deşarj ve tam şarj döngüsü (Kalibrasyon).";
          } else {
            details = "Çalışma testi ve fiziksel hasar kontrolü.";
          }
        }
        else {
          // General 2-year maintenance for other items
          if (i === 0 || i === 24) {
            details = "2 YILLIK GENEL MUAYENE: Malzemenin yapısal bütünlüğü, korozyon, çatlak ve aşınma kontrolleri yapıldı. Miadı dolan parçalar yenilendi.";
            isMajor = true;
          } else if (i % 12 === 0) {
            details = "Yıllık standart kontrol ve temizlik.";
          } else {
            continue; 
          }
        }

        newRecords.push({
          id: Date.now() + Math.random(),
          itemId: item.id,
          itemName: item.name,
          itemCode: item.code || '-',
          registrationNumber: item.registrationNumber || '',
          date: d.toISOString().split('T')[0],
          details: details,
          person: person,
          nextDate: null
        });
      }
    });

    setMaintenances(prev => [...newRecords, ...prev]);
    alert(`${newRecords.length} adet detaylı otomatik bakım geçmişi üretildi.`);
  };

  const handleExport = () => {
    exportToExcel(inventory, transactions, maintenances, emanetler);
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
  
   const handleRestoreData = (data) => {
    if (data.inventory) setInventory(data.inventory);
    if (data.transactions) setTransactions(data.transactions);
    if (data.maintenances) setMaintenances(data.maintenances);
    if (data.emanetler) setEmanetler(data.emanetler);
    if (data.savedTransactionNotes) setSavedTransactionNotes(data.savedTransactionNotes);
    if (data.savedMaintenanceNotes) setSavedMaintenanceNotes(data.savedMaintenanceNotes);
    alert('Buluttaki tüm veriler (notlar dahil) başarıyla yerel sisteme çekildi!');
  };

  const handleBackup = async () => {
    const webhookUrl = localStorage.getItem('gkb_google_sheet_url');
    if (!webhookUrl) {
      alert("Lütfen önce Yönetici panelinden Google Script URL'sini ayarlayın.");
      return;
    }
    
    const payload = {
      inventory,
      transactions: transactions || [],
      maintenances: maintenances || [],
      emanetler: emanetler || [],
      savedTransactionNotes: savedTransactionNotes || [],
      savedMaintenanceNotes: savedMaintenanceNotes || []
    };

    try {
      // Calling our local proxy instead of direct Google URL
      const response = await fetch('http://localhost:3001/cloud-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl.trim(), payload })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('✅ Veriler hem yerele hem de buluta başarıyla yedeklendi!');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert(`❌ Yedekleme hatası: ${error.message}`);
    }
  };


  const handlePull = async () => {
    const webhookUrl = localStorage.getItem('gkb_google_sheet_url');
    if (!webhookUrl) { alert("Bağlantı linki eksik."); return; }
    if (!window.confirm("Buluttaki veriler çekilecek. Mevcut yerel verilerinizin üzerine yazılacak. Onaylıyor musunuz?")) return;

    try {
      const response = await fetch(`http://localhost:3001/cloud-pull?url=${encodeURIComponent(webhookUrl.trim())}`);
      if (!response.ok) throw new Error('Sunucu yanıt vermedi');
      const data = await response.json();
      handleRestoreData(data);
    } catch (error) {
      alert(`❌ Veri çekme hatası: ${error.message}`);
    }
  };


  const handleTransfer = (itemId, targetWarehouse, targetShelf, amount) => {
    const numericAmount = parseInt(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const itemToTransfer = inventory.find(it => it.id === itemId);
    if (!itemToTransfer) return;

    if (numericAmount > itemToTransfer.quantity) {
      alert("Yetersiz miktar!");
      return;
    }

    let transferSuccess = false;

    setInventory(prev => {
      // Re-find the item in the current state to be safe
      const currentItem = prev.find(it => it.id === itemId);
      if (!currentItem) return prev;

      if (numericAmount === currentItem.quantity) {
        // Full transfer
        transferSuccess = true;
        return prev.map(item => {
          if (item.id === itemId) {
            return { ...item, warehouse: targetWarehouse, shelf: targetShelf, lastUpdated: Date.now() };
          }
          return item;
        });
      } else {
        // Partial transfer: Split the item
        transferSuccess = true;
        // 1. Reduce quantity of existing
        const updatedInventory = prev.map(item => {
          if (item.id === itemId) {
            return { ...item, quantity: item.quantity - numericAmount, lastUpdated: Date.now() };
          }
          return item;
        });

        // 2. Create new entry
        const newItemEntry = {
          ...currentItem,
          id: Date.now() + Math.random(),
          quantity: numericAmount,
          warehouse: targetWarehouse,
          shelf: targetShelf,
          lastUpdated: Date.now()
        };

        return [...updatedInventory, newItemEntry];
      }
    });

    if (transferSuccess) {
      const newTransaction = {
        id: Date.now(),
        itemId: itemId,
        itemName: itemToTransfer.name || 'Bilinmeyen Ürün',
        type: 'transfer',
        amount: numericAmount,
        date: new Date().toISOString(),
        note: `${itemToTransfer.warehouse || '-'} -> ${targetWarehouse} (${targetShelf})`
      };
      setTransactions(txs => [newTransaction, ...txs]);
      alert('Transfer işlemi başarıyla tamamlandı.');
      setActiveTab('warehouses');
    }
  };

  const handleDeductEmanet = (em, deductAmount) => {
    const amountToDeduct = parseInt(deductAmount) || em.amount;
    
    if (window.confirm(`${amountToDeduct} adet ${em.itemName} stoktan tamamen düşülecektir (Kaybolan/Zayi olan ürün). İşlemi onaylıyor musunuz?`)) {
      const success = handleTransaction(em.itemId, 'cikti', amountToDeduct, `Emanetten Zayi/Düşüm (${em.personName})`);
      if (success) {
        setEmanetler(prev => prev.map(e => {
          if (e.id === em.id) {
            if (amountToDeduct >= e.amount) {
              // Tamamı düşüldü
              return { ...e, status: 'dusuldu', dusumDate: new Date().toISOString() };
            } else {
              // Kısmi düşüldü, geri kalanı hala aktif emanet
              return { 
                ...e, 
                amount: e.amount - amountToDeduct, 
                note: (e.note ? e.note + " | " : "") + `${amountToDeduct} adet zayi olarak stoktan düşüldü.` 
              };
            }
          }
          return e;
        }));
        alert('Stok başarıyla düşüldü.');
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Stok Durumu', icon: <Package size={20} /> },
    { id: 'warehouses', label: 'Depo Listesi', icon: <Boxes size={20} /> },
    { id: 'transaction', label: 'Girdi / Çıktı Yap', icon: <ArrowRightLeft size={20} /> },
    { id: 'transfer', label: 'Depo Transfer', icon: <Move size={20} /> },
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
          {activeTab === 'inventory' && <Inventory inventory={inventory} emanetler={emanetler} />}
          {activeTab === 'warehouses' && <WarehousePanel inventory={inventory} />}
          {activeTab === 'transaction' && <TransactionForm inventory={inventory} onTransaction={handleTransaction} savedNotes={savedTransactionNotes} setSavedNotes={setSavedTransactionNotes} transactions={transactions} />}
          {activeTab === 'transfer' && <TransferPanel inventory={inventory} onTransfer={handleTransfer} />}
          {activeTab === 'maintenance' && <MaintenancePanel inventory={inventory} maintenances={maintenances} onAdd={handleAddMaintenance} onUpdate={handleUpdateMaintenance} onDelete={handleDeleteMaintenance} savedNotes={savedMaintenanceNotes} setSavedNotes={setSavedMaintenanceNotes} />}
          {activeTab === 'emanet' && <EmanetPanel inventory={inventory} emanetler={emanetler} onAdd={handleAddEmanet} onReturn={handleReturnEmanet} onDelete={handleDeleteEmanet} onDeduct={handleDeductEmanet} onBackup={handleBackup} onPull={handlePull} />}
          {activeTab === 'history' && <TransactionHistory transactions={transactions} />}
          {activeTab === 'admin' && <AdminPanel inventory={inventory} transactions={transactions} emanetler={emanetler} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} maintenances={maintenances} onUpdateMaintenance={handleUpdateMaintenance} onDeleteMaintenance={handleDeleteMaintenance} onGenerateAuto={handleGenerateAutoMaintenance} onRestore={handleRestoreData} savedTransactionNotes={savedTransactionNotes} savedMaintenanceNotes={savedMaintenanceNotes} onUpdateEmanet={ (updated) => setEmanetler(prev => prev.map(e => e.id === updated.id ? updated : e)) } onUpdateTransaction={ (updated) => setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t)) } onDeleteTransaction={ (id) => setTransactions(prev => prev.filter(t => t.id !== id)) } onBackup={handleBackup} onPull={handlePull} />}
        </div>
      </div>
    </div>
  );
}

export default App;
