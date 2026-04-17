import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Info, X, Calendar, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const ZOOM_LEVELS = [0.3, 0.5, 0.7, 1, 1.5, 2, 3];
const ZOOM_LABELS = ['30%', '50%', '70%', '100%', '150%', '200%', '300%'];
const ROW_H = 56;
const HEADER_H = 52;
const LABEL_W = 230;

const COLORS = {
  active: { bg: '#10b981', glow: 'rgba(16,185,129,0.35)', label: 'Geçerli Bakım' },
  past: { bg: '#3b82f6', glow: 'rgba(59,130,246,0.3)', label: 'Geçmiş Bakım' },
  overdue: { bg: '#ef4444', glow: 'rgba(239,68,68,0.35)', label: 'Gecikmiş / Süresi Dolmuş' },
  point: { bg: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', label: 'Tek Seferlik' },
};

function getBarColor(log) {
  if (!log.nextDate) return COLORS.point;
  const end = new Date(log.nextDate);
  if (end >= new Date()) return COLORS.active;
  return COLORS.overdue;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtShort(d) {
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

// ── Tooltip ──
function Tooltip({ log, x, y, onClose }) {
  const color = getBarColor(log);
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', left: Math.min(x, window.innerWidth - 360), top: Math.min(y, window.innerHeight - 280),
        width: 330, background: '#1e293b', border: `1px solid ${color.bg}55`, borderRadius: 14,
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${color.glow}`, zIndex: 9999,
        animation: 'tooltipIn 0.18s ease-out', overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px 16px', background: `${color.bg}18`, borderBottom: `1px solid ${color.bg}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color.bg, boxShadow: `0 0 8px ${color.glow}` }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: color.bg }}>{color.label}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}><X size={14} /></button>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.92rem', fontWeight: 600, color: '#f1f5f9' }}>
          <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700 }}>{log.itemCode}</span> — {log.itemName}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}><Calendar size={13} /> {fmtDate(log.date)}</span>
          {log.nextDate && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}><Clock size={13} /> {fmtDate(log.nextDate)}</span>}
        </div>
        {log.person && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#94a3b8' }}><User size={13} /> {log.person}</div>
        )}
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }}>
          {log.details}
        </div>
      </div>
    </div>
  );
}

// ── Stats Bar ──
function StatsBar({ logs }) {
  const total = logs.length;
  const active = logs.filter(l => l.nextDate && new Date(l.nextDate) >= new Date()).length;
  const overdue = logs.filter(l => l.nextDate && new Date(l.nextDate) < new Date()).length;
  const items = new Set(logs.map(l => l.itemName)).size;
  const stats = [
    { label: 'Toplam Kayıt', value: total, color: '#94a3b8', icon: <Info size={14} /> },
    { label: 'Ekipman', value: items, color: '#60a5fa', icon: <Calendar size={14} /> },
    { label: 'Geçerli', value: active, color: '#10b981', icon: <CheckCircle size={14} /> },
    { label: 'Gecikmiş', value: overdue, color: '#ef4444', icon: <AlertTriangle size={14} /> },
  ];
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      {stats.map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '8px 14px', border: `1px solid ${s.color}22` }}>
          <span style={{ color: s.color }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main GanttChart ──
export default function GanttChart({ logs }) {
  const [zoomIdx, setZoomIdx] = useState(3);
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);
  const zoom = ZOOM_LEVELS[zoomIdx];

  // Close tooltip on outside click
  useEffect(() => {
    const handler = () => setTooltip(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // Scroll to today on mount
  useEffect(() => {
    if (!scrollRef.current || !logs || logs.length === 0) return;
    const timer = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const todayLine = el.querySelector('[data-today-line]');
      if (todayLine) {
        const containerW = el.clientWidth;
        const lineLeft = todayLine.offsetLeft;
        el.scrollLeft = Math.max(0, lineLeft - containerW / 2);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [logs, zoomIdx]);

  const { grouped, months, minT, totalMs, pxPerMs, chartW } = useMemo(() => {
    if (!logs || logs.length === 0) return { grouped: {}, months: [], minT: 0, totalMs: 0, pxPerMs: 0, chartW: 0 };

    const g = {};
    logs.forEach(log => {
      if (!g[log.itemName]) g[log.itemName] = { code: log.itemCode, logs: [] };
      g[log.itemName].logs.push(log);
    });
    // Sort each group's logs by date
    Object.values(g).forEach(v => v.logs.sort((a, b) => new Date(a.date) - new Date(b.date)));

    let mn = Infinity, mx = -Infinity;
    logs.forEach(log => {
      const d = new Date(log.date).getTime();
      if (d < mn) mn = d;
      if (d > mx) mx = d;
      if (log.nextDate) { const n = new Date(log.nextDate).getTime(); if (n > mx) mx = n; }
    });
    const PAD = 45 * 24 * 3600 * 1000;
    mn -= PAD; mx += PAD;
    const tot = mx - mn;
    const ppm = (2000 * zoom) / tot;
    const cw = tot * ppm;

    const ms = [];
    const mc = new Date(mn); mc.setDate(1); mc.setHours(0, 0, 0, 0);
    while (mc.getTime() <= mx) { ms.push(new Date(mc)); mc.setMonth(mc.getMonth() + 1); }

    return { grouped: g, months: ms, minT: mn, totalMs: tot, pxPerMs: ppm, chartW: cw };
  }, [logs, zoom]);

  const handleBarClick = useCallback((e, log) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ log, x: rect.right + 8, y: rect.top - 10 });
  }, []);

  const scrollBy = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (!logs || logs.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#475569' }}>
        <Calendar size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>Gösterilecek bakım verisi yok</div>
        <div style={{ fontSize: '0.85rem', color: '#334155' }}>Bakım kaydı ekledikten sonra Gantt şeması burada görünecektir.</div>
      </div>
    );
  }

  const itemNames = Object.keys(grouped);
  const nowX = (Date.now() - minT) * pxPerMs;
  const showToday = Date.now() >= minT && Date.now() <= minT + totalMs;

  return (
    <div>
      <style>{`
        @keyframes tooltipIn { from { opacity:0; transform: translateY(6px) scale(0.97); } to { opacity:1; transform: none; } }
        @keyframes barPulse { 0%,100% { opacity:1; } 50% { opacity:0.85; } }
        .gantt-bar:hover { filter: brightness(1.25) !important; transform: scaleY(1.12); }
        .gantt-bar { transition: filter 0.15s, transform 0.15s; cursor: pointer; }
        .gantt-row:hover { background: rgba(255,255,255,0.02) !important; }
      `}</style>

      <StatsBar logs={logs} />

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '4px 8px' }}>
            <button onClick={() => setZoomIdx(i => Math.max(i - 1, 0))} disabled={zoomIdx === 0}
              style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: zoomIdx === 0 ? '#1e293b' : '#334155', color: zoomIdx === 0 ? '#475569' : '#e2e8f0', cursor: zoomIdx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ZoomOut size={15} />
            </button>
            <span style={{ color: '#e2e8f0', fontSize: '0.82rem', minWidth: 44, textAlign: 'center', fontWeight: 700 }}>{ZOOM_LABELS[zoomIdx]}</span>
            <button onClick={() => setZoomIdx(i => Math.min(i + 1, ZOOM_LEVELS.length - 1))} disabled={zoomIdx === ZOOM_LEVELS.length - 1}
              style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: zoomIdx === ZOOM_LEVELS.length - 1 ? '#1e293b' : '#3b82f6', color: zoomIdx === ZOOM_LEVELS.length - 1 ? '#475569' : '#fff', cursor: zoomIdx === ZOOM_LEVELS.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ZoomIn size={15} />
            </button>
          </div>
          {/* Scroll arrows */}
          <button onClick={() => scrollBy(-1)} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={16} /></button>
          <button onClick={() => scrollBy(1)} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} /></button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {Object.values(COLORS).map(c => (
            <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.74rem', color: '#94a3b8' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, boxShadow: `0 0 6px ${c.glow}`, flexShrink: 0 }} />{c.label}
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.74rem', color: '#f59e0b' }}>
            <span style={{ width: 3, height: 14, background: '#f59e0b', borderRadius: 2 }} />Bugün
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', background: '#0c1222' }}>

        {/* Sticky Labels */}
        <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', zIndex: 30, background: '#0f172a' }}>
          {/* Header cell */}
          <div style={{ height: HEADER_H, display: 'flex', alignItems: 'center', padding: '0 14px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Ekipman
          </div>
          {/* Labels */}
          {itemNames.map((name, ri) => (
            <div key={ri} className="gantt-row" style={{ height: ROW_H, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.04)', background: ri % 2 === 0 ? '#0f172a' : '#111827' }}>
              <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.03em' }}>{grouped[name].code}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            </div>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ minWidth: chartW, position: 'relative' }}>

            {/* Month Header */}
            <div style={{ height: HEADER_H, position: 'sticky', top: 0, zIndex: 20, display: 'flex', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {months.map((m, i) => {
                const left = (m.getTime() - minT) * pxPerMs;
                const nextL = i < months.length - 1 ? (months[i + 1].getTime() - minT) * pxPerMs : chartW;
                const w = nextL - left;
                const isJan = m.getMonth() === 0;
                return (
                  <div key={i} style={{ position: 'absolute', left, width: w, top: 0, bottom: 0, borderLeft: `1px solid ${isJan ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 8, overflow: 'hidden' }}>
                    {w > 30 && <span style={{ fontSize: '0.72rem', fontWeight: isJan ? 800 : 500, color: isJan ? '#e2e8f0' : '#64748b', whiteSpace: 'nowrap' }}>
                      {w > 70 ? m.toLocaleDateString('tr-TR', { month: zoom >= 1.5 ? 'long' : 'short', year: isJan || zoom >= 1 ? 'numeric' : undefined }) : m.toLocaleDateString('tr-TR', { month: 'narrow' })}
                    </span>}
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            {itemNames.map((name, ri) => (
              <div key={ri} className="gantt-row" style={{ height: ROW_H, position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.04)', background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)' }}>

                {/* Grid lines */}
                {months.map((m, i) => {
                  const isJan = m.getMonth() === 0;
                  return <div key={i} style={{ position: 'absolute', left: (m.getTime() - minT) * pxPerMs, top: 0, bottom: 0, width: 1, background: isJan ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.025)' }} />;
                })}

                {/* Today */}
                {showToday && ri === 0 && (
                  <div data-today-line style={{ position: 'absolute', left: nowX, top: 0, height: itemNames.length * ROW_H, width: 2, background: 'rgba(245,158,11,0.6)', zIndex: 15, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: -HEADER_H + 6, left: -22, width: 46, textAlign: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', borderRadius: 4, padding: '2px 4px', border: '1px solid rgba(245,158,11,0.3)' }}>BUGÜN</div>
                  </div>
                )}

                {/* Bars */}
                {grouped[name].logs.map((log, li) => {
                  const startX = (new Date(log.date).getTime() - minT) * pxPerMs;
                  const hasEnd = !!log.nextDate;
                  const endX = hasEnd
                    ? (new Date(log.nextDate).getTime() - minT) * pxPerMs
                    : startX + Math.max(18, pxPerMs * 10 * 24 * 3600 * 1000);
                  const w = Math.max(endX - startX, 16);
                  const c = getBarColor(log);
                  const barH = 28;
                  const barTop = (ROW_H - barH) / 2;

                  return (
                    <div key={li} className="gantt-bar"
                      onClick={e => handleBarClick(e, log)}
                      style={{
                        position: 'absolute', left: startX, top: barTop, width: w, height: barH,
                        background: `linear-gradient(135deg, ${c.bg}dd, ${c.bg}88)`,
                        border: `1.5px solid ${c.bg}aa`,
                        borderRadius: hasEnd ? 6 : '6px 14px 14px 6px',
                        display: 'flex', alignItems: 'center', padding: '0 8px', overflow: 'hidden',
                        boxShadow: `0 2px 12px ${c.glow}`, zIndex: 5,
                      }}
                    >
                      {/* Start dot */}
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', flexShrink: 0, marginRight: 6, boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
                      <span style={{ fontSize: zoom >= 1.5 ? '0.72rem' : '0.64rem', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
                        {w > 50 ? (
                          hasEnd ? `${fmtShort(log.date)} → ${fmtShort(log.nextDate)}` : fmtShort(log.date)
                        ) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && <Tooltip log={tooltip.log} x={tooltip.x} y={tooltip.y} onClose={() => setTooltip(null)} />}
    </div>
  );
}
