import { useEffect, useState } from 'react';
import { Wallet, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import API from '../services/api';

const fmt     = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const cap     = (s) => s ? s[0].toUpperCase() + s.slice(1) : '';

function StatusBadge({ status }) {
  const map = { paid: 'badge-paid', missed: 'badge-missed', pending: 'badge-pending' };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{cap(status)}</span>;
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
    </div>
  );
}

function DonutChart({ paid, pending, missed }) {
  const total = paid + pending + missed || 1;
  const segments = [
    { label: 'Paid',    value: paid,    color: '#16A34A' },
    { label: 'Pending', value: pending, color: '#F59E0B' },
    { label: 'Missed',  value: missed,  color: '#EF4444' },
  ].filter((s) => s.value > 0);

  const r = 54, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="16" />
          {segments.map((s) => {
            const dash = (s.value / total) * circ;
            const el = (
              <circle key={s.label} cx={cx} cy={cy} r={r}
                fill="none" stroke={s.color} strokeWidth="16"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset} strokeLinecap="round"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="donut-label">
          <span style={{ fontSize: '.68rem', color: 'var(--text-2)' }}>Total</span>
          <span style={{ fontSize: '.88rem', fontWeight: 700 }}>{fmt(paid + pending + missed)}</span>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map((s) => (
          <div key={s.label} className="donut-legend-item">
            <div className="legend-dot" style={{ background: s.color }} />
            <span style={{ color: 'var(--text-2)' }}>{s.label}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, fontSize: '.8rem' }}>{fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FREQ = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
const PITEM = ['pitem-green', 'pitem-blue', 'pitem-violet', 'pitem-orange'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    API.get('/dashboard')
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Could not load dashboard data. Make sure the server is running.'))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) return <AppLayout><Spinner /></AppLayout>;
  if (error)   return <AppLayout><div className="alert alert-error" style={{ marginTop: 20 }}>{error}</div></AppLayout>;

  // Defensive — handle both old and new API response shapes
  const stats = data?.stats ?? {
    totalSaved:         data?.myStats?.totalSaved ?? 0,
    groupsJoined:       data?.myStats?.groupsJoined ?? 0,
    totalContributions: data?.myStats?.totalContributions ?? 0,
    missedCount:        data?.myStats?.missedContributions ?? 0,
    pendingCount:       data?.myStats?.pendingContributions ?? 0,
    paidAmount:         data?.myStats?.totalSaved ?? 0,
    pendingAmount:      0,
    missedAmount:       0,
  };
  const recentContributions = data?.recentContributions ?? data?.recentTransactions ?? [];
  const groups              = data?.groups ?? data?.myStats?.groups ?? [];

  const noActivity = recentContributions.length === 0 && groups.length === 0;

  return (
    <AppLayout>
      {/* No-activity empty state */}
      {noActivity ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ marginBottom: 16, opacity: .25 }}><Wallet size={52} strokeWidth={1.2} /></div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No savings activity yet</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '.9rem', maxWidth: 340, margin: '0 auto 24px' }}>
            Join or create a cooperative group to start tracking your contributions and savings.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/groups')}>Browse Groups</button>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="stats-row">
            <div className="stat-card green">
              <div className="stat-label">Total Saved</div>
              <div className="stat-value">{fmt(stats.totalSaved)}</div>
              <div className="stat-sub">{stats.totalContributions} contribution{stats.totalContributions !== 1 ? 's' : ''} made</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-label">Groups Joined</div>
              <div className="stat-value">{stats.groupsJoined}</div>
              <div className="stat-sub">active group{stats.groupsJoined !== 1 ? 's' : ''}</div>
            </div>
            <div className="stat-card violet">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{fmt(stats.pendingAmount)}</div>
              <div className="stat-sub">{stats.pendingCount} payment{stats.pendingCount !== 1 ? 's' : ''} pending</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-label">Missed</div>
              <div className="stat-value">{stats.missedCount}</div>
              <div className="stat-sub">{fmt(stats.missedAmount)} total missed</div>
            </div>
          </div>

          {/* Main grid */}
          <div className="dash-grid">
            {/* Recent contributions */}
            <div className="card">
              <div className="card-pad" style={{ paddingBottom: 0 }}>
                <div className="card-header">
                  <span className="card-title">Recent Contributions</span>
                  <button className="btn-link" onClick={() => navigate('/contributions')}>View all</button>
                </div>
              </div>
              {recentContributions.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <div className="empty-icon"><CreditCard size={26} strokeWidth={1.5} /></div>
                  <p className="empty-text">No contributions yet.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Group</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {recentContributions.map((tx) => (
                        <tr key={tx._id}>
                          <td className="fw-600">{tx.group?.groupName || '—'}</td>
                          <td className="fw-600 text-green">{fmt(tx.amount)}</td>
                          <td className="text-muted">{fmtDate(tx.createdAt)}</td>
                          <td><StatusBadge status={tx.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* My Groups */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 14, color: 'var(--text-1)' }}>My Groups</div>
              {groups.length === 0 ? (
                <div className="card card-pad" style={{ textAlign: 'center', padding: '28px 16px' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '.85rem', marginBottom: 12 }}>No groups yet.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/groups')}>Browse Groups</button>
                </div>
              ) : (
                groups.map((g, i) => (
                  <div key={g._id} className={`payout-item ${PITEM[i % 4]}`}>
                    <div className="payout-item-name">{g.groupName}</div>
                    <div className="payout-item-next">{FREQ[g.frequency] ?? g.frequency} · {fmt(g.contributionAmount)}</div>
                    <div className="payout-item-date">{g.members?.length ?? 0} member{g.members?.length !== 1 ? 's' : ''}</div>
                  </div>
                ))
              )}
            </div>

            {/* Savings breakdown */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 14, color: 'var(--text-1)' }}>Savings Breakdown</div>
              {stats.totalContributions === 0 ? (
                <div className="card card-pad" style={{ textAlign: 'center', padding: '28px 16px' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '.85rem' }}>No contribution data yet.</p>
                </div>
              ) : (
                <DonutChart paid={stats.paidAmount} pending={stats.pendingAmount} missed={stats.missedAmount} />
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
