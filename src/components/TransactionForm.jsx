import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, PlusCircle, Search } from 'lucide-react';
import SmartInput from './SmartInput';

export default function TransactionForm({ inventory, onTransaction, savedNotes, setSavedNotes }) {
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
    }

    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setShowSuggestions(false);
    setIsCreatingNew(false);
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

      const success = onTransaction(null, 'girdi', amount, note, {
        name: searchTerm,
        code: newCode,
        usage: newUsage,
        model: newModel,
        unit: newUnit,
        warehouse: newWarehouse,
        shelf: newShelf
      });

      if (success) {
        if (note.trim() && !savedNotes.includes(note.trim())) {
          setSavedNotes(prev => [note.trim(), ...prev]);
        }
        resetForm();
      }

    } else {
      const success = onTransaction(selectedItem.id, type, amount, note);
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
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Akıllı Girdi / Çıktı İşlemi</h3>
      
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card-solid)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        
        {/* Type Selector (Hidden if creating new, as it must be Girdi) */}
        {!isCreatingNew && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setType('girdi')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: type === 'girdi' ? '2px solid var(--status-green)' : '1px solid var(--border-color)',
                background: type === 'girdi' ? 'var(--status-green-bg)' : 'transparent',
                color: type === 'girdi' ? 'var(--status-green)' : 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowDownToLine size={24} />
              <span style={{ fontWeight: 600 }}>Girdi (Ekle)</span>
            </button>
            
            <button
              type="button"
              onClick={() => setType('cikti')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: type === 'cikti' ? '2px solid var(--status-red)' : '1px solid var(--border-color)',
                background: type === 'cikti' ? 'var(--status-red-bg)' : 'transparent',
                color: type === 'cikti' ? 'var(--status-red)' : 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowUpFromLine size={24} />
              <span style={{ fontWeight: 600 }}>Çıktı (Düş)</span>
            </button>
          </div>
        )}

        {isCreatingNew && (
          <div style={{ padding: '16px', background: 'var(--status-green-bg)', border: '1px solid var(--status-green)', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--status-green)' }}>
             <PlusCircle size={24} />
             <div>
               <h4 style={{ margin: 0 }}>Yeni Ürün Kaydı (Otomatik Girdi)</h4>
               <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Girilen ürün daha önce sistemde yok, yeni bir kart açılacak.</span>
             </div>
             <button type="button" onClick={() => setIsCreatingNew(false)} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid currentColor', color: 'inherit', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}>İptal</button>
          </div>
        )}

        {/* Smart Input */}
        <div className="input-group" ref={wrapperRef} style={{ position: 'relative' }}>
          <label>Malzeme Adı veya Kodu</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>
              <Search size={18} />
            </div>
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '40px', width: '100%', borderColor: selectedItem ? 'var(--status-green)' : '' }}
              value={searchTerm} 
              onChange={handleSearchChange}
              onFocus={() => { if(searchTerm) setShowSuggestions(true) }}
              placeholder="Ürün adı yazmaya başlayın..."
              autoComplete="off"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchTerm && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
              {suggestions.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleSelectSuggestion(item)}
                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <span style={{ color: 'var(--accent-blue)', marginRight: '8px', fontSize: '0.8rem' }}>{item.code}</span>
                    {item.name}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: item.quantity < (item.minStock || 5) ? 'var(--status-red)' : 'var(--status-green)' }}>Stok: {item.quantity}</span>
                </div>
              ))}
              
              {!selectedItem && (
                <div 
                  onClick={handleCreateNewClick}
                  style={{ padding: '12px 16px', cursor: 'pointer', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.05)' }}
                >
                  <PlusCircle size={16} />
                  <strong>"{searchTerm}"</strong> isimli yeni ürün oluştur
                </div>
              )}
            </div>
          )}
        </div>

        {selectedItem && !isCreatingNew && (
          <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Seçilen: <strong>{selectedItem.name}</strong> ({selectedItem.code})</span>
            <span>Mevcut Stok: <strong style={{ color: selectedItem.quantity < (selectedItem.minStock || 5) ? 'var(--status-red)' : 'var(--status-green)' }}>{selectedItem.quantity}</strong></span>
          </div>
        )}

        {/* New Item Additional Fields */}
        {isCreatingNew && (
          <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px dashed var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Ürün Kodu (İsteğe Bağlı)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Otomatik oluşturulur"
                />
              </div>
              <div className="input-group">
                <label>Model / Marka</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newModel} 
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Örn: Honda 16.5kVA"
                />
              </div>
            </div>
            
            <div className="input-group" style={{ marginTop: '8px' }}>
              <label>Kullanım Yeri / Kategori</label>
              <input 
                type="text" 
                className="input-field" 
                list="usages"
                value={newUsage} 
                onChange={(e) => setNewUsage(e.target.value)}
                placeholder="Örn: Elektrik / Arama"
              />
              <datalist id="usages">
                {uniqueUsages.map((usage, index) => (
                  <option key={index} value={usage} />
                ))}
              </datalist>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label>Ölçü Birimi</label>
                <select className="input-field" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} style={{ appearance: 'none' }}>
                  <option value="Adet">Adet</option>
                  <option value="Set">Set</option>
                  <option value="Çift">Çift</option>
                  <option value="Kutu">Kutu</option>
                  <option value="Kg">Kg</option>
                  <option value="Metre">Metre</option>
                  <option value="Litre">Litre</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="input-group">
                  <label>Depo Yeri</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newWarehouse} 
                    onChange={(e) => setNewWarehouse(e.target.value)}
                    placeholder="Örn: Ana Depo, Tıbbi Depo"
                  />
                </div>
                <div className="input-group">
                  <label>Raf / Kabin</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newShelf} 
                    onChange={(e) => setNewShelf(e.target.value)}
                    placeholder="Örn: Raf A1, Kabin 3"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="input-group">
          <label>İşlem Miktarı</label>
          <input 
            type="number" 
            className="input-field" 
            min="1" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Örn: 5"
            style={{ fontSize: '1.2rem', padding: '16px' }}
          />
        </div>

        <div className="input-group" style={{ marginBottom: '24px' }}>
          <label>Not / Açıklama (Opsiyonel)</label>
          <SmartInput 
            value={note}
            onChange={setNote}
            savedNotes={savedNotes}
            setSavedNotes={setSavedNotes}
            placeholder="Örn: Tatbikat için araç 3'e yüklendi..."
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}>
          {isCreatingNew ? 'Yeni Ürünü Kaydet ve Ekle' : 'İşlemi Onayla'}
        </button>

      </form>
    </div>
  );
}
