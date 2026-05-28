import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [ready, setReady]     = useState(false);   // recovery session received
  const [invalid, setInvalid] = useState(false);   // link is expired / missing
  const [form, setForm]       = useState({ password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    document.title = 'Reset Password | AjoFlow';

    // Supabase parses the URL hash and fires PASSWORD_RECOVERY when the reset
    // link is valid. If no recovery token is present, we set invalid = true.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    // Fallback: if there's already an active session (user clicked link in same browser)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      else {
        // Give Supabase 1.5s to process the URL hash before declaring invalid
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (!s) setInvalid(true);
          });
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const leftPanel = (
    <div className="auth-left">
      <div className="auth-left-bar" />
      <div className="auth-left-blob" style={{ width: 500, height: 500, top: 170, left: -80 }} />
      <div className="auth-left-blob" style={{ width: 300, height: 300, top: 700, left: 200 }} />
      <div className="auth-left-inner">
        <div className="auth-logo">
          <div className="logo-box">A</div>
          <span className="logo-name">AjoFlow</span>
        </div>
        <div className="auth-hero">
          <h1>Save Together,<br />Thrive Together.</h1>
          <p>Digitising Ajo &amp; Esusu for modern cooperatives across Nigeria.</p>
        </div>
        <div />
      </div>
    </div>
  );

  /* ── Invalid / expired link ── */
  if (invalid) {
    return (
      <div className="auth-layout">
        {leftPanel}
        <div className="auth-right">
          <ThemeToggle className="auth-theme-btn" />
          <div className="auth-form-wrap" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16, color: '#EF4444', display: 'flex', justifyContent: 'center' }}>
              <AlertTriangle size={52} strokeWidth={1.4} />
            </div>
            <h2 className="auth-form-title">Link expired</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.75, marginBottom: 28 }}>
              This password reset link is invalid or has expired.
              Request a new one and try again.
            </p>
            <Link to="/forgot-password">
              <button className="btn btn-primary btn-full btn-lg">Request New Link</button>
            </Link>
            <p className="auth-footer-text" style={{ marginTop: 20 }}>
              <Link to="/login" style={{ color: '#6B7280', fontSize: '.85rem' }}>← Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading recovery session ── */
  if (!ready && !done) {
    return (
      <div className="auth-layout">
        {leftPanel}
        <div className="auth-right">
          <ThemeToggle className="auth-theme-btn" />
          <div className="auth-form-wrap" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      {leftPanel}
      <div className="auth-right">
        <ThemeToggle className="auth-theme-btn" />
        <div className="auth-form-wrap">

          {!done ? (
            <>
              <div style={{ marginBottom: 16, color: 'var(--text-3)' }}>
                <KeyRound size={44} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Set new password</h2>
              <p className="auth-form-subtitle">Choose a strong password — at least 6 characters.</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <PasswordInput
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <PasswordInput
                    placeholder="••••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                  {loading ? <><div className="spinner" /> Saving…</> : 'Save New Password'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--accent-green)', display: 'flex', justifyContent: 'center' }}>
                <CheckCircle size={52} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Password updated!</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.75 }}>
                Your password has been changed. Redirecting you to sign in…
              </p>
            </div>
          )}

          <p className="auth-footer-text" style={{ marginTop: 24 }}>
            <Link to="/login" style={{ color: '#6B7280', fontSize: '.85rem' }}>← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
