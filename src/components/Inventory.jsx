import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function Inventory({ inventory }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.warehouse && item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.shelf && item.shelf.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3>Stok Durumu</h3>
        
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
              <th>Miktar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
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
                      fontSize: '1.1rem', 
                      fontWeight: 600,
                      color: isCritical ? 'var(--status-red)' : 'var(--status-green)'
                    }}>
                      {item.quantity} <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>{item.unit || 'Adet'}</span>
                    </span>
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
