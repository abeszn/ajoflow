import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import API from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

function PwField({ label, value, onChange, placeholder, show, onToggle }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: 42 }}
          required
          minLength={6}
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

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  useEffect(() => { document.title = 'Reset Password | AjoFlow'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm)  return setError('Passwords do not match.');
    if (password.length < 6)   return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: email.trim(), password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No account found with that email.');
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

  return (
    <div className="auth-layout">
      {leftPanel}

      <div className="auth-right">
        <ThemeToggle className="auth-theme-btn" />
        <div className="auth-form-wrap">

          {!done ? (
            <>
              <div style={{ marginBottom: 16, color: 'var(--text-3)' }}>
                <Lock size={44} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Reset password</h2>
              <p className="auth-form-subtitle">
                Enter your email and choose a new password.
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <PwField
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  show={showPw}
                  onToggle={() => setShowPw((v) => !v)}
                />

                <PwField
                  label="Confirm New Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  show={showCf}
                  onToggle={() => setShowCf((v) => !v)}
                />

                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? <><div className="spinner" /> Saving…</> : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--accent-green)', display: 'flex', justifyContent: 'center' }}>
                <CheckCircle size={52} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Password updated!</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 28 }}>
                Your password has been changed successfully. Sign in with your new password.
              </p>
              <Link to="/login">
                <button className="btn btn-primary btn-full btn-lg">Go to Sign In</button>
              </Link>
            </div>
          )}

          {!done && (
            <p className="auth-footer-text" style={{ marginTop: 28 }}>
              <Link to="/login" style={{ color: '#6B7280', fontSize: '.85rem' }}>← Back to Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
