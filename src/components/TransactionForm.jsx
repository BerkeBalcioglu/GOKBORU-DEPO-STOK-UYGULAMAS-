import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, PlusCircle, Search } from 'lucide-react';
import SmartInput from './SmartInput';

export default function TransactionForm({ inventory, onTransaction, savedNotes, setSavedNotes, transactions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Item Fields
  const [newCode, setNewCode] = useState('');
  const [newUsage, setNewUsage] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newUnit, setNewUnit] = useState('Adet');
  const [newWarehouse, setNewWarehouse] = useState('Ana Depo');
  const [newShelf, setNewShelf] = useState('');
  const [newCategory, setNewCategory] = useState('Diğer'); // Sarf | Sarf (Gıda) | Demirbaş | Diğer
  const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');

  const [type, setType] = useState('girdi');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Extract unique usages for autocomplete
  const uniqueUsages = [...new Set(inventory.map(item => item.usage))].filter(Boolean);

  useEffect(() => {
    // Click outside to close suggestions
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedItem(null);
    setIsCreatingNew(false);

    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(value.toLowerCase()))
    );

    // Exact match check
    const exactMatch = inventory.find(item => item.name.toLowerCase().trim() === value.toLowerCase().trim());

    if (exactMatch) {
      setSelectedItem(exactMatch);
      setType('girdi');
      setNewCategory(exactMatch.category || 'Diğer');
    }

    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setShowSuggestions(false);
    setIsCreatingNew(false);
    setNewCategory(item.category || 'Diğer');
    setNewRegistrationNumber(item.registrationNumber || '');
    setNewSerialNumber(item.serialNumber || '');
  };

  const handleCreateNewClick = () => {
    setIsCreatingNew(true);
    setSelectedItem(null);
    setShowSuggestions(false);
    setType('girdi'); // Force girdi for new items
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Lütfen geçerli bir miktar girin.');
      return;
    }

    if (!selectedItem && !isCreatingNew) {
      alert('Lütfen listeden bir malzeme seçin veya yeni olarak ekleyin.');
      return;
    }

    if (isCreatingNew) {
      if (!searchTerm.trim()) {
        alert('Lütfen yeni malzeme adını girin.');
        return;
      }
      // Check again to prevent duplicate creation just in case
      const duplicate = inventory.find(item => item.name.toLowerCase() === searchTerm.toLowerCase());
      if (duplicate) {
        alert('Bu isimde bir ürün zaten mevcut. Lütfen arama sonuçlarından seçin.');
        setSelectedItem(duplicate);
        setIsCreatingNew(false);
        return;
      }

      if (newRegistrationNumber.trim()) {
        const duplicateReg = inventory.find(item => item.registrationNumber === newRegistrationNumber.trim());
        if (duplicateReg) {
          alert('Bu Barkod Numarası zaten kullanımda. Lütfen benzersiz bir numara girin.');
          return;
        }
      }

      const success = onTransaction(null, 'girdi', amount, note, {
        name: searchTerm,
        code: newCode,
        usage: newUsage,
        model: newModel,
        unit: newUnit,
        warehouse: newWarehouse,
        shelf: newShelf,
        category: newCategory,
        registrationNumber: newRegistrationNumber.trim(),
        serialNumber: newSerialNumber.trim()
      });

      if (success) {
        if (note.trim() && !savedNotes.includes(note.trim())) {
          setSavedNotes(prev => [note.trim(), ...prev]);
        }
        resetForm();
      }

    } else {
      // Update existing item's category if it's being changed in the form
      const success = onTransaction(selectedItem.id, type, amount, note, {
        ...selectedItem,
        category: newCategory,
        serialNumber: newSerialNumber !== '' ? newSerialNumber.trim() : (selectedItem.serialNumber || '')
      });
      if (success) {
        if (note.trim() && !savedNotes.includes(note.trim())) {
          setSavedNotes(prev => [note.trim(), ...prev]);
        }
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedItem(null);
    setIsCreatingNew(false);
    setAmount('');
    setNote('');
    setNewCode('');
    setNewUsage('');
    setNewModel('');
    setNewUnit('Adet');
    setNewWarehouse('Ana Depo');
    setNewShelf('');
    setNewCategory('Diğer');
    setNewRegistrationNumber('');
    setNewSerialNumber('');
  };

  const recentTransactions = (transactions || []).slice(0, 10);

  return (
    <div className="transaction-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>

      {/* Left Column: Form */}
      <div style={{ flex: '1 1 450px', minWidth: '350px' }}>
        <h3 style={{ marginBottom: '24px' }}>Akıllı Girdi / Çıktı İşlemi</h3>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>

          {!isCreatingNew && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <button type="button" onClick={() => setType('girdi')} style={{ padding: '12px', borderRadius: '10px', border: type === 'girdi' ? '2px solid var(--status-green)' : '1px solid var(--border-color)', background: type === 'girdi' ? 'var(--status-green-bg)' : 'transparent', color: type === 'girdi' ? 'var(--status-green)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <ArrowDownToLine size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Girdi (+)</span>
              </button>

              <button type="button" onClick={() => setType('cikti')} style={{ padding: '12px', borderRadius: '10px', border: type === 'cikti' ? '2px solid var(--status-red)' : '1px solid var(--border-color)', background: type === 'cikti' ? 'var(--status-red-bg)' : 'transparent', color: type === 'cikti' ? 'var(--status-red)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <ArrowUpFromLine size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Çıktı (-)</span>
              </button>
            </div>
          )}

          {isCreatingNew && (
            <div style={{ padding: '12px', background: 'var(--status-green-bg)', border: '1px solid var(--status-green)', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--status-green)', fontSize: '0.85rem' }}>
              <PlusCircle size={20} />
              <div><strong>Yeni Ürün Kaydı</strong></div>
              <button type="button" onClick={() => setIsCreatingNew(false)} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid currentColor', color: 'inherit', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>İptal</button>
            </div>
          )}

          <div className="input-group" ref={wrapperRef} style={{ position: 'relative' }}>
            <label>Malzeme Seçimi</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" style={{ paddingLeft: '36px', width: '100%', borderColor: selectedItem ? 'var(--status-green)' : '' }} value={searchTerm} onChange={handleSearchChange} placeholder="Ürün adı veya kodu..." autoComplete="off" />
            </div>

            {showSuggestions && searchTerm && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
                {suggestions.map(item => (
                  <div key={item.id} onClick={() => handleSelectSuggestion(item)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div><span style={{ color: 'var(--accent-blue)', marginRight: '8px', fontSize: '0.75rem' }}>{item.code}</span>{item.name}</div>
                    <span style={{ fontSize: '0.8rem', color: item.quantity < (item.minStock || 5) ? 'var(--status-red)' : 'var(--status-green)' }}>{item.quantity}</span>
                  </div>
                ))}
                {!selectedItem && <div onClick={handleCreateNewClick} style={{ padding: '10px 12px', cursor: 'pointer', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.05)', fontSize: '0.85rem' }}><PlusCircle size={14} /> Yeni oluştur: <strong>{searchTerm}</strong></div>}
              </div>
            )}
          </div>

          {selectedItem && !isCreatingNew && (
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Stok: <strong style={{ color: selectedItem.quantity < (selectedItem.minStock || 5) ? 'var(--status-red)' : 'var(--status-green)' }}>{selectedItem.quantity} {selectedItem.unit}</strong></span>
                <span>📍 {selectedItem.warehouse} / {selectedItem.shelf}</span>
              </div>
              {selectedItem.serialNumber && <div>🆔 Seri No: <span style={{ color: 'var(--accent-blue)' }}>{selectedItem.serialNumber}</span></div>}
              {selectedItem.registrationNumber && <div>🛡️ Barkod No: <span style={{ color: 'var(--status-green)' }}>{selectedItem.registrationNumber}</span></div>}
              <input
                type="text"
                className="input-field"
                value={newSerialNumber}
                onChange={(e) => setNewSerialNumber(e.target.value)}
                placeholder="Seri Numarası Güncelle (Opsiyonel)"
                style={{ fontSize: '0.75rem', padding: '4px 8px', height: 'auto', marginTop: '4px' }}
              />
            </div>
          )}

          {isCreatingNew && (
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px dashed var(--border-color)', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                <input type="text" className="input-field" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Kod" />
                <input type="text" className="input-field" value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Model" />
              </div>
              <input type="text" className="input-field" list="usages" value={newUsage} onChange={(e) => setNewUsage(e.target.value)} placeholder="Kullanım Yeri" style={{ width: '100%', marginBottom: '8px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" className="input-field" value={newWarehouse} onChange={(e) => setNewWarehouse(e.target.value)} placeholder="Depo" />
                <input type="text" className="input-field" value={newShelf} onChange={(e) => setNewShelf(e.target.value)} placeholder="Raf" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                <input type="text" className="input-field" value={newSerialNumber} onChange={(e) => setNewSerialNumber(e.target.value)} placeholder="Seri No (Opsiyonel)" />
                <input type="text" className="input-field" value={newRegistrationNumber} onChange={(e) => setNewRegistrationNumber(e.target.value)} placeholder="Barkod No (Opsiyonel)" />
              </div>
            </div>
          )}

          {/* Product Category Selector */}
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label>Kategori (Sarf, Demirbaş, Diğer)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              {['Sarf', 'Sarf(Gıda)', 'Demirbaş', 'Diğer'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: newCategory === cat ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                    background: newCategory === cat ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    color: newCategory === cat ? 'var(--accent-blue)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Miktar</label>
            <input type="number" className="input-field" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={{ fontSize: '1.1rem' }} />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label>Not</label>
            <SmartInput value={note} onChange={setNote} savedNotes={savedNotes} setSavedNotes={setSavedNotes} placeholder="İşlem açıklaması..." />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
            Onayla
          </button>
        </form>
      </div>

      {/* Right Column: Recent List */}
      <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
        <h3 style={{ marginBottom: '24px' }}>Son İşlemler</h3>
        <div style={{ background: 'var(--bg-card-solid)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
            {(transactions || []).length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Henüz işlem kaydı yok.</div>
            ) : (
              recentTransactions.map(tx => (
                <div key={tx.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '4px',
                      height: '32px',
                      borderRadius: '2px',
                      background: tx.type === 'girdi' ? 'var(--status-green)' : (tx.type === 'transfer' ? 'var(--accent-blue)' : 'var(--status-red)')
                    }}></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.itemName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.date).toLocaleDateString('tr-TR')} {new Date(tx.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: tx.type === 'girdi' ? 'var(--status-green)' : (tx.type === 'transfer' ? 'var(--accent-blue)' : 'var(--status-red)')
                    }}>
                      {tx.type === 'girdi' ? '+' : (tx.type === 'transfer' ? '⇄' : '-')}{tx.amount}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.note || (tx.type === 'transfer' ? 'Transfer' : '-')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {transactions && transactions.length > 10 && (
            <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Daha fazla işlem için 'İşlem Geçmişi' sekmesine bakın.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
