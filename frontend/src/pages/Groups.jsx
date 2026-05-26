import { useEffect, useState } from 'react';
import { Users, Calendar, Banknote, Crown, X, CheckCircle, Clock, XCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG');
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

const BAR_COLORS = ['bar-green', 'bar-blue', 'bar-violet', 'bar-orange'];
const TABS = ['All Groups', 'Active', 'Completed', 'Admin'];

const STATUS_CFG = {
  paid:    { cls: 'badge-paid',    icon: CheckCircle, color: '#16A34A', label: 'Paid' },
  pending: { cls: 'badge-pending', icon: Clock,       color: '#D97706', label: 'Pending' },
  missed:  { cls: 'badge-missed',  icon: XCircle,     color: '#DC2626', label: 'Missed' },
};

/* ── auto-generate contribution period from frequency ── */
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

/* ══════════════════ View Details Modal ══════════════════ */
function DetailsModal({ group, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    API.get(`/groups/${group._id}`)
      .then(({ data }) => setDetail(data))
      .catch(() => setError('Could not load group details.'))
      .finally(() => setLoading(false));
  }, [group._id]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '88vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3 style={{ fontWeight: 700 }}>{group.groupName}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            {/* Stat chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'Amount / Cycle', value: fmt(detail.contributionAmount) },
                { label: 'Frequency',      value: cap(detail.frequency) },
                { label: 'Members',        value: detail.members?.length ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '.95rem' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Admin */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Admin</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0E2B1A', color: '#3DDC84', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.9rem', flexShrink: 0 }}>
                  {detail.admin?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--text-1)' }}>{detail.admin?.name || '—'}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{detail.admin?.email || ''}</div>
                </div>
                <Crown size={15} color="#D97706" strokeWidth={2} />
              </div>
            </div>

            {/* Members */}
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                Members ({detail.members?.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {detail.members?.map((m) => (
                  <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.78rem', flexShrink: 0 }}>
                      {m.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--text-1)' }}>{m.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent contributions */}
            {detail.contributions?.length > 0 && (
              <div>
                <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                  Recent Contributions
                </p>
                <div className="table-wrap" style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr><th>Member</th><th>Period</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {detail.contributions.slice(0, 8).map((c) => {
                        const cfg = STATUS_CFG[c.status] || STATUS_CFG.pending;
                        const Icon = cfg.icon;
                        return (
                          <tr key={c._id}>
                            <td style={{ fontWeight: 600, fontSize: '.83rem' }}>{c.member?.name || '—'}</td>
                            <td style={{ fontSize: '.83rem', color: 'var(--text-2)' }}>{c.contributionPeriod}</td>
                            <td style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '.83rem' }}>{fmt(c.amount)}</td>
                            <td>
                              <span className={`badge ${cfg.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Icon size={10} strokeWidth={2.5} />
                                {cfg.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════ Contribute Modal ══════════════════ */
function ContributeModal({ group, onClose, onSuccess }) {
  const [period, setPeriod]   = useState(defaultPeriod(group.frequency));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/contributions', {
        groupId: group._id,
        amount: group.contributionAmount,
        contributionPeriod: period.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit contribution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 style={{ fontWeight: 700 }}>Make a Contribution</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Summary bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', borderRadius: 10, padding: '14px 18px', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: '.68rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Group</div>
            <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '.9rem' }}>{group.groupName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Amount</div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent-green)' }}>{fmt(group.contributionAmount)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Contribution Period</label>
            <input
              className="form-input"
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. May 2026"
              required
            />
            <p style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: 6 }}>
              The cycle this payment covers — edit if needed.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Submitting…</>
                : `Contribute ${fmt(group.contributionAmount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════ Main Page ══════════════════ */
export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [tab, setTab]             = useState('All Groups');
  const [showCreate, setShowCreate]   = useState(false);
  const [joiningId, setJoiningId]     = useState(null);
  const [detailGroup, setDetailGroup] = useState(null);
  const [contributeGroup, setContributeGroup] = useState(null);
  const [form, setForm]     = useState({ groupName: '', contributionAmount: '', frequency: 'monthly' });
  const [creating, setCreating]   = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchGroups = () => {
    setLoading(true);
    API.get('/groups')
      .then(({ data }) => setGroups(data))
      .catch(() => setError('Could not load groups.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const isAdmin  = (g) => (g.admin?._id || g.admin) === user?._id;
  const isMember = (g) => g.members?.some((m) => (m._id || m) === user?._id);

  const filtered = groups.filter((g) => {
    if (tab === 'Admin')     return isAdmin(g);
    if (tab === 'Completed') return false;
    return true;
  });

  const getProgress = (g) => ({ monthly: 75, weekly: 40, daily: 30 }[g.frequency] ?? 50);

  const handleJoin = async (id) => {
    setJoiningId(id); setError('');
    try {
      await API.post(`/groups/${id}/join`);
      setSuccess('Joined group!');
      fetchGroups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join group.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setCreateError(''); setCreating(true);
    try {
      await API.post('/groups', {
        groupName: form.groupName,
        contributionAmount: Number(form.contributionAmount),
        frequency: form.frequency,
      });
      setShowCreate(false);
      setForm({ groupName: '', contributionAmount: '', frequency: 'monthly' });
      setSuccess('Group created!');
      fetchGroups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Could not create group.');
    } finally {
      setCreating(false);
    }
  };

  const handleContributeSuccess = () => {
    setContributeGroup(null);
    setSuccess('Contribution submitted!');
    fetchGroups();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <AppLayout>
      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Tabs + action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Create Group</button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Users size={26} strokeWidth={1.5} /></div>
            <h3 style={{ fontWeight: 700 }}>No groups found</h3>
            <p className="empty-text">Create one or join an existing savings circle.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>+ Create Group</button>
          </div>
        </div>
      ) : (
        <div className="groups-grid">
          {filtered.map((g, i) => {
            const admin    = isAdmin(g);
            const member   = isMember(g);
            const progress = getProgress(g);
            return (
              <div className="group-card" key={g._id}>
                <div className={`group-card-bar ${BAR_COLORS[i % BAR_COLORS.length]}`} />
                <div className="group-card-body">
                  <div className="group-card-top">
                    <div className="group-card-name">{g.groupName}</div>
                    {admin  && <span className="badge badge-admin">Admin</span>}
                    {!admin && member && <span className="badge badge-member">Member</span>}
                  </div>

                  <div className="group-meta-list">
                    <div className="group-meta-item">
                      <Users size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
                      {g.members?.length || 0} members
                    </div>
                    <div className="group-meta-item">
                      <Calendar size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
                      {cap(g.frequency)}
                    </div>
                    <div className="group-meta-item">
                      <Banknote size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
                      {fmt(g.contributionAmount)}/cycle
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Cycle Progress</span>
                      <span className="progress-pct">{progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="group-card-footer">
                    <button className="btn-link" onClick={() => setDetailGroup(g)}>View Details</button>
                    {!member ? (
                      <button
                        className="btn btn-green btn-sm"
                        onClick={() => handleJoin(g._id)}
                        disabled={joiningId === g._id}
                      >
                        {joiningId === g._id
                          ? <><div className="spinner" style={{ width: 12, height: 12 }} /> Joining…</>
                          : 'Join Group'}
                      </button>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => setContributeGroup(g)}>
                        Contribute →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {detailGroup && (
        <DetailsModal group={detailGroup} onClose={() => setDetailGroup(null)} />
      )}

      {/* Contribute Modal */}
      {contributeGroup && (
        <ContributeModal
          group={contributeGroup}
          onClose={() => setContributeGroup(null)}
          onSuccess={handleContributeSuccess}
        />
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Create New Group</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>

            {createError && <div className="alert alert-error">{createError}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input className="form-input" type="text" placeholder="e.g. Market Women Ajo"
                  value={form.groupName} onChange={(e) => setForm({ ...form, groupName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contribution Amount (₦)</label>
                <input className="form-input" type="number" min="100" placeholder="e.g. 10000"
                  value={form.contributionAmount} onChange={(e) => setForm({ ...form, contributionAmount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-input form-select" value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating…</> : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
