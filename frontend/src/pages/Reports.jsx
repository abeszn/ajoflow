import { useEffect, useState, useMemo } from 'react';
import { BarChart3, TrendingUp, CheckCircle, XCircle, Clock, Flame } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import API from '../services/api';

const fmt     = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
const pct     = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

/* ── Donut ── */
function Donut({ segments, label, sublabel }) {
  const total  = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 48, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="14" />
          {segments.filter(s => s.value > 0).map((s) => {
            const dash = (s.value / total) * circ;
            const el = (
              <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.color} strokeWidth="14"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset} strokeLinecap="round"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '.7rem', color: 'var(--text-3)', fontWeight: 600 }}>{sublabel}</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)' }}>{label}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {segments.filter(s => s.value > 0).map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-2)', flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar chart (SVG) ── */
function BarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const W = 100 / data.length;
  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${data.length * 56} 120`} style={{ width: '100%', height: 120, overflow: 'visible' }}>
        {data.map((d, i) => {
          const bh = Math.max((d.total / maxVal) * 90, d.total > 0 ? 4 : 0);
          const x  = i * 56 + 8;
          return (
            <g key={d.month}>
              <rect x={x} y={100 - bh} width={40} height={bh} rx="5"
                fill={d.total > 0 ? '#16A34A' : 'var(--border)'} opacity={d.total > 0 ? 1 : 0.4} />
              <text x={x + 20} y={115} textAnchor="middle" fontSize="10" fill="var(--text-3)" fontFamily="Inter,sans-serif">
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Reports() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    document.title = 'Reports | AjoFlow';
    API.get('/contributions/my')
      .then(({ data }) => setContributions(data))
      .catch(() => setError('Could not load report data.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── derived stats ── */
  const stats = useMemo(() => {
    const paid    = contributions.filter(c => c.status === 'paid');
    const missed  = contributions.filter(c => c.status === 'missed');
    const pending = contributions.filter(c => c.status === 'pending');
    return {
      total:      contributions.length,
      paidAmt:    paid.reduce((s, c) => s + c.amount, 0),
      paidCnt:    paid.length,
      missedCnt:  missed.length,
      pendingCnt: pending.length,
      missedAmt:  missed.reduce((s, c) => s + c.amount, 0),
      pendingAmt: pending.reduce((s, c) => s + c.amount, 0),
      rate:       pct(paid.length, contributions.length),
    };
  }, [contributions]);

  /* ── last 6 months bar chart data ── */
  const monthlyBars = useMemo(() => {
    const map = {};
    contributions.forEach(c => {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + (c.status === 'paid' ? c.amount : 0);
    });
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const month = d.toLocaleDateString('en-NG', { month: 'short' });
      out.push({ month, total: map[key] || 0 });
    }
    return out;
  }, [contributions]);

  /* ── per-group breakdown ── */
  const byGroup = useMemo(() => {
    const map = {};
    contributions.forEach(c => {
      const gid   = c.group?._id || 'unknown';
      const gname = c.group?.groupName || 'Unknown Group';
      if (!map[gid]) map[gid] = { name: gname, paid: 0, missed: 0, pending: 0, total: 0 };
      map[gid][c.status] += c.amount;
      map[gid].total     += c.amount;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [contributions]);

  /* ── streak (consecutive months with ≥1 paid contribution) ── */
  const streak = useMemo(() => {
    const paidMonths = new Set(
      contributions
        .filter(c => c.status === 'paid')
        .map(c => {
          const d = new Date(c.createdAt);
          return `${d.getFullYear()}-${d.getMonth()}`;
        })
    );
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (paidMonths.has(`${d.getFullYear()}-${d.getMonth()}`)) count++;
      else break;
    }
    return count;
  }, [contributions]);

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
      </div>
    </AppLayout>
  );

  if (error) return (
    <AppLayout><div className="alert alert-error" style={{ marginTop: 20 }}>{error}</div></AppLayout>
  );

  if (contributions.length === 0) return (
    <AppLayout>
      <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 16, opacity: .25 }}><BarChart3 size={52} strokeWidth={1.2} /></div>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No data yet</h3>
        <p style={{ color: 'var(--text-2)', fontSize: '.9rem' }}>
          Make your first contribution to start seeing reports here.
        </p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      {/* ── Summary stat cards ── */}
      <div className="stats-row">
        <div className="stat-card green">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">{fmt(stats.paidAmt)}</div>
          <div className="stat-sub up">{stats.rate}% on-time rate</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Contributions</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">{stats.paidCnt} paid</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Missed</div>
          <div className="stat-value">{stats.missedCnt}</div>
          <div className="stat-sub">{fmt(stats.missedAmt)} total</div>
        </div>
        <div className="stat-card violet">
          <div className="stat-label">Streak</div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {streak}
            <Flame size={20} color="#EA580C" strokeWidth={1.8} />
          </div>
          <div className="stat-sub">month{streak !== 1 ? 's' : ''} in a row</div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="reports-grid">

        {/* Monthly activity bar chart */}
        <div className="card card-pad">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <span className="card-title">Monthly Activity</span>
            <TrendingUp size={16} color="var(--text-3)" strokeWidth={1.8} />
          </div>
          <BarChart data={monthlyBars} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>6-month paid contributions</span>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              {fmt(monthlyBars.reduce((s, d) => s + d.total, 0))} total
            </span>
          </div>
        </div>

        {/* Payment status donut */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: 20 }}>
            <span className="card-title">Payment Status</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Donut
              label={`${stats.rate}%`}
              sublabel="paid"
              segments={[
                { label: 'Paid',    value: stats.paidAmt,    color: '#16A34A' },
                { label: 'Pending', value: stats.pendingAmt, color: '#F59E0B' },
                { label: 'Missed',  value: stats.missedAmt,  color: '#EF4444' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Per-group table ── */}
      {byGroup.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <div className="card-header">
              <span className="card-title">Performance by Group</span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} color="#16A34A" />Paid</span></th>
                  <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} color="#D97706" />Pending</span></th>
                  <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={12} color="#DC2626" />Missed</span></th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {byGroup.map(g => {
                  const groupTotal = contributions.filter(c => c.group?.groupName === g.name).length;
                  const paidCount  = contributions.filter(c => c.group?.groupName === g.name && c.status === 'paid').length;
                  const rate       = pct(paidCount, groupTotal);
                  return (
                    <tr key={g.name}>
                      <td className="fw-600">{g.name}</td>
                      <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{fmt(g.paid)}</td>
                      <td style={{ color: '#D97706', fontWeight: 500 }}>{fmt(g.pending)}</td>
                      <td style={{ color: '#DC2626', fontWeight: 500 }}>{fmt(g.missed)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${rate}%`, background: rate >= 80 ? '#16A34A' : rate >= 50 ? '#F59E0B' : '#EF4444', borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-1)', minWidth: 32 }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
