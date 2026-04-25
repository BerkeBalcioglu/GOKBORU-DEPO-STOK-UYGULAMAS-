import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Clock } from 'lucide-react';

export default function Inventory({ inventory, emanetler = [] }) {
  const [categoryFilter, setCategoryFilter] = useState('Hepsi');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('lastUpdated'); // 'lastUpdated' | 'code'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  const categories = ['Hepsi', 'Sarf', 'Sarf(Gıda)', 'Demirbaş', 'Diğer'];

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.warehouse && item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.shelf && item.shelf.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'Hepsi' || (item.category || 'Diğer').toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, categoryFilter]);

  const groupedInventory = useMemo(() => {
    const groups = {};
    filteredInventory.forEach(item => {
      const key = item.code || item.name;
      if (!groups[key]) {
        groups[key] = {
          ...item,
          locations: [],
          totalQuantity: 0,
          ids: []
        };
      }
      groups[key].locations.push({
        warehouse: item.warehouse || '-',
        shelf: item.shelf || '-',
        quantity: item.quantity,
        id: item.id
      });
      groups[key].totalQuantity += item.quantity;
      groups[key].ids.push(item.id);
      
      if (!groups[key].lastUpdated || (item.lastUpdated && item.lastUpdated > groups[key].lastUpdated)) {
        groups[key].lastUpdated = item.lastUpdated;
      }
    });
    return Object.values(groups);
  }, [filteredInventory]);

  const sortedInventory = useMemo(() => {
    return [...groupedInventory].sort((a, b) => {
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
        const valA = a.totalQuantity || 0;
        const valB = b.totalQuantity || 0;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      if (sortField === 'location') {
        const locA = a.locations[0] ? `${a.locations[0].warehouse} ${a.locations[0].shelf}`.toLowerCase() : '';
        const locB = b.locations[0] ? `${b.locations[0].warehouse} ${b.locations[0].shelf}`.toLowerCase() : '';
        if (locA < locB) return sortDirection === 'asc' ? -1 : 1;
        if (locA > locB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });
  }, [groupedInventory, sortField, sortDirection]);

  const loanedMap = useMemo(() => {
    const map = {};
    emanetler.forEach(e => {
      if (e.status === 'aktif') {
        map[e.itemId] = (map[e.itemId] || 0) + e.amount;
      }
    });
    return map;
  }, [emanetler]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={20} color="var(--accent-blue)" />
            Stok Durumu
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => {
                setSortField('lastUpdated');
                setSortDirection('desc');
              }}
              className="hover-bright"
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: sortField === 'lastUpdated' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                color: sortField === 'lastUpdated' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginRight: '8px'
              }}
            >
              <Clock size={14} /> Son Eklenen
            </button>

            <button
              onClick={() => toggleSort('location')}
              className="hover-bright"
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: sortField === 'location' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                color: sortField === 'location' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginRight: '8px'
              }}
            >
              <ArrowUpDown size={14} /> Konuma Göre
            </button>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }}></div>
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
              <th 
                onClick={() => toggleSort('location')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                className="hover-bright"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Konum (Depo/Raf) <ArrowUpDown size={14} style={{ opacity: sortField === 'location' ? 1 : 0.3 }} />
                </div>
              </th>
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
              const loanedQty = item.ids.reduce((sum, id) => sum + (loanedMap[id] || 0), 0);
              const isCritical = item.totalQuantity < (item.minStock || 5);
              return (
                <tr key={item.code || item.id} style={{ borderLeft: item.lastUpdated ? '3px solid var(--accent-blue)' : '3px solid transparent' }}>
                  <td style={{ color: 'var(--text-muted)' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', fontSize: '0.85rem' }}>
                      {item.code || `#${item.id}`}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                    <div>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.2' }}>
                      {item.code && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📦 Stok No: {item.code}
                        </div>
                      )}
                      {item.registrationNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          🛡️ Barkod No: {item.registrationNumber}
                        </div>
                      )}
                      {item.serialNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          🆔 Seri No: {item.serialNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{item.usage}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.model || '-'}</td>
                  <td style={{ color: 'var(--accent-blue)', fontWeight: 500, minWidth: '220px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.locations.map((loc, idx) => (
                        <div key={idx} style={{ 
                          padding: '6px 10px', 
                          background: 'rgba(59, 130, 246, 0.08)', 
                          borderRadius: '8px', 
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', color: '#fff' }}>📍 {loc.warehouse}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{loc.shelf}</span>
                          </div>
                          <div style={{ 
                            background: 'var(--accent-blue)', 
                            color: '#fff', 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            fontSize: '0.8rem',
                            fontWeight: 700 
                          }}>
                            {loc.quantity}
                          </div>
                        </div>
                      ))}
                      {item.locations.length > 1 && (
                        <div style={{ fontSize: '0.65rem', textAlign: 'right', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          * {item.locations.length} farklı konumda bulunuyor
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      background: item.category === 'Demirbaş' ? 'rgba(245, 158, 11, 0.15)' : (item.category === 'Sarf' ? 'rgba(59, 130, 246, 0.1)' : (item.category === 'Sarf(Gıda)' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)')),
                      color: item.category === 'Demirbaş' ? '#f59e0b' : (item.category === 'Sarf' ? 'var(--accent-blue)' : (item.category === 'Sarf(Gıda)' ? 'var(--status-green)' : 'var(--text-muted)')),
                      border: '1px solid currentColor'
                    }}>
                      {item.category || 'Diğer'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 800, 
                        color: isCritical ? 'var(--status-red)' : 'var(--status-green)' 
                      }}>
                        {item.totalQuantity}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.unit || 'Adet'} (Toplam)</span>
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

