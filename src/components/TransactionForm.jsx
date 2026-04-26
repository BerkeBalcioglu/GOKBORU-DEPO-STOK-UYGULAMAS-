import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, PlusCircle, Search, MapPin } from 'lucide-react';
import SmartInput from './SmartInput';

export default function TransactionForm({ inventory, onTransaction, savedNotes, setSavedNotes, transactions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductGroup, setSelectedProductGroup] = useState([]); // List of items with the same name
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(''); // The specific item ID chosen
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isAddingToNewWarehouse, setIsAddingToNewWarehouse] = useState(false);

  // New Item Fields
  const [newCode, setNewCode] = useState('');
  const [newUsage, setNewUsage] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newUnit, setNewUnit] = useState('Adet');
  const [newWarehouse, setNewWarehouse] = useState('Ana Depo');
  const [newShelf, setNewShelf] = useState('');
  const [newCategory, setNewCategory] = useState('Diğer'); 
  const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');

  const [type, setType] = useState('girdi');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
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
    setSelectedProductGroup([]);
    setSelectedWarehouseId('');
    setIsCreatingNew(false);
    setIsAddingToNewWarehouse(false);

    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter by name or code
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(value.toLowerCase()))
    );

    // Group by name for the suggestion dropdown
    const uniqueGroups = [];
    filtered.forEach(item => {
      if (!uniqueGroups.find(g => g.name === item.name)) {
        const itemsWithThisName = inventory.filter(i => i.name === item.name);
        const totalQuantity = itemsWithThisName.reduce((sum, i) => sum + i.quantity, 0);
        uniqueGroups.push({
          name: item.name,
          code: item.code,
          totalQuantity,
          items: itemsWithThisName,
          minStock: item.minStock
        });
      }
    });

    setSuggestions(uniqueGroups);
    setShowSuggestions(true);
    
    // Auto-select exact match
    const exactMatch = uniqueGroups.find(g => g.name.toLowerCase().trim() === value.toLowerCase().trim());
    if (exactMatch) {
      handleSelectSuggestion(exactMatch);
    }
  };

  const handleSelectSuggestion = (group) => {
    setSearchTerm(group.name);
    setSelectedProductGroup(group.items);
    setShowSuggestions(false);
    setIsCreatingNew(false);
    setIsAddingToNewWarehouse(false);
    
    // Auto-select warehouse if there's only one and it has stock (or we are doing Girdi)
    if (group.items.length === 1) {
       setSelectedWarehouseId(group.items[0].id);
    } else {
       setSelectedWarehouseId('');
    }
  };

  const handleCreateNewClick = () => {
    setIsCreatingNew(true);
    setSelectedProductGroup([]);
    setShowSuggestions(false);
    setType('girdi'); // Force girdi for new items
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Lütfen geçerli bir miktar girin.');
      return;
    }

    if (selectedProductGroup.length === 0 && !isCreatingNew) {
      alert('Lütfen listeden bir ürün seçin veya yeni ürün oluşturun.');
      return;
    }

    if (isCreatingNew) {
      if (!searchTerm.trim()) { alert('Lütfen yeni malzeme adını girin.'); return; }
      
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
        if (note.trim() && !savedNotes.includes(note.trim())) setSavedNotes(prev => [note.trim(), ...prev]);
        resetForm();
      }
    } else {
      // Existing Product Group
      if (!selectedWarehouseId && !isAddingToNewWarehouse) {
        alert('Lütfen işlem yapılacak depoyu seçin.');
        return;
      }

      if (isAddingToNewWarehouse) {
         if(!newWarehouse.trim()) { alert("Lütfen eklenecek yeni deponun adını girin."); return; }
         // We are adding an existing product to a completely new warehouse
         const baseItem = selectedProductGroup[0]; // Copy details from the first matching product
         const success = onTransaction(null, 'girdi', amount, note, {
           ...baseItem, // copy name, code, category, etc
           warehouse: newWarehouse.trim(),
           shelf: newShelf.trim(),
           quantity: 0, // It will be incremented by handleTransaction
           serialNumber: newSerialNumber !== '' ? newSerialNumber.trim() : (baseItem.serialNumber || '')
         });
         if (success) {
           if (note.trim() && !savedNotes.includes(note.trim())) setSavedNotes(prev => [note.trim(), ...prev]);
           resetForm();
         }
      } else {
         // Existing item in existing warehouse
         const targetItem = selectedProductGroup.find(i => i.id === selectedWarehouseId);
         if (type === 'cikti' && parseInt(amount) > targetItem.quantity) {
            alert(`Bu depoda yalnızca ${targetItem.quantity} adet var. İşlem iptal edildi.`);
            return;
         }
         
         const success = onTransaction(selectedWarehouseId, type, amount, note, {
           ...targetItem,
           serialNumber: newSerialNumber !== '' ? newSerialNumber.trim() : (targetItem.serialNumber || '')
         });
         
         if (success) {
           if (note.trim() && !savedNotes.includes(note.trim())) setSavedNotes(prev => [note.trim(), ...prev]);
           resetForm();
         }
      }
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedProductGroup([]);
    setSelectedWarehouseId('');
    setIsCreatingNew(false);
    setIsAddingToNewWarehouse(false);
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

  // Helper for UI
  const selectedSpecificItem = selectedWarehouseId ? selectedProductGroup.find(i => i.id === selectedWarehouseId) : null;

  return (
    <div className="transaction-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      {/* Left Column: Form */}
      <div style={{ flex: '1 1 450px', minWidth: '350px' }}>
        <h3 style={{ marginBottom: '24px' }}>Akıllı Girdi / Çıktı İşlemi</h3>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          {!isCreatingNew && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <button type="button" onClick={() => { setType('girdi'); setSelectedWarehouseId(''); setIsAddingToNewWarehouse(false); }} style={{ padding: '12px', borderRadius: '10px', border: type === 'girdi' ? '2px solid var(--status-green)' : '1px solid var(--border-color)', background: type === 'girdi' ? 'var(--status-green-bg)' : 'transparent', color: type === 'girdi' ? 'var(--status-green)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <ArrowDownToLine size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Girdi (+)</span>
              </button>
              <button type="button" onClick={() => { setType('cikti'); setSelectedWarehouseId(''); setIsAddingToNewWarehouse(false); }} style={{ padding: '12px', borderRadius: '10px', border: type === 'cikti' ? '2px solid var(--status-red)' : '1px solid var(--border-color)', background: type === 'cikti' ? 'var(--status-red-bg)' : 'transparent', color: type === 'cikti' ? 'var(--status-red)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
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
            <label>Ürün Seçimi</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" style={{ paddingLeft: '36px', width: '100%', borderColor: selectedProductGroup.length > 0 ? 'var(--status-green)' : '' }} value={searchTerm} onChange={handleSearchChange} placeholder="Ürün adı veya kodu ile ara..." autoComplete="off" />
            </div>

            {showSuggestions && searchTerm && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '250px', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
                {suggestions.map((group, idx) => (
                  <div key={idx} onClick={() => handleSelectSuggestion(group)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <span style={{ color: 'var(--accent-blue)', marginRight: '8px', fontSize: '0.75rem' }}>{group.code}</span>
                      {group.name}
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{group.items.length} farklı depoda mevcut</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: group.totalQuantity < (group.minStock || 5) ? 'var(--status-red)' : 'var(--status-green)' }}>Toplam: {group.totalQuantity}</span>
                    </div>
                  </div>
                ))}
                {suggestions.length === 0 && !isCreatingNew && (
                  <div onClick={handleCreateNewClick} style={{ padding: '10px 12px', cursor: 'pointer', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.05)', fontSize: '0.85rem' }}><PlusCircle size={14} /> Sistemi Yeni Ürün Olarak Ekle: <strong>{searchTerm}</strong></div>
                )}
              </div>
            )}
          </div>

          {/* WAREHOUSE SELECTION (Smart Logic) */}
          {selectedProductGroup.length > 0 && !isCreatingNew && (
            <div style={{ padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-blue)', marginBottom: '12px', fontWeight: 600 }}>
                <MapPin size={16} /> Hangi Depoda İşlem Yapılacak?
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedProductGroup.map(item => {
                  // If cikti, only show warehouses with stock > 0
                  if (type === 'cikti' && item.quantity <= 0) return null;
                  
                  return (
                    <label key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: selectedWarehouseId === item.id ? 'var(--accent-blue)' : 'var(--bg-card)', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: selectedWarehouseId === item.id ? 'var(--accent-blue)' : 'var(--border-color)', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" name="warehouse_select" checked={selectedWarehouseId === item.id} onChange={() => { setSelectedWarehouseId(item.id); setIsAddingToNewWarehouse(false); }} />
                        <div>
                          <div style={{ fontSize: '0.9rem', color: selectedWarehouseId === item.id ? '#fff' : 'inherit' }}>{item.warehouse}</div>
                          <div style={{ fontSize: '0.75rem', color: selectedWarehouseId === item.id ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>Raf: {item.shelf || '-'}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: selectedWarehouseId === item.id ? '#fff' : (item.quantity > 0 ? 'var(--status-green)' : 'var(--status-red)') }}>
                        {item.quantity} {item.unit}
                      </div>
                    </label>
                  );
                })}

                {/* Yeni Depoya Ekle seçeneği sadece GİRDİ işleminde görünür */}
                {type === 'girdi' && (
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: isAddingToNewWarehouse ? 'var(--status-green)' : 'var(--bg-card)', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: isAddingToNewWarehouse ? 'var(--status-green)' : 'var(--border-color)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="radio" name="warehouse_select" checked={isAddingToNewWarehouse} onChange={() => { setIsAddingToNewWarehouse(true); setSelectedWarehouseId(''); }} />
                      <div style={{ fontSize: '0.9rem', color: isAddingToNewWarehouse ? '#fff' : 'inherit' }}>
                        <PlusCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> 
                        Bu Ürünü Yeni Bir Depoya Ekle
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Additional details for selected existing item */}
          {selectedSpecificItem && !isCreatingNew && !isAddingToNewWarehouse && (
             <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedSpecificItem.serialNumber && <div>🆔 Seri No: <span style={{ color: 'var(--accent-blue)' }}>{selectedSpecificItem.serialNumber}</span></div>}
                {selectedSpecificItem.registrationNumber && <div>🛡️ Barkod No: <span style={{ color: 'var(--status-green)' }}>{selectedSpecificItem.registrationNumber}</span></div>}
             </div>
          )}

          {/* New Location inputs if adding to new warehouse */}
          {isAddingToNewWarehouse && !isCreatingNew && (
            <div style={{ background: 'rgba(16,185,129,0.05)', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px dashed var(--status-green)', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Yeni Depo Adı</label>
                  <input type="text" className="input-field" value={newWarehouse} onChange={(e) => setNewWarehouse(e.target.value)} placeholder="Örn: Araç 2" />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Raf/Kabin</label>
                  <input type="text" className="input-field" value={newShelf} onChange={(e) => setNewShelf(e.target.value)} placeholder="Örn: Çekmece 1" />
                </div>
              </div>
            </div>
          )}

          {isCreatingNew && (
            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px dashed var(--border-color)', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                <input type="text" className="input-field" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Kod" />
                <input type="text" className="input-field" value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Model" />
              </div>
              <input type="text" className="input-field" value={newUsage} onChange={(e) => setNewUsage(e.target.value)} placeholder="Kullanım Yeri" style={{ width: '100%', marginBottom: '8px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" className="input-field" value={newWarehouse} onChange={(e) => setNewWarehouse(e.target.value)} placeholder="Depo" />
                <input type="text" className="input-field" value={newShelf} onChange={(e) => setNewShelf(e.target.value)} placeholder="Raf" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                <input type="text" className="input-field" value={newSerialNumber} onChange={(e) => setNewSerialNumber(e.target.value)} placeholder="Seri No (Opsiyonel)" />
                <input type="text" className="input-field" value={newRegistrationNumber} onChange={(e) => setNewRegistrationNumber(e.target.value)} placeholder="Barkod No (Opsiyonel)" />
              </div>
              {/* Product Category Selector */}
              <div className="input-group" style={{ marginTop: '12px', marginBottom: 0 }}>
                <label>Kategori</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  {['Sarf', 'Sarf(Gıda)', 'Demirbaş', 'Diğer'].map(cat => (
                    <button key={cat} type="button" onClick={() => setNewCategory(cat)} style={{ padding: '6px', borderRadius: '6px', border: newCategory === cat ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)', background: newCategory === cat ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: newCategory === cat ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{cat}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
              (transactions || []).slice(0, 10).map(tx => (
                <div key={tx.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: tx.type === 'girdi' ? 'var(--status-green)' : (tx.type === 'transfer' ? 'var(--accent-blue)' : 'var(--status-red)') }}></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.itemName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: tx.type === 'girdi' ? 'var(--status-green)' : (tx.type === 'transfer' ? 'var(--accent-blue)' : 'var(--status-red)') }}>
                      {tx.type === 'girdi' ? '+' : (tx.type === 'transfer' ? '⇄' : '-')}{tx.amount}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note || '-'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
