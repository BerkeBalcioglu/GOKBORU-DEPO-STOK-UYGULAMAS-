import { Package, AlertTriangle, ArrowRightLeft, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ inventory, transactions, maintenances = [] }) {
  const totalItemsType = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity < (item.minStock || 5));
  
  const today = new Date();
  const upcomingMaintenances = maintenances.filter(m => {
    if (!m.nextDate) return false;
    const next = new Date(m.nextDate);
    const diffTime = next - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Overdue or within next 30 days
    return diffDays <= 30;
  });

  const recentTransactions = transactions.slice(0, 5);

  // AYLIK BAKIM VERİSİ HESAPLAMA (Son 6 Ay)
  const getMonthlyData = () => {
    const data = [];
    const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      
      const count = maintenances.filter(m => {
        const mDate = new Date(m.date);
        return mDate.getMonth() === monthIndex && mDate.getFullYear() === year;
      }).length;

      data.push({
        name: `${monthNames[monthIndex]} ${year.toString().slice(2)}`,
        bakim: count
      });
    }
    return data;
  };

  const chartData = getMonthlyData();

  return (
    <div>
      <h3 style={{ marginBottom: '24px' }}>Sistem Özeti</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Card 1 */}
        <div style={{ background: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '12px', borderRadius: '12px', color: 'var(--accent-blue)' }}>
              <Package size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam Malzeme (Çeşit)</p>
              <h2 style={{ fontSize: '2rem', margin: '4px 0 0 0' }}>{totalItemsType}</h2>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ background: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
          <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--status-red-bg)', color: 'var(--status-red)', padding: '16px', borderRadius: '12px' }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Kritik Stok (Uyarı)</p>
              <h2 style={{ fontSize: '2rem', margin: '4px 0 0 0' }}>{lowStockItems.length}</h2>
            </div>
          </div>

          <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '16px', borderRadius: '12px' }}>
              <Wrench size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Yaklaşan Bakım</p>
              <h2 style={{ fontSize: '2rem', margin: '4px 0 0 0' }}>{upcomingMaintenances.length}</h2>
            </div>
          </div>
          {lowStockItems.length > 0 && (
            <div style={{ position: 'absolute', top: '0', right: '0', width: '4px', height: '100%', background: 'var(--status-red)', boxShadow: 'var(--shadow-glow-red)' }}></div>
          )}
        </div>

        {/* Card 3 */}
        <div style={{ background: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--status-green-bg)', padding: '12px', borderRadius: '12px', color: 'var(--status-green)' }}>
              <ArrowRightLeft size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam İşlem</p>
              <h2 style={{ fontSize: '2rem', margin: '4px 0 0 0' }}>{transactions.length}</h2>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Son İşlemler Tablosu */}
        <div style={{ background: 'var(--bg-card-solid)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Son İşlemler</h3>
          {recentTransactions.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>İşlem Tipi</th>
                    <th>Malzeme</th>
                    <th>Miktar</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td>
                        <span className={`status-badge ${tx.type === 'girdi' ? 'girdi' : 'cikti'}`}>
                          {tx.type === 'girdi' ? 'Girdi (Eklendi)' : 'Çıktı (Düşüldü)'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{tx.itemName}</td>
                      <td>{tx.type === 'girdi' ? '+' : '-'}{tx.amount}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Henüz işlem bulunmuyor.</p>
          )}
        </div>

        {/* Bakım Grafiği (Recharts) */}
        <div style={{ background: 'var(--bg-card-solid)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Son 6 Aylık Bakım Grafiği</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="bakim" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} name="Yapılan Bakım" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
