import React, { useState } from 'react';
import { Search, ArrowUpDown, Clock } from 'lucide-react';

export default function Inventory({ inventory, emanetler = [] }) {
  const [categoryFilter, setCategoryFilter] = useState('Hepsi');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('lastUpdated'); // 'lastUpdated' | 'code'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  const categories = ['Hepsi', 'Sarf', 'Sarf(gıda)', 'Diğer'];

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.warehouse && item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.shelf && item.shelf.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'Hepsi' || (item.category || 'Diğer') === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sorting logic
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortField === 'lastUpdated') {
      const valA = a.lastUpdated || 0;
      const valB = b.lastUpdated || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
    
    if (sortField === 'code') {
      const valA = (a.code || '').toLowerCase();
      const valB = (b.code || '').toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }

    if (sortField === 'name') {
      const valA = (a.name || '').toLowerCase();
      const valB = (b.name || '').toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    }

    if (sortField === 'quantity') {
      const valA = a.quantity || 0;
      const valB = b.quantity || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }

    return 0;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={20} color="var(--accent-blue)" />
            Stok Durumu
            {sortField === 'lastUpdated' && (
              <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>
                <Clock size={12} style={{ marginRight: '4px' }} /> Son İşlemler Önde
              </span>
            )}
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
              <th 
                onClick={() => toggleSort('code')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                className="hover-bright"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ürün Kodu <ArrowUpDown size={14} style={{ opacity: sortField === 'code' ? 1 : 0.3 }} />
                </div>
              </th>
              <th 
                onClick={() => toggleSort('name')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                className="hover-bright"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Malzeme Adı <ArrowUpDown size={14} style={{ opacity: sortField === 'name' ? 1 : 0.3 }} />
                </div>
              </th>
              <th>Kullanım</th>
              <th>Model</th>
              <th>Konum (Depo/Raf)</th>
              <th>Kategori</th>
              <th 
                onClick={() => toggleSort('quantity')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                className="hover-bright"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Miktar <ArrowUpDown size={14} style={{ opacity: sortField === 'quantity' ? 1 : 0.3 }} />
                </div>
              </th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {sortedInventory.map(item => {

              const loanedQty = emanetler
                .filter(e => e.itemId === item.id && e.status === 'aktif')
                .reduce((sum, e) => sum + e.amount, 0);

              const isCritical = item.quantity < (item.minStock || 5);
              return (
                <tr key={item.id} style={{ borderLeft: item.lastUpdated ? '3px solid var(--accent-blue)' : '3px solid transparent' }}>
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

