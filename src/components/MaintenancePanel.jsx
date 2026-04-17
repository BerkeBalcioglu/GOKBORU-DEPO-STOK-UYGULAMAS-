import React, { useState } from 'react';
import { PenTool, Calendar, User, ArrowRight, PlusCircle, Trash2, Download, BarChart2, X } from 'lucide-react';
import SmartInput from './SmartInput';
import GanttChart from './GanttChart';
import { exportMaintenancesToExcel } from '../utils/excelUtils';

export default function MaintenancePanel({ inventory, maintenances, onAdd, onDelete, savedNotes, setSavedNotes }) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState(['']);
  const [person, setPerson] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [showGantt, setShowGantt] = useState(false);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!selectedItemId) { alert("Lütfen bakım yapılan ekipmanı seçin."); return; }
    const validTasks = tasks.filter(t => t.trim() !== '');
    if (!date || validTasks.length === 0) { alert("Lütfen bakım tarihi ve en az bir adet yapılan iş açıklaması doldurun."); return; }
    const item = inventory.find(i => i.id === parseInt(selectedItemId));
    validTasks.forEach(task => {
      if (!savedNotes.includes(task.trim())) setSavedNotes(prev => [task.trim(), ...prev]);
    });
    const finalDetails = validTasks.map((t, idx) => `${idx + 1}. ${t.trim()}`).join('\n');
    onAdd({ itemId: parseInt(selectedItemId), itemName: item ? item.name : 'Bilinmeyen', itemCode: item ? item.code : '-', date, details: finalDetails, person, nextDate });
    setTasks(['']); setPerson(''); setNextDate('');
  };

  const handleTaskChange = (idx, value) => { const t = [...tasks]; t[idx] = value; setTasks(t); };
  const addTaskRow = () => setTasks([...tasks, '']);
  const removeTaskRow = (idx) => { const t = tasks.filter((_, i) => i !== idx); setTasks(t.length > 0 ? t : ['']); };

  const filteredLogs = selectedItemId
    ? maintenances.filter(m => m.itemId === parseInt(selectedItemId))
    : maintenances;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3>Ekipman Bakım Takibi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Motorlu araçlar, jeneratörler ve kritik ekipmanlar için periyodik bakım geçmişi.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowGantt(true)} className="btn" style={{ background: 'var(--status-green)', color: '#fff' }}>
            <BarChart2 size={18} /> Gantt Şeması
          </button>
          <button onClick={() => exportMaintenancesToExcel(maintenances)} className="btn" style={{ background: 'var(--accent-blue)', color: '#fff' }}>
            <Download size={18} /> Excel İndir
          </button>
        </div>
      </div>

      {/* Gantt Modal */}
      {showGantt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0f172a', width: '100%', height: '100%', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={22} color="#10b981" />
                {selectedItemId ? 'Seçili Ekipman – Gantt Şeması' : 'Tüm Ekipmanlar – Bakım Gantt Şeması'}
              </h3>
              <button onClick={() => setShowGantt(false)} className="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                <X size={16} /> Kapat
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              <GanttChart logs={filteredLogs} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px', alignItems: 'start' }}>
        {/* Sol: Form */}
        <div style={{ background: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><PenTool size={18} /> Yeni Bakım Ekle</h4>
          <form onSubmit={handleAddSubmit}>
            <div className="input-group">
              <label>Bakım Yapılan Ekipman</label>
              <select className="input-field" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} style={{ appearance: 'none' }}>
                <option value="">-- Ekipman Seçin --</option>
                {inventory.map(item => (<option key={item.id} value={item.id}>{item.name} ({item.code})</option>))}
              </select>
            </div>
            <div className="input-group">
              <label>Bakım Tarihi</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0 12px' }}>
                <Calendar size={16} color="var(--text-muted)" />
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} style={{ border: 'none', background: 'transparent' }} />
              </div>
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Yapılan İşlemler</span>
                <button type="button" onClick={addTaskRow} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <PlusCircle size={14} /> Yeni Satır
                </button>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map((task, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px 8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: '20px' }}>{idx + 1}.</span>
                    <SmartInput value={task} onChange={(val) => handleTaskChange(idx, val)} savedNotes={savedNotes} setSavedNotes={setSavedNotes} placeholder="Örn: Yağ değişimi yapıldı" />
                    <button type="button" onClick={() => removeTaskRow(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>Bakımı Yapan Kişi / Kurum</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0 12px' }}>
                <User size={16} color="var(--text-muted)" />
                <input type="text" className="input-field" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Örn: Depo Sorumlusu" style={{ border: 'none', background: 'transparent' }} />
              </div>
            </div>
            <div className="input-group">
              <label>Sonraki Bakım Tarihi (Opsiyonel)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0 12px' }}>
                <ArrowRight size={16} color="var(--status-red)" />
                <input type="date" className="input-field" value={nextDate} onChange={(e) => setNextDate(e.target.value)} style={{ border: 'none', background: 'transparent' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
              Bakım Kaydını Oluştur
            </button>
          </form>
        </div>

        {/* Sağ: Geçmiş */}
        <div style={{ background: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: 0 }}>{selectedItemId ? 'Seçili Ekipmanın Geçmişi' : 'Tüm Bakım Geçmişi'}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>{filteredLogs.length} Kayıt</span>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>Henüz bir bakım kaydı bulunmuyor.</div>
            ) : (
              <div>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: selectedItemId ? '130px 1fr 180px' : '130px 160px 1fr 180px',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  position: 'sticky', top: 0, background: 'var(--bg-card-solid)', zIndex: 2
                }}>
                  <div>Tarih</div>
                  {!selectedItemId && <div>Ekipman</div>}
                  <div>Yapılan İşlem Özeti</div>
                  <div>Yetkili Kişi/Kurum</div>
                </div>

                {/* Rows */}
                {filteredLogs.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(log => (
                  <div key={log.id} style={{
                    display: 'grid',
                    gridTemplateColumns: selectedItemId ? '130px 1fr 180px' : '130px 160px 1fr 180px',
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'start'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, paddingTop: '2px' }}>
                      {new Date(log.date).toLocaleDateString('tr-TR')}
                    </div>
                    {!selectedItemId && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', display: 'block', fontWeight: 700 }}>{log.itemCode}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{log.itemName}</span>
                      </div>
                    )}
                    <div style={{ fontSize: '0.84rem', lineHeight: '1.5', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {log.details}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', paddingTop: '2px' }}>
                      {log.person || '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

