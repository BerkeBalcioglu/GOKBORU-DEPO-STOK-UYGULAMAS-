import React, { useState, useRef, useEffect } from 'react';
import { Move, Search, MapPin, ArrowRight, Package } from 'lucide-react';

export default function TransferPanel({ inventory, onTransfer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Transfer fields
  const [targetWarehouse, setTargetWarehouse] = useState('');
  const [targetShelf, setTargetShelf] = useState('');
  const [amount, setAmount] = useState(1);

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
    setSelectedItem(null);
    
    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = inventory.filter(item => 
      item.name.toLowerCase().includes(value.toLowerCase()) || 
      (item.code && item.code.toLowerCase().includes(value.toLowerCase()))
    );

    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setShowSuggestions(false);
    setTargetWarehouse(item.warehouse || '');
    setTargetShelf(item.shelf || '');
    setAmount(item.quantity);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) { alert('Lütfen bir malzeme seçin.'); return; }
    if (!targetWarehouse.trim()) { alert('Lütfen hedef depoyu girin.'); return; }
    
    if (window.confirm(`${amount} adet ${selectedItem.name} ürününü ${selectedItem.warehouse || 'Mevcut Depo'} -> ${targetWarehouse} adresine taşımak istediğinize emin misiniz?`)) {
      onTransfer(selectedItem.id, targetWarehouse, targetShelf, amount);
      setSelectedItem(null);
      setSearchTerm('');
      setTargetWarehouse('');
      setTargetShelf('');
      setAmount(1);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Depo Arası Transfer</h3>
        <p style={{ color: 'var(--text-muted)' }}>Ürünlerin fiziksel konumunu güncelleyin.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card-solid)', padding: '32px', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}>
        
        {/* Item Selection */}
        <div className="input-group" ref={wrapperRef} style={{ position: 'relative' }}>
          <label>Transfer Edilecek Malzeme</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '40px', width: '100%', borderColor: selectedItem ? 'var(--status-green)' : '' }}
              value={searchTerm} 
              onChange={handleSearchChange}
              placeholder="Malzeme adı veya kodu..."
              autoComplete="off"
            />
          </div>

          {showSuggestions && searchTerm && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '8px', zIndex: 10, maxHeight: '250px', overflowY: 'auto', boxShadow: 'var(--shadow-2xl)' }}>
              {suggestions.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleSelect(item)}
                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.code} | {item.warehouse} - {item.shelf}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{item.quantity} {item.unit}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedItem && (
          <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px' }}>
              
              {/* Current Location */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Mevcut Konum</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedItem.warehouse || 'Belirtilmemiş'}</div>
                <div style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{selectedItem.shelf || '-'}</div>
              </div>

              <div style={{ color: 'var(--text-muted)' }}>
                <ArrowRight size={24} />
              </div>

              {/* Target Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Hedef Depo" 
                  value={targetWarehouse} 
                  onChange={e => setTargetWarehouse(e.target.value)} 
                  style={{ textAlign: 'center', fontWeight: 700 }}
                  list="warehouse-list-transfer"
                />
                <datalist id="warehouse-list-transfer">
                  {[...new Set(inventory.map(i => i.warehouse))].filter(Boolean).map(wh => (
                    <option key={wh} value={wh} />
                  ))}
                </datalist>

                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Hedef Raf" 
                  value={targetShelf} 
                  onChange={e => setTargetShelf(e.target.value)} 
                  style={{ textAlign: 'center', fontSize: '0.9rem' }}
                  list="shelf-list-transfer"
                />
                <datalist id="shelf-list-transfer">
                  {[...new Set(inventory.map(i => i.shelf))].filter(Boolean).map(sh => (
                    <option key={sh} value={sh} />
                  ))}
                </datalist>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Transfer Edilecek Miktar:</label>
              <input 
                type="number" 
                className="input-field" 
                min="1" 
                max={selectedItem.quantity} 
                value={amount} 
                onChange={e => setAmount(Math.min(selectedItem.quantity, Math.max(1, parseInt(e.target.value) || 1)))} 
                style={{ width: '80px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '0.9rem' }}>/ {selectedItem.quantity} {selectedItem.unit}</span>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={!selectedItem}
          style={{ width: '100%', marginTop: '32px', padding: '16px', justifyContent: 'center', fontSize: '1.1rem', borderRadius: '12px' }}
        >
          <Move size={20} />
          Transferi Tamamla
        </button>
      </form>
    </div>
  );
}
