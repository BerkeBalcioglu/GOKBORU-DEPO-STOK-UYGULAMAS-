import React, { useState, useRef } from 'react';
import { Search, PlusCircle, ArrowDownToLine, ArrowUpFromLine, Trash2, User, Package, Hash, Clock, Printer, X, MinusCircle, AlertTriangle } from 'lucide-react';

export default function EmanetPanel({ inventory, emanetler, onAdd, onReturn, onDelete, onDeduct }) {
  const [tab, setTab] = useState('form'); // 'form' | 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const wrapperRef = useRef(null);

  // Form fields
  const [personName, setPersonName] = useState('');
  const [personRegion, setPersonRegion] = useState('');
  const [barcodeNo, setBarcodeNo] = useState('');
  const [amount, setAmount] = useState(1);
  const [note, setNote] = useState('');
  
  // Multiple items for one person
  const [itemsList, setItemsList] = useState([]);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchTerm(v);
    setSelectedItem(null);
    if (!v.trim()) { setSuggestions([]); setShowSug(false); return; }
    const filtered = inventory.filter(it =>
      it.name.toLowerCase().includes(v.toLowerCase()) ||
      (it.code && it.code.toLowerCase().includes(v.toLowerCase()))
    );
    setSuggestions(filtered);
    setShowSug(true);
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setSearchTerm(item.name);
    setBarcodeNo(item.code || '');
    setShowSug(false);
  };

  const handleAddItemToList = () => {
    if (!searchTerm.trim() && !selectedItem) { alert('Lütfen malzeme adı girin veya listeden seçin.'); return; }
    if (!amount || amount < 1) { alert('Adet en az 1 olmalı.'); return; }
    
    // Malzeme seçili değilse bile manuel olarak isim/kod girilmesine izin veriyoruz
    const nameToUse = selectedItem ? selectedItem.name : searchTerm;
    const codeToUse = barcodeNo || (selectedItem ? selectedItem.code : '-');
    const idToUse = selectedItem ? selectedItem.id : Date.now() + Math.random();

    const newItem = {
      tempId: Date.now() + Math.random(),
      itemId: idToUse,
      itemName: nameToUse,
      itemCode: codeToUse,
      amount: parseInt(amount),
      note: note.trim()
    };

    setItemsList([...itemsList, newItem]);

    // Reset item form
    setSearchTerm(''); setSelectedItem(null); setBarcodeNo(''); setAmount(1); setNote('');
  };

  const handleRemoveFromList = (tempId) => {
    setItemsList(itemsList.filter(it => it.tempId !== tempId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personName.trim()) { alert('Lütfen emanet alan kişinin adını girin.'); return; }
    if (itemsList.length === 0) { alert('Lütfen kişiye verilecek en az bir malzeme ekleyin.'); return; }

    const now = new Date();
    
    const newEmanetler = itemsList.map(item => ({
      id: Date.now() + Math.random(),
      itemId: item.itemId,
      itemName: item.itemName,
      itemCode: item.itemCode,
      amount: item.amount,
      personName: personName.trim(),
      region: personRegion.trim(),
      note: item.note,
      date: now.toISOString(),
      dateStr: now.toLocaleDateString('tr-TR'),
      timeStr: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'aktif' // 'aktif' | 'iade' | 'dusuldu'
    }));

    onAdd(newEmanetler);

    // Reset all
    setPersonName(''); setPersonRegion(''); setItemsList([]);
    setTab('list');
  };

  const aktif = emanetler.filter(e => e.status === 'aktif');
  const iade = emanetler.filter(e => e.status === 'iade');
  const dusuldu = emanetler.filter(e => e.status === 'dusuldu');

  const [listSearch, setListSearch] = useState('');

  // Group by personName
  const groupedEmanetler = emanetler.reduce((acc, em) => {
    if (!acc[em.personName]) acc[em.personName] = [];
    acc[em.personName].push(em);
    return acc;
  }, {});

  const filteredPeople = Object.keys(groupedEmanetler).filter(name => 
    name.toLowerCase().includes(listSearch.toLowerCase()) || 
    groupedEmanetler[name].some(em => em.itemName.toLowerCase().includes(listSearch.toLowerCase()) || (em.itemCode && em.itemCode.toLowerCase().includes(listSearch.toLowerCase())))
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0 }}>Malzeme Emanet Takibi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            GÖKBÖRÜ Lojistik – Malzeme Emanet Formu
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }} className="no-print">
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <button onClick={() => setTab('form')} className="btn" style={{ borderRadius: 0, background: tab === 'form' ? 'var(--accent-blue)' : 'transparent', color: tab === 'form' ? '#fff' : 'var(--text-muted)', padding: '8px 16px' }}>
              <PlusCircle size={16} /> Yeni Emanet
            </button>
            <button onClick={() => setTab('list')} className="btn" style={{ borderRadius: 0, background: tab === 'list' ? 'var(--accent-blue)' : 'transparent', color: tab === 'list' ? '#fff' : 'var(--text-muted)', padding: '8px 16px' }}>
              <Package size={16} /> Emanet Listesi ({aktif.length} Aktif)
            </button>
          </div>
          <button onClick={() => { setTab('list'); setTimeout(() => window.print(), 100); }} className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <Printer size={16} /> Yazdır
          </button>
        </div>
      </div>

      {tab === 'form' ? (
        /* ── YENİ EMANET FORMU ── */
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'var(--bg-card-solid)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Kişi bilgileri */}
            <div style={{ padding: '16px', background: 'rgba(59,130,246,0.07)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h4 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
                <User size={18} /> Emanet Alan Kişi (Kime Veriliyor?)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Ad Soyad *</label>
                  <input type="text" className="input-field" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Örn: Ahmet Yılmaz" required />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Bölge / Birim</label>
                  <input type="text" className="input-field" value={personRegion} onChange={e => setPersonRegion(e.target.value)} placeholder="Örn: Kurtarma Timi 1" />
                </div>
              </div>
            </div>

            {/* Malzeme seçimi */}
            <div style={{ padding: '16px', background: 'rgba(16,185,129,0.06)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <h4 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
                <Package size={18} /> Malzeme Ekle
              </h4>

              {/* Akıllı arama */}
              <div className="input-group" style={{ margin: '0 0 16px', position: 'relative' }} ref={wrapperRef}>
                <label>Malzeme Adı (Listeden seçin veya manuel girin) *</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-field"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Malzeme adı veya kodu ile ara..."
                    style={{ paddingLeft: '38px', borderColor: selectedItem ? 'var(--status-green)' : '' }}
                  />
                </div>
                {showSug && suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 20, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
                    {suggestions.map(it => (
                      <div key={it.id} onClick={() => handleSelect(it)}
                        style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span><span style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', marginRight: '8px' }}>{it.code}</span>{it.name}</span>
                        <span style={{ fontSize: '0.8rem', color: it.quantity < (it.minStock || 5) ? 'var(--status-red)' : 'var(--status-green)' }}>Stok: {it.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Barkod / Kod (İsteğe bağlı)</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={14} style={{ position: 'absolute', left: '10px', top: '13px', color: 'var(--text-muted)' }} />
                    <input type="text" className="input-field" value={barcodeNo} onChange={e => setBarcodeNo(e.target.value)} style={{ paddingLeft: '30px' }} placeholder="Kod girilebilir" />
                  </div>
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Adet *</label>
                  <input type="number" className="input-field" min="1" value={amount} onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))} />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>Not / Açıklama</label>
                  <input type="text" className="input-field" value={note} onChange={e => setNote(e.target.value)} placeholder="İsteğe bağlı" />
                </div>
              </div>
              
              <button type="button" onClick={handleAddItemToList} className="btn" style={{ marginTop: '16px', background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', width: '100%' }}>
                <PlusCircle size={18} /> Bu Malzemeyi Kişiye Ekle
              </button>
            </div>

            {/* Eklenen Malzemeler Listesi */}
            {itemsList.length > 0 && (
              <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color)' }}>
                <h5 style={{ margin: '0 0 12px', color: 'var(--text-muted)' }}>Eklenecek Malzemeler ({itemsList.length})</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {itemsList.map((it, idx) => (
                    <div key={it.tempId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '20px' }}>{idx + 1}.</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{it.itemName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kod: {it.itemCode} | Miktar: <strong style={{ color: 'var(--text-main)' }}>{it.amount}</strong></div>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveFromList(it.tempId)} style={{ background: 'transparent', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '4px' }}>
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarih/saat (otomatik) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.15)', padding: '10px 16px', borderRadius: '8px' }}>
              <Clock size={16} />
              <span>Tarih ve saat otomatik kaydedilir: <strong style={{ color: 'var(--text-main)' }}>{new Date().toLocaleDateString('tr-TR')} – {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</strong></span>
            </div>

            <button onClick={handleSubmit} type="button" className="btn btn-primary" style={{ padding: '14px', justifyContent: 'center', fontSize: '1rem' }} disabled={itemsList.length === 0}>
              <ArrowDownToLine size={20} /> Kişiye Ait Tüm Emanetleri Kaydet
            </button>
          </div>
        </div>
      ) : (
        /* ── EMANET LİSTESİ ── */
        <div className="print-area">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Toplam Emanet', value: emanetler.length, color: 'var(--accent-blue)' },
              { label: 'Aktif (İade Bekleyen)', value: aktif.length, color: '#f59e0b' },
              { label: 'İade Edildi', value: iade.length, color: 'var(--status-green)' },
              { label: 'Stoktan Düşüldü', value: dusuldu.length, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card-solid)', borderRadius: '12px', padding: '16px 20px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="no-print" style={{ position: 'relative', marginBottom: '20px', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input type="text" className="input-field" value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Kişi veya malzeme ile ara..." style={{ paddingLeft: '38px', borderRadius: '20px' }} />
          </div>

          {/* Grouped Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredPeople.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', background: 'var(--bg-card-solid)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>Kayıt bulunamadı.</div>
            ) : (
              filteredPeople.sort().map(person => (
                <div key={person} style={{ background: 'var(--bg-card-solid)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  {/* Person Header */}
                  <div style={{ background: 'rgba(59,130,246,0.1)', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                        {person.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: '#f1f5f9' }}>{person}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>{groupedEmanetler[person][0]?.region || 'Bölge Belirtilmemiş'}</span>
                      </div>
                    </div>
                    <span className="no-print" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam: {groupedEmanetler[person].length} Malzeme</span>
                  </div>

                  {/* Person Items List */}
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 100px 100px 1fr 140px', padding: '10px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <div>Malzeme</div>
                      <div>Adet</div>
                      <div>Tarih</div>
                      <div>Saat</div>
                      <div>Not</div>
                      <div className="no-print" style={{ textAlign: 'right' }}>İşlemler</div>
                    </div>
                    
                    {groupedEmanetler[person].sort((a,b) => new Date(b.date) - new Date(a.date)).map(em => (
                      <div key={em.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 100px 100px 1fr 140px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', opacity: em.status === 'aktif' ? 1 : 0.6 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', display: 'block', fontWeight: 700 }}>{em.itemCode}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{em.itemName}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>{em.amount}</div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{em.dateStr}</div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{em.timeStr}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{em.note || '-'}</div>
                        
                        <div className="no-print" style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {em.status === 'aktif' ? (
                            <>
                              <button onClick={() => onReturn(em.id)} title="İade Edildi İşaretle" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '6px', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}>
                                <ArrowUpFromLine size={14} />
                              </button>
                              <button onClick={() => onDeduct(em)} title="Geri Dönmeyecek, Stoktan Düş" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: '6px', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center' }}>
                                <AlertTriangle size={14} />
                              </button>
                            </>
                          ) : em.status === 'iade' ? (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>İade Edildi</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>Stoktan Düşüldü</span>
                          )}
                          <button onClick={() => onDelete(em.id)} title="Kaydı Sil" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
