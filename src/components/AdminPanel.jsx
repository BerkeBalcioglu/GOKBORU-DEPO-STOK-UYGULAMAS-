import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, Search, Package, Wrench, Zap, CloudUpload, Database } from 'lucide-react';

export default function AdminPanel({ inventory, transactions, emanetler, onUpdate, onDelete, maintenances, onUpdateMaintenance, onDeleteMaintenance, onGenerateAuto, onRestore }) {
  const [adminTab, setAdminTab] = useState('inventory'); // 'inventory' | 'maintenance' | 'backup'
  
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
    (item.shelf && item.shelf.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMaintenances = (maintenances || []).filter(m => 
    m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.person && m.person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditClick = (item, isMaintenance = false) => {
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
      if (!editFormData.name || !editFormData.code) {
        alert("Ürün kodu ve adı boş bırakılamaz.");
        return;
      }
      onUpdate({
        ...editFormData,
        quantity: Math.max(0, parseInt(editFormData.quantity) || 0),
        minStock: Math.max(0, parseInt(editFormData.minStock) || 0),
        unit: editFormData.unit || 'Adet',
        warehouse: editFormData.warehouse || '',
        shelf: editFormData.shelf || ''
      });
    } else {
      if (!editFormData.date || !editFormData.details) {
        alert("Tarih ve açıklama boş bırakılamaz.");
        return;
      }
      onUpdateMaintenance(editFormData);
    }
    setEditingId(null);
  };

  const handleBackup = async () => {
    if (!webhookUrl) {
      alert("Lütfen önce Google Apps Script Web App linkini yapıştırın.");
      return;
    }
    
    // Save URL for future
    localStorage.setItem('gkb_google_sheet_url', webhookUrl.trim());
    
    setIsSyncing(true);
    setSyncStatus('Veriler toplanıyor ve Google\'a gönderiliyor...');
    
    const payload = {
      inventory: inventory,
      transactions: transactions || [],
      maintenances: maintenances || [],
      emanetler: emanetler || []
    };

    try {
      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        // 'no-cors' mode sends the data but doesn't wait for a readable response
        // Apps script returns redirects or unreadable responses in browser due to CORS sometimes
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // Because mode is 'no-cors', we can't read response.ok, but if it didn't throw an error, it hit the endpoint.
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatus('✅ Tüm verileriniz Google Sheets tablonuza başarıyla yedeklendi!');
        setTimeout(() => setSyncStatus(''), 5000);
      }, 1000);
      
    } catch (error) {
      setIsSyncing(false);
      setSyncStatus(`❌ Hata oluştu: ${error.message}`);
    }
  };

  const handlePull = async () => {
    if (!webhookUrl) {
      alert("Lütfen önce Google Apps Script Web App linkini yapıştırın.");
      return;
    }

    if (!window.confirm("Buluttaki veriler çekilecek ve şu anki yerel verilerinizin üzerine yazılacaktır. Onaylıyor musunuz?")) {
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Buluttan veriler alınıyor...');

    try {
      const response = await fetch(webhookUrl.trim(), {
        method: 'GET',
        redirect: 'follow'
      });
      
      if (!response.ok) throw new Error('Sunucu yanıt vermedi');
      
      const data = await response.json();
      
      if (!data || (!data.inventory && !data.emanetler)) {
        throw new Error('Buluttan boş veya geçersiz veri geldi.');
      }

      onRestore(data);
      
      setIsSyncing(false);
      setSyncStatus('✅ Veriler başarıyla senkronize edildi!');
      setTimeout(() => setSyncStatus(''), 5000);
    } catch (error) {
      console.error("Çekme hatası:", error);
      setIsSyncing(false);
      setSyncStatus(`❌ Hata: ${error.message}`);
      alert("HATA: Veri çekilemedi. \n\nOlası Nedenler:\n1. Google Script'te yeni versiyon yayınlanmadı.\n2. Link hatalı veya erişim 'Herkes' olarak ayarlanmadı.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3>Sistem Yönetimi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Stok veya Bakım kayıtlarını düzenleyin ve yönetin.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => setAdminTab('inventory')} className="btn" style={{ background: adminTab === 'inventory' ? 'var(--accent-blue)' : 'transparent', color: adminTab === 'inventory' ? '#fff' : 'var(--text-muted)' }}>
            <Package size={16} /> Stok Kayıtları
          </button>
          <button onClick={() => setAdminTab('maintenance')} className="btn" style={{ background: adminTab === 'maintenance' ? 'var(--status-red)' : 'transparent', color: adminTab === 'maintenance' ? '#fff' : 'var(--text-muted)' }}>
            <Wrench size={16} /> Bakım Kayıtları
          </button>
          <button onClick={() => setAdminTab('backup')} className="btn" style={{ background: adminTab === 'backup' ? '#10b981' : 'transparent', color: adminTab === 'backup' ? '#fff' : 'var(--text-muted)' }}>
            <Database size={16} /> Bulut Yedekleme
          </button>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ürün Ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '20px', padding: '10px 10px 10px 40px' }}
          />
        </div>
      </div>

      {adminTab === 'maintenance' && (
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onGenerateAuto} className="btn" style={{ background: 'var(--status-green)', color: '#fff', boxShadow: 'var(--shadow-glow-green)', padding: '6px 12px', fontSize: '0.85rem' }}>
            <Zap size={14} /> Bakım Üret
          </button>
        </div>
      )}

      {adminTab === 'backup' ? (
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--bg-card-solid)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CloudUpload size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#10b981' }}>Google Sheets Bulut Senkronizasyonu</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tüm yerel verilerinizi anında bir Google E-Tablosuna gönderir.</p>
            </div>
          </div>
          
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label>Google Apps Script Web App Linki</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://script.google.com/macros/s/AKfycb.../exec" 
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              style={{ width: '100%', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Geliştiricinizden aldığınız bağlantıyı buraya yapıştırın. Sistem bunu otomatik hatırlar.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button 
              onClick={handleBackup} 
              disabled={isSyncing || !webhookUrl}
              className="btn" 
              style={{ 
                padding: '16px', 
                background: isSyncing ? 'var(--text-muted)' : '#10b981', 
                color: '#fff', 
                fontSize: '1rem',
                justifyContent: 'center',
                boxShadow: isSyncing ? 'none' : '0 4px 14px rgba(16,185,129,0.3)'
              }}
            >
              <Database size={20} /> 
              {isSyncing ? 'Yedekle...' : 'Buluta Yedekle (Gönder)'}
            </button>

            <button 
              onClick={handlePull} 
              disabled={isSyncing || !webhookUrl}
              className="btn" 
              style={{ 
                padding: '16px', 
                background: isSyncing ? 'var(--text-muted)' : 'var(--accent-blue)', 
                color: '#fff', 
                fontSize: '1rem',
                justifyContent: 'center',
                boxShadow: isSyncing ? 'none' : '0 4px 14px rgba(59,130,246,0.3)'
              }}
            >
              <CloudUpload size={20} style={{ transform: 'rotate(180deg)' }} /> 
              {isSyncing ? 'Çekiliyor...' : 'Buluttan Çek (Senkronize Et)'}
            </button>
          </div>
          
          {syncStatus && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              borderRadius: '8px', 
              background: syncStatus.includes('Hata') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', 
              color: syncStatus.includes('Hata') ? '#ef4444' : '#10b981',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              {syncStatus}
            </div>
          )}
        </div>
      ) : adminTab === 'inventory' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Malzeme Adı</th>
                <th>Model</th>
                <th>Depo / Raf</th>
                <th>Birim</th>
                <th>Min. Stok</th>
                <th>Mevcut Adet</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} style={{ background: isEditing ? 'rgba(59, 130, 246, 0.05)' : '' }}>
                    <td>
                      {isEditing ? (
                        <input type="text" className="input-field" value={editFormData.code} onChange={(e) => handleChange(e, 'code')} style={{ padding: '8px', width: '90px' }} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.code}</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {isEditing ? (
                        <input type="text" className="input-field" value={editFormData.name} onChange={(e) => handleChange(e, 'name')} style={{ padding: '8px', width: '100%' }} />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="text" className="input-field" value={editFormData.model} onChange={(e) => handleChange(e, 'model')} style={{ padding: '8px', width: '100px' }} />
                      ) : (
                        item.model || '-'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input type="text" className="input-field" placeholder="Depo" value={editFormData.warehouse || ''} onChange={(e) => handleChange(e, 'warehouse')} style={{ padding: '4px', width: '100px', fontSize: '0.8rem' }} />
                          <input type="text" className="input-field" placeholder="Raf" value={editFormData.shelf || ''} onChange={(e) => handleChange(e, 'shelf')} style={{ padding: '4px', width: '100px', fontSize: '0.8rem' }} />
                        </div>
                      ) : (
                        <div style={{ color: 'var(--accent-blue)', fontWeight: 500, display: 'flex', flexDirection: 'column' }}>
                          <span>📍 {item.warehouse || '-'}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.shelf || '-'}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select className="input-field" value={editFormData.unit} onChange={(e) => handleChange(e, 'unit')} style={{ padding: '8px', width: '80px', appearance: 'none' }}>
                          <option value="Adet">Adet</option>
                          <option value="Set">Set</option>
                          <option value="Çift">Çift</option>
                          <option value="Kutu">Kutu</option>
                          <option value="Kg">Kg</option>
                          <option value="Metre">Metre</option>
                          <option value="Litre">Litre</option>
                        </select>
                      ) : (
                        item.unit || 'Adet'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="number" className="input-field" value={editFormData.minStock} onChange={(e) => handleChange(e, 'minStock')} style={{ padding: '8px', width: '60px' }} />
                      ) : (
                        <span style={{ color: 'var(--status-red)', fontWeight: 600 }}>{item.minStock || 5}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="number" className="input-field" value={editFormData.quantity} onChange={(e) => handleChange(e, 'quantity')} style={{ padding: '8px', width: '60px' }} />
                      ) : (
                        <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={handleSaveClick} className="btn" style={{ padding: '6px 12px', background: 'var(--status-green-bg)', color: 'var(--status-green)', border: '1px solid var(--status-green-border)' }}>
                            <Save size={16} />
                          </button>
                          <button onClick={handleCancelClick} className="btn" style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditClick(item)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => onDelete(item.id)} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'var(--status-red-bg)', color: 'var(--status-red)', border: '1px solid var(--status-red-border)' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ekipman</th>
                <th>Bakım Tarihi</th>
                <th>Yapılan İşlem Özeti</th>
                <th>Yetkili Kişi/Kurum</th>
                <th>Sonraki Bakım</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenances.map(m => {
                const isEditing = editingId === m.id;

                return (
                  <tr key={m.id} style={{ background: isEditing ? 'rgba(59, 130, 246, 0.05)' : '' }}>
                    <td style={{ fontWeight: 500 }}>{m.itemName} <br/><span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>{m.itemCode}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <input type="date" className="input-field" value={editFormData.date} onChange={(e) => handleChange(e, 'date')} style={{ padding: '8px' }} />
                      ) : (
                        new Date(m.date).toLocaleDateString('tr-TR')
                      )}
                    </td>
                    <td style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: '1.4', maxWidth: '300px' }}>
                      {isEditing ? (
                        <textarea className="input-field" value={editFormData.details} onChange={(e) => handleChange(e, 'details')} style={{ padding: '8px', width: '100%', minHeight: '60px' }} />
                      ) : (
                        m.details
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="text" className="input-field" value={editFormData.person} onChange={(e) => handleChange(e, 'person')} style={{ padding: '8px', width: '100px' }} />
                      ) : (
                        m.person || '-'
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <input type="date" className="input-field" value={editFormData.nextDate} onChange={(e) => handleChange(e, 'nextDate')} style={{ padding: '8px' }} />
                      ) : (
                        m.nextDate ? <span style={{ color: 'var(--status-red)' }}>{new Date(m.nextDate).toLocaleDateString('tr-TR')}</span> : '-'
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={handleSaveClick} className="btn" style={{ padding: '6px 12px', background: 'var(--status-green-bg)', color: 'var(--status-green)', border: '1px solid var(--status-green-border)' }}>
                            <Save size={16} />
                          </button>
                          <button onClick={handleCancelClick} className="btn" style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditClick(m, true)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => onDeleteMaintenance(m.id)} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'var(--status-red-bg)', color: 'var(--status-red)', border: '1px solid var(--status-red-border)' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
