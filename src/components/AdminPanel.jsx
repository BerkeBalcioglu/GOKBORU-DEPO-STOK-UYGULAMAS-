import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, Search, Package, Wrench, Zap, CloudUpload, Database, ArrowRightLeft, History } from 'lucide-react';

export default function AdminPanel({ 
  inventory, transactions, emanetler, onUpdate, onDelete, 
  maintenances, onUpdateMaintenance, onDeleteMaintenance, 
  onGenerateAuto, onRestore,
  savedTransactionNotes, savedMaintenanceNotes,
  onUpdateEmanet, onUpdateTransaction, onDeleteTransaction,
  onBackup, onPull
}) {
  const [adminTab, setAdminTab] = useState('inventory'); // 'inventory' | 'maintenance' | 'emanet' | 'history' | 'backup'
  
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('gkb_google_sheet_url');
    if (savedUrl) setWebhookUrl(savedUrl);
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.warehouse && item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMaintenances = (maintenances || []).filter(m => 
    m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmanetler = (emanetler || []).filter(e => 
    e.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = (transactions || []).filter(t => 
    t.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData({ ...item });
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleChange = (e, field) => {
    setEditFormData({ ...editFormData, [field]: e.target.value });
  };

  const handleSaveClick = () => {
    if (adminTab === 'inventory') {
      const numericData = {
        ...editFormData,
        quantity: parseInt(editFormData.quantity, 10) || 0,
        minStock: parseInt(editFormData.minStock, 10) || 0
      };
      onUpdate(numericData);
    } else if (adminTab === 'maintenance') {
      onUpdateMaintenance(editFormData);
    } else if (adminTab === 'emanet') {
      onUpdateEmanet(editFormData);
    } else if (adminTab === 'history') {
      onUpdateTransaction(editFormData);
    }
    setEditingId(null);
  };


  // Replaced by props onBackup and onPull

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3>Sistem Yönetimi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tüm kayıtları düzenleyin ve bulutla eşitleyin.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          {[
            { id: 'inventory', label: 'Stok', icon: <Package size={14} /> },
            { id: 'maintenance', label: 'Bakım', icon: <Wrench size={14} /> },
            { id: 'emanet', label: 'Emanet', icon: <ArrowRightLeft size={14} /> },
            { id: 'history', label: 'İşlem', icon: <History size={14} /> },
            { id: 'backup', label: 'Bulut', icon: <Database size={14} /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)} className="btn" style={{ background: adminTab === tab.id ? 'var(--accent-blue)' : 'transparent', color: adminTab === tab.id ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', padding: '6px 10px' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input type="text" className="input-field" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '35px', width: '100%', borderRadius: '20px' }} />
          </div>
          
          {adminTab === 'inventory' && (
            <select 
              className="input-field" 
              style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', width: '130px' }}
              onChange={(e) => setSearchTerm(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {[...new Set(inventory.map(item => item.category || 'Diğer'))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {adminTab === 'maintenance' && (
            <button 
              onClick={onGenerateAuto}
              className="btn btn-primary"
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              <Zap size={16} />
              2 Yıllık Bakım Yap
            </button>
          )}
        </div>
      </div>

      {adminTab === 'backup' ? (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card-solid)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <CloudUpload size={32} color="#10b981" />
            <h3 style={{ margin: 0 }}>Bulut Senkronizasyonu</h3>
          </div>
          <input type="text" className="input-field" placeholder="Google Script URL..." value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} style={{ width: '100%', marginBottom: '20px', fontFamily: 'monospace' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button onClick={onBackup} disabled={isSyncing} className="btn" style={{ background: '#10b981', color: '#fff', justifyContent: 'center' }}>Yedekle</button>
            <button onClick={onPull} disabled={isSyncing} className="btn" style={{ background: 'var(--accent-blue)', color: '#fff', justifyContent: 'center' }}>Veri Çek</button>
          </div>
          {syncStatus && <div style={{ marginTop: '20px', textAlign: 'center', color: syncStatus.includes('✅') ? '#10b981' : '#ef4444' }}>{syncStatus}</div>}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              {adminTab === 'inventory' && <tr><th>Kod</th><th>Malzeme Adı</th><th>Kategori</th><th>Model</th><th>Depo/Raf</th><th>Birim</th><th>Min. Stok</th><th>Mevcut Adet</th><th>İşlemler</th></tr>}
              {adminTab === 'maintenance' && <tr><th>Ürün</th><th>Tarih</th><th>Detay</th><th>Yapan</th><th>İşlem</th></tr>}
              {adminTab === 'emanet' && <tr><th>Kişi</th><th>Ürün</th><th>Adet</th><th>Durum</th><th>İşlem</th></tr>}
              {adminTab === 'history' && <tr><th>Tarih</th><th>Ürün</th><th>Tip</th><th>Miktar</th><th>İşlem</th></tr>}
            </thead>
            <tbody>
              {adminTab === 'inventory' && filteredInventory.map(item => (
                <tr key={item.id}>
                  <td>{editingId === item.id ? <input value={editFormData.code} onChange={e => handleChange(e, 'code')} style={{width:'60px'}} /> : item.code}</td>
                  <td>{editingId === item.id ? <input value={editFormData.name} onChange={e => handleChange(e, 'name')} /> : item.name}</td>
                  <td>
                    {editingId === item.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input 
                          value={editFormData.category || ''} 
                          onChange={e => handleChange(e, 'category')} 
                          placeholder="Sarf mı? Sarf(Gıda) mı?"
                          style={{ 
                            width: '100px', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            background: 'rgba(0,0,0,0.2)', 
                            border: '1px solid var(--accent-blue)',
                            color: '#fff',
                            fontSize: '0.8rem'
                          }} 
                        />
                      </div>
                    ) : (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 8px', 
                        borderRadius: '6px',
                        background: item.category?.toLowerCase().includes('sarf') ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: item.category?.toLowerCase().includes('sarf') ? 'var(--accent-blue)' : 'var(--text-muted)',
                        border: '1px solid currentColor',
                        display: 'inline-block',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>
                        {item.category || 'Diğer'}
                      </span>
                    )}
                  </td>
                  <td>{editingId === item.id ? <input value={editFormData.model} onChange={e => handleChange(e, 'model')} style={{width:'80px'}} /> : item.model || '-'}</td>
                  <td>{editingId === item.id ? <div style={{display:'flex',gap:2}}><input value={editFormData.warehouse || ''} onChange={e => handleChange(e, 'warehouse')} style={{width:'60px'}} /><input value={editFormData.shelf || ''} onChange={e => handleChange(e, 'shelf')} style={{width:'40px'}} /></div> : `${item.warehouse || '-'} / ${item.shelf || '-'}`}</td>
                  <td>{editingId === item.id ? <input value={editFormData.unit} onChange={e => handleChange(e, 'unit')} style={{width:'50px'}} /> : item.unit}</td>
                  <td>{editingId === item.id ? <input type="number" value={editFormData.minStock} onChange={e => handleChange(e, 'minStock')} style={{width:'50px'}} /> : item.minStock}</td>
                  <td>{editingId === item.id ? <input type="number" value={editFormData.quantity} onChange={e => handleChange(e, 'quantity')} style={{width:'50px'}} /> : item.quantity}</td>
                  <td>
                    {editingId === item.id ? <Save onClick={handleSaveClick} size={18} style={{cursor:'pointer',color:'#10b981'}} /> : <div style={{display:'flex',gap:8}}><Edit2 onClick={() => handleEditClick(item)} size={16} style={{cursor:'pointer'}} /><Trash2 onClick={() => onDelete(item.id)} size={16} style={{cursor:'pointer',color:'#ef4444'}} /></div>}
                  </td>
                </tr>
              ))}
              {adminTab === 'maintenance' && filteredMaintenances.map(m => (
                <tr key={m.id}>
                  <td>{m.itemName}</td>
                  <td>{editingId === m.id ? <input type="date" value={m.date} onChange={e => handleChange(e, 'date')} /> : m.date}</td>
                  <td>{editingId === m.id ? <textarea value={editFormData.details} onChange={e => handleChange(e, 'details')} /> : m.details}</td>
                  <td>{editingId === m.id ? <input value={editFormData.person} onChange={e => handleChange(e, 'person')} /> : m.person}</td>
                  <td>
                    {editingId === m.id ? <Save onClick={handleSaveClick} size={18} /> : <div style={{display:'flex',gap:8}}><Edit2 onClick={() => handleEditClick(m)} size={16} /><Trash2 onClick={() => onDeleteMaintenance(m.id)} size={16} /></div>}
                  </td>
                </tr>
              ))}
              {adminTab === 'emanet' && filteredEmanetler.map(e => (
                <tr key={e.id}>
                  <td>{editingId === e.id ? <input value={editFormData.personName} onChange={e => handleChange(e, 'personName')} /> : e.personName}</td>
                  <td>{e.itemName}</td>
                  <td>{editingId === e.id ? <input type="number" value={editFormData.amount} onChange={e => handleChange(e, 'amount')} style={{width:'50px'}} /> : e.amount}</td>
                  <td>{e.status}</td>
                  <td>
                    {editingId === e.id ? <Save onClick={handleSaveClick} size={18} /> : <div style={{display:'flex',gap:8}}><Edit2 onClick={() => handleEditClick(e)} size={16} /><Trash2 onClick={() => onDelete(e.id)} size={16} /></div>}
                  </td>
                </tr>
              ))}
              {adminTab === 'history' && filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.itemName}</td>
                  <td>{t.type}</td>
                  <td>{editingId === t.id ? <input type="number" value={editFormData.amount} onChange={e => handleChange(e, 'amount')} style={{width:'50px'}} /> : t.amount}</td>
                  <td>
                    {editingId === t.id ? <Save onClick={handleSaveClick} size={18} /> : <div style={{display:'flex',gap:8}}><Edit2 onClick={() => handleEditClick(t)} size={16} /><Trash2 onClick={() => onDeleteTransaction(t.id)} size={16} /></div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
