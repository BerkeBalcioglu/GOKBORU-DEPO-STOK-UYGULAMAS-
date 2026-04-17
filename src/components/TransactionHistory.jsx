import React from 'react';

export default function TransactionHistory({ transactions }) {
  return (
    <div>
      <h3 style={{ marginBottom: '24px' }}>Tüm İşlem Geçmişi</h3>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p>Henüz sisteme kaydedilmiş bir girdi veya çıktı işlemi bulunmuyor.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tarih / Saat</th>
                <th>İşlem Tipi</th>
                <th>Malzeme</th>
                <th>Miktar</th>
                <th>Not / Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                const isGirdi = tx.type === 'girdi';
                const dateObj = new Date(tx.date);
                return (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {dateObj.toLocaleDateString('tr-TR')} <br/>
                      <span style={{ fontSize: '0.8rem' }}>{dateObj.toLocaleTimeString('tr-TR')}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${isGirdi ? 'girdi' : 'cikti'}`}>
                        {isGirdi ? 'Girdi' : 'Çıktı'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{tx.itemName}</td>
                    <td style={{ 
                      fontWeight: 'bold', 
                      color: isGirdi ? 'var(--status-green)' : 'var(--status-red)' 
                    }}>
                      {isGirdi ? '+' : '-'}{tx.amount}
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.note || '-'}
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
