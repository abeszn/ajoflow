import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/AppLayout';
import API from '../services/api';

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="form-label">{label}</span>
      <span style={{ fontSize: '.9rem', color: 'var(--text-1)' }}>{value}</span>
    </div>
  );
}

function PwField({ label, value, onChange, placeholder, show, onToggle }) {
  return (
    <div className="form-group mb-0">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ paddingRight: 42 }}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, updateUser }     = useAuth();
  const { theme, toggleTheme }   = useTheme();

  /* ── Profile edit ── */
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');
  const [saveErr, setSaveErr]   = useState('');

  /* ── Change password ── */
  const [pwForm, setPwForm]     = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg]       = useState('');
  const [pwErr, setPwErr]       = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Save profile (MongoDB) ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      const { data } = await API.put('/auth/me', { name: form.name, phone: form.phone });
      updateUser(data);
      setEditing(false);
      setSaveMsg('Profile updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      setSaveErr(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Change password (Supabase) ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pwForm.next !== pwForm.confirm) return setPwErr('New passwords do not match.');
    if (pwForm.next.length < 6)         return setPwErr('New password must be at least 6 characters.');
    if (pwForm.current === pwForm.next)  return setPwErr('New password must be different from the current one.');

    setPwSaving(true);
    try {
      // Verify current password by re-authenticating
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expired. Please sign in again.');

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email:    session.user.email,
        password: pwForm.current,
      });
      if (signInErr) { setPwErr('Current password is incorrect.'); return; }

      // Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: pwForm.next });
      if (updateErr) throw updateErr;

      setPwMsg('Password changed successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 5000);
    } catch (err) {
      setPwErr(err.message || 'Failed to change password. Please try again.');
    } finally {
      setPwSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <AppLayout>
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
              <Row label="Email"  value={user?.email} />
              <Row label="Phone"  value={user?.phone || '—'} />
            </div>
          )}
        </div>

        {/* ── Change Password ── */}
        <div className="card card-pad">
          <h3 className="card-title" style={{ marginBottom: 20 }}>Change Password</h3>

          {pwMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{pwMsg}</div>}
          {pwErr && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{pwErr}</div>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PwField
              label="Current Password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              placeholder="Your current password"
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
            />
            <PwField
              label="New Password"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              placeholder="At least 6 characters"
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            <PwField
              label="Confirm New Password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="Repeat new password"
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />
            <div>
              <button className="btn btn-primary" type="submit" disabled={pwSaving}>
                {pwSaving ? <><div className="spinner" /> Updating…</> : 'Update Password'}
              </button>
            </div>
          </form>
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
            <button className="theme-switch" onClick={toggleTheme} data-on={theme === 'dark'} aria-label="Toggle dark mode">
              <span className="theme-switch-thumb" />
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
