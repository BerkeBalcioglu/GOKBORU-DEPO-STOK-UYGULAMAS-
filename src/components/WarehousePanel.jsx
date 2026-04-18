import React, { useState } from 'react';
import { Package, MapPin, ChevronRight, ChevronDown, Boxes, Search } from 'lucide-react';

export default function WarehousePanel({ inventory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWarehouse, setExpandedWarehouse] = useState(null);

  // Group inventory by warehouse
  const warehouseGroups = inventory.reduce((acc, item) => {
    const wh = item.warehouse || 'Genel / Belirtilmemiş';
    if (!acc[wh]) acc[wh] = [];
    acc[wh].push(item);
    return acc;
  }, {});

  const warehouses = Object.keys(warehouseGroups).sort();

  const toggleWarehouse = (wh) => {
    setExpandedWarehouse(expandedWarehouse === wh ? null : wh);
  };

  const filteredWarehouses = warehouses.filter(wh => 
    wh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouseGroups[wh].some(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0 }}>Depo Bazlı Stok Listesi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Depolardaki toplam ürün çeşitliliği ve miktarları.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Depo veya ürün ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '20px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {warehouses.map(wh => (
          <div key={wh} style={{ background: 'var(--bg-card-solid)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0 }}>{wh}</h4>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {warehouseGroups[wh].length} Çeşit Ürün | {warehouseGroups[wh].reduce((sum, item) => sum + (item.quantity || 0), 0)} Toplam Parça
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredWarehouses.map(wh => {
          const isExpanded = expandedWarehouse === wh;
          const items = warehouseGroups[wh];

          return (
            <div key={wh} style={{ background: 'var(--bg-card-solid)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleWarehouse(wh)}
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{wh}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({items.length} ürün)</span>
                </div>
                <Boxes size={20} style={{ opacity: 0.3 }} />
              </div>

              {isExpanded && (
                <div style={{ padding: '0 20px 20px' }}>
                  <table className="data-table" style={{ marginTop: '0' }}>
                    <thead>
                      <tr>
                        <th>Kod</th>
                        <th>Malzeme Adı</th>
                        <th>Raf / Konum</th>
                        <th style={{ textAlign: 'right' }}>Miktar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', width: '100px' }}>{item.code}</td>
                          <td style={{ fontWeight: 500 }}>{item.name}</td>
                          <td>
                            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                              {item.shelf || '-'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            {item.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>{item.unit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
