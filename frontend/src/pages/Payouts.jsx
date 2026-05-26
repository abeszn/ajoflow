import { useEffect, useState, useMemo } from 'react';
import { CheckCircle, Clock, XCircle, TrendingUp, Wallet, AlertTriangle, Filter } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import API from '../services/api';

const fmt     = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const cap     = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

const STATUS_CONFIG = {
  paid:    { icon: CheckCircle,    cls: 'badge-paid',    iconColor: '#16A34A', label: 'Paid' },
  pending: { icon: Clock,          cls: 'badge-pending', iconColor: '#D97706', label: 'Pending' },
  missed:  { icon: XCircle,        cls: 'badge-missed',  iconColor: '#DC2626', label: 'Missed' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

const TABS = ['All', 'Paid', 'Pending', 'Missed'];

export default function Payouts() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [activeTab, setActiveTab]         = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All Groups');

  useEffect(() => {
    API.get('/contributions/my')
      .then(({ data }) => setContributions(data))
      .catch(() => setError('Could not load payouts.'))
      .finally(() => setLoading(false));
  }, []);

  // Unique groups from contributions
  const groups = useMemo(() => {
    const map = new Map();
    contributions.forEach((c) => {
      if (c.group) map.set(c.group._id, c.group.groupName);
    });
    return [{ _id: 'all', name: 'All Groups' }, ...Array.from(map, ([_id, name]) => ({ _id, name }))];
  }, [contributions]);

  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      const matchTab   = activeTab === 'All' || c.status === activeTab.toLowerCase();
      const matchGroup = selectedGroup === 'All Groups' || c.group?.groupName === selectedGroup;
      return matchTab && matchGroup;
    });
  }, [contributions, activeTab, selectedGroup]);

  // Summary stats
  const stats = useMemo(() => {
    const paid    = contributions.filter((c) => c.status === 'paid');
    const pending = contributions.filter((c) => c.status === 'pending');
    const missed  = contributions.filter((c) => c.status === 'missed');
    return {
      paidAmt:    paid.reduce((s, c) => s + c.amount, 0),
      paidCount:  paid.length,
      pendingAmt: pending.reduce((s, c) => s + c.amount, 0),
      pendingCnt: pending.length,
      missedAmt:  missed.reduce((s, c) => s + c.amount, 0),
      missedCnt:  missed.length,
      total:      contributions.reduce((s, c) => s + c.amount, 0),
    };
  }, [contributions]);

  return (
    <AppLayout>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary cards */}
      {!loading && (
        <div className="stats-row" style={{ marginBottom: 24 }}>
          <div className="stat-card green">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(22,163,74,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={16} color="#16A34A" strokeWidth={2} />
              </div>
              <div className="stat-label" style={{ margin: 0 }}>Total Paid</div>
            </div>
            <div className="stat-value">{fmt(stats.paidAmt)}</div>
            <div className="stat-sub">{stats.paidCount} payment{stats.paidCount !== 1 ? 's' : ''}</div>
          </div>

          <div className="stat-card blue">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="#2563EB" strokeWidth={2} />
              </div>
              <div className="stat-label" style={{ margin: 0 }}>Pending</div>
            </div>
            <div className="stat-value">{fmt(stats.pendingAmt)}</div>
            <div className="stat-sub">{stats.pendingCnt} outstanding</div>
          </div>

          <div className="stat-card orange">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(234,88,12,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={16} color="#EA580C" strokeWidth={2} />
              </div>
              <div className="stat-label" style={{ margin: 0 }}>Missed</div>
            </div>
            <div className="stat-value">{fmt(stats.missedAmt)}</div>
            <div className="stat-sub">{stats.missedCnt} missed</div>
          </div>

          <div className="stat-card violet">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#7C3AED" strokeWidth={2} />
              </div>
              <div className="stat-label" style={{ margin: 0 }}>All-time Total</div>
            </div>
            <div className="stat-value">{fmt(stats.total)}</div>
            <div className="stat-sub">{contributions.length} contributions</div>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="card card-pad" style={{ marginBottom: 18, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Status tabs */}
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
                {t !== 'All' && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: '.7rem',
                    background: activeTab === t ? 'rgba(255,255,255,.2)' : 'var(--bg)',
                    borderRadius: 999,
                    padding: '1px 6px',
                    fontWeight: 700,
                  }}>
                    {contributions.filter((c) => c.status === t.toLowerCase()).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Group picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} color="var(--text-3)" strokeWidth={2} />
            <select
              className="form-input form-select"
              style={{ height: 36, padding: '0 32px 0 10px', fontSize: '.85rem', width: 'auto', minWidth: 160 }}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g._id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Wallet size={24} color="var(--text-3)" strokeWidth={1.5} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
              {contributions.length === 0 ? 'No contributions yet' : `No ${activeTab.toLowerCase()} contributions`}
            </p>
            <p className="empty-text">
              {contributions.length === 0
                ? 'Join a group and make your first contribution to see it here.'
                : 'Try a different filter or group.'}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{c.group?.groupName || '—'}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: 1, textTransform: 'capitalize' }}>
                        {c.group?.frequency ?? ''}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '.85rem' }}>{c.contributionPeriod}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: c.status === 'paid' ? 'var(--accent-green)' : 'var(--text-1)' }}>
                        {fmt(c.amount)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '.85rem' }}>{fmtDate(c.dueDate)}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '.85rem' }}>
                      {c.status === 'paid' && c.paidDate ? fmtDate(c.paidDate) : '—'}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer row count */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>
              Showing {filtered.length} of {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>
              Filtered total: <strong style={{ color: 'var(--text-1)' }}>{fmt(filtered.reduce((s, c) => s + c.amount, 0))}</strong>
            </span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
