import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AppLayout from '../components/AppLayout';
import API from '../services/api';

export default function Settings() {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    try {
      const { data } = await API.put('/auth/me', { name: form.name, phone: form.phone });
      login({ ...user, ...data });
      setEditing(false);
      setSaveMsg('Profile updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      setSaveErr(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage your account and preferences</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 620 }}>

        {/* ── Profile ── */}
        <div className="card card-pad">
          <div className="card-header">
            <h3 className="card-title">Profile</h3>
            {!editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(true); setSaveMsg(''); setSaveErr(''); }}>
                Edit
              </button>
            )}
          </div>

          {saveMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{saveMsg}</div>}
          {saveErr && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{saveErr}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--sidebar-bg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-1)' }}>{user?.name}</div>
              <div style={{ fontSize: '.82rem', color: 'var(--text-2)', marginTop: 2 }}>{user?.email}</div>
              <span className={`badge badge-${user?.role}`} style={{ marginTop: 6 }}>{user?.role}</span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group mb-0">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 801 234 5678" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? <><div className="spinner" /> Saving…</> : 'Save Changes'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }); }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Row label="Email" value={user?.email} />
              <Row label="Phone" value={user?.phone || '—'} />
            </div>
          )}
        </div>

        {/* ── Appearance ── */}
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 20 }}>Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--text-1)' }}>Dark Mode</div>
              <div style={{ fontSize: '.82rem', color: 'var(--text-2)', marginTop: 3 }}>
                {theme === 'dark' ? 'Using dark theme' : 'Using light theme'}
              </div>
            </div>
            <button
              className="theme-switch"
              onClick={toggleTheme}
              data-on={theme === 'dark'}
              aria-label="Toggle dark mode"
            >
              <span className="theme-switch-thumb" />
            </button>
          </div>
        </div>

        {/* ── Security ── */}
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Security</h3>
          <div style={{ fontSize: '.88rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
            To change your password, sign out and use{' '}
            <a href="/forgot-password" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Forgot password</a>{' '}
            on the login page. A reset link will be sent to your email.
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="form-label">{label}</span>
      <span style={{ fontSize: '.9rem', color: 'var(--text-1)' }}>{value}</span>
    </div>
  );
}
