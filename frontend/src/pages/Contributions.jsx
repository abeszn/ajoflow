import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt     = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CFG = {
  paid:    { cls: 'badge-paid',    icon: CheckCircle, color: '#16A34A', label: 'Paid' },
  pending: { cls: 'badge-pending', icon: Clock,       color: '#D97706', label: 'Pending' },
  missed:  { cls: 'badge-missed',  icon: XCircle,     color: '#DC2626', label: 'Missed' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

/* ── auto-generate contribution period ── */
const defaultPeriod = (frequency) => {
  const now = new Date();
  if (frequency === 'monthly')
    return now.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
  if (frequency === 'weekly') {
    const week = Math.ceil(now.getDate() / 7);
    return `Week ${week}, ${now.getFullYear()}`;
  }
  return now.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ── calculate real consecutive-month streak ── */
const calcStreak = (contributions) => {
  const paidMonths = new Set(
    contributions
      .filter((c) => c.status === 'paid')
      .map((c) => {
        const d = new Date(c.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
  );
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 120; i++) {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!paidMonths.has(key)) break;
    streak++;
    d.setMonth(d.getMonth() - 1);
  }
  return streak;
};

const TABS = ['All', 'Paid', 'Pending', 'Missed'];

/* ══════════════ View / Mark-as-Paid modal ══════════════ */
function ViewModal({ contribution, isAdmin, onClose, onUpdated }) {
  const [updating, setUpdating] = useState(false);
  const [error, setError]       = useState('');

  const update = async (status) => {
    setUpdating(true); setError('');
    try {
      await API.patch(`/contributions/${contribution._id}/status`, { status });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status.');
      setUpdating(false);
    }
  };

  const cfg = STATUS_CFG[contribution.status] || STATUS_CFG.pending;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 style={{ fontWeight: 700 }}>Contribution Details</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Detail rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
          {[
            { label: 'Group',   value: contribution.group?.groupName || '—' },
            { label: 'Period',  value: contribution.contributionPeriod },
            { label: 'Amount',  value: fmt(contribution.amount), bold: true, green: true },
            { label: 'Due',     value: fmtDate(contribution.dueDate) },
            { label: 'Created', value: fmtDate(contribution.createdAt) },
            { label: 'Paid on', value: contribution.paidDate ? fmtDate(contribution.paidDate) : '—' },
          ].map(({ label, value, bold, green }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '.82rem', color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: '.88rem', fontWeight: bold ? 700 : 500, color: green ? 'var(--accent-green)' : 'var(--text-1)' }}>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: '.82rem', color: 'var(--text-3)', fontWeight: 500 }}>Status</span>
            <StatusBadge status={contribution.status} />
          </div>
        </div>

        {/* Action buttons — admin only */}
        {isAdmin ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contribution.status === 'pending' && (
              <button
                className="btn btn-green btn-full"
                onClick={() => update('paid')}
                disabled={updating}
                style={{ justifyContent: 'center' }}
              >
                {updating
                  ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Updating…</>
                  : <><CheckCircle size={15} strokeWidth={2} /> Mark as Paid</>}
              </button>
            )}
            {contribution.status === 'pending' && (
              <button
                className="btn btn-outline btn-full"
                onClick={() => update('missed')}
                disabled={updating}
                style={{ justifyContent: 'center', color: 'var(--text-2)' }}
              >
                Mark as Missed
              </button>
            )}
            {contribution.status !== 'pending' && (
              <button
                className="btn btn-ghost btn-full"
                onClick={() => update('pending')}
                disabled={updating}
                style={{ justifyContent: 'center' }}
              >
                {updating ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Updating…</> : 'Revert to Pending'}
              </button>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '.8rem', color: 'var(--text-3)', textAlign: 'center', margin: 0 }}>
            Only the group admin can update contribution status.
          </p>
        )}
      </div>
    </div>
  );
}

/* ══════════════ Main page ══════════════ */
export default function Contributions() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [groups, setGroups]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [tab, setTab]                     = useState('All');
  const [showModal, setShowModal]         = useState(false);
  const [viewItem, setViewItem]           = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [formError, setFormError]         = useState('');
  const [form, setForm]                   = useState({ groupId: '', amount: '', contributionPeriod: '' });

  const fetchAll = async () => {
    const [c, g] = await Promise.all([
      API.get('/contributions/my'),
      API.get('/groups'),
    ]);
    setContributions(c.data);
    setGroups(g.data);
  };

  useEffect(() => {
    fetchAll().catch(() => setError('Could not load contributions.')).finally(() => setLoading(false));
  }, []);

  /* When a group is picked in the modal, pre-fill amount + period */
  const handleGroupChange = (groupId) => {
    const g = groups.find((gr) => gr._id === groupId);
    setForm({
      groupId,
      amount: g ? String(g.contributionAmount) : '',
      contributionPeriod: g ? defaultPeriod(g.frequency) : '',
    });
  };

  const filtered = tab === 'All'
    ? contributions
    : contributions.filter((c) => c.status === tab.toLowerCase());

  /* Stats */
  const totalPaid   = contributions.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const now         = new Date();
  const thisMonth   = contributions
    .filter((c) => { const d = new Date(c.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((s, c) => s + c.amount, 0);
  const missedCount = contributions.filter((c) => c.status === 'missed').length;
  const streak      = calcStreak(contributions);

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError(''); setSubmitting(true);
    try {
      await API.post('/contributions', {
        groupId:            form.groupId,
        amount:             Number(form.amount),
        contributionPeriod: form.contributionPeriod,
      });
      setShowModal(false);
      setForm({ groupId: '', amount: '', contributionPeriod: '' });
      setSuccess('Contribution recorded!');
      await fetchAll();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not submit contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdated = async () => {
    setViewItem(null);
    setSuccess('Status updated!');
    await fetchAll();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <AppLayout>
      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Stat cards */}
      {!loading && (
        <div className="stats-row">
          <div className="stat-card green">
            <div className="stat-label">Total Paid</div>
            <div className="stat-value">{fmt(totalPaid)}</div>
            <div className="stat-sub">{contributions.filter((c) => c.status === 'paid').length} payments</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{fmt(thisMonth)}</div>
            <div className="stat-sub">{now.toLocaleDateString('en-NG', { month: 'long' })}</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-label">Missed Payments</div>
            <div className="stat-value">{missedCount}</div>
            <div className="stat-sub">{missedCount === 0 ? 'All clear!' : 'needs attention'}</div>
          </div>
          <div className="stat-card violet">
            <div className="stat-label">Paid Streak</div>
            <div className="stat-value">{streak} {streak === 1 ? 'month' : 'months'}</div>
            <div className="stat-sub">{streak > 0 ? 'consecutive months paid' : 'no streak yet'}</div>
          </div>
        </div>
      )}

      {/* Tabs + table */}
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div className="tabs">
              {TABS.map((t) => (
                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t}
                  {t !== 'All' && (
                    <span style={{ marginLeft: 6, fontSize: '.7rem', background: tab === t ? 'rgba(255,255,255,.2)' : 'var(--bg)', borderRadius: 999, padding: '1px 6px', fontWeight: 700 }}>
                      {contributions.filter((c) => c.status === t.toLowerCase()).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Record</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><CreditCard size={26} strokeWidth={1.5} /></div>
            <p className="empty-text">No {tab !== 'All' ? tab.toLowerCase() : ''} contributions yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td className="fw-600">{c.group?.groupName || '—'}</td>
                    <td className="text-muted">{c.contributionPeriod}</td>
                    <td className="fw-600 text-green">{fmt(c.amount)}</td>
                    <td className="text-muted">{fmtDate(c.createdAt)}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <button className="btn-link" onClick={() => setViewItem(c)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>
              Showing {filtered.length} of {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>
              Total: <strong style={{ color: 'var(--text-1)' }}>{fmt(filtered.reduce((s, c) => s + c.amount, 0))}</strong>
            </span>
          </div>
        )}
      </div>

      {/* View / update modal */}
      {viewItem && (() => {
        const viewGroup = groups.find((g) => g._id === viewItem.group?._id);
        const isAdmin   = !!(viewGroup && (viewGroup.admin?._id || viewGroup.admin) === user?._id);
        return (
          <ViewModal
            contribution={viewItem}
            isAdmin={isAdmin}
            onClose={() => setViewItem(null)}
            onUpdated={handleStatusUpdated}
          />
        );
      })()}

      {/* Record contribution modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Record Contribution</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Group <span style={{ color: '#DC2626' }}>*</span></label>
                <select
                  className="form-input form-select"
                  value={form.groupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  required
                >
                  <option value="">— Choose a group —</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.groupName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₦) <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contribution Period <span style={{ color: '#DC2626' }}>*</span></label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. May 2026"
                  value={form.contributionPeriod}
                  onChange={(e) => setForm({ ...form, contributionPeriod: e.target.value })}
                  required
                />
                <p style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: 6 }}>Auto-filled when you pick a group. Edit if needed.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
