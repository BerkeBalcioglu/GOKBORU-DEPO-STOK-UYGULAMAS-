import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function Inventory({ inventory, emanetler = [] }) {
  const [categoryFilter, setCategoryFilter] = useState('Hepsi');
  const [searchTerm, setSearchTerm] = useState('');

  // Fixed categories as requested by the user
  const categories = ['Hepsi', 'Sarf', 'Sarf(gıda)', 'Diğer'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.warehouse && item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.shelf && item.shelf.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'Hepsi' || (item.category || 'Diğer') === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={20} color="var(--accent-blue)" />
            Stok Durumu
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  background: categoryFilter === cat ? 'var(--accent-blue)' : 'var(--bg-card)',
                  color: categoryFilter === cat ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ürün Ara (Ad, Kod, Konum)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '20px', padding: '10px 10px 10px 40px' }}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ürün Kodu</th>
              <th>Malzeme Adı</th>
              <th>Kullanım</th>
              <th>Model</th>
              <th>Konum (Depo/Raf)</th>
              <th>Kategori</th>
              <th>Miktar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
              const loanedQty = emanetler
                .filter(e => e.itemId === item.id && e.status === 'aktif')
                .reduce((sum, e) => sum + e.amount, 0);

              const isCritical = item.quantity < (item.minStock || 5);
              return (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', fontSize: '0.85rem' }}>
                      {item.code || `#${item.id}`}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item.name}</td>
                  <td>{item.usage}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.model || '-'}</td>
                  <td style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>📍 {item.warehouse || '-'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.shelf || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      background: item.category === 'Sarf' ? 'rgba(59, 130, 246, 0.1)' : (item.category === 'Sarf(Gıda)' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)'),
                      color: item.category === 'Sarf' ? 'var(--accent-blue)' : (item.category === 'Sarf(Gıda)' ? 'var(--status-green)' : 'var(--text-muted)'),
                      border: '1px solid currentColor'
                    }}>
                      {item.category || 'Diğer'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 600,
                        color: isCritical ? 'var(--status-red)' : 'var(--status-green)'
                      }}>
                        {item.quantity}
                      </span>
                      {loanedQty > 0 && (
                        <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>
                          (-{loanedQty})
                        </span>
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                        {item.unit || 'Adet'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {isCritical ? (
                      <span className="status-badge critical">Kritik Seviye</span>
                    ) : (
                      <span className="status-badge safe">Yeterli</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
