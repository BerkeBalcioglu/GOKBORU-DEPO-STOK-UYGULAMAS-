import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';

export default function SmartInput({ value, onChange, savedNotes, setSavedNotes, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleDelete = (e, noteToDelete) => {
    e.stopPropagation();
    setSavedNotes(prev => prev.filter(note => note !== noteToDelete));
  };

  const handleSelect = (note) => {
    onChange(note);
    setIsOpen(false);
  };

  const filteredNotes = savedNotes.filter(note => 
    note.toLowerCase().includes(value.toLowerCase()) && note !== value
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="input-field"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        style={{ width: '100%' }}
      />
      
      {isOpen && filteredNotes.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          marginTop: '4px',
          zIndex: 50,
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {filteredNotes.map((note, idx) => (
            <div 
              key={idx}
              style={{
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: idx === filteredNotes.length - 1 ? 'none' : '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={() => handleSelect(note)}
            >
              <span>{note}</span>
              <button 
                type="button"
                onClick={(e) => handleDelete(e, note)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--status-red)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
                title="Hafızadan Sil"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
