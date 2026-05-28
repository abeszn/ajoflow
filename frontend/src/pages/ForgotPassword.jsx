import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, MailCheck, CheckCircle, Eye, EyeOff } from 'lucide-react';
import API from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

export default function ForgotPassword() {
  const [step, setStep]       = useState(1); // 1 = email, 2 = code + new pw, 3 = done
  const [email, setEmail]     = useState('');
  const [code, setCode]       = useState('');
  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [showPw,   setShowPw]     = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');

  useEffect(() => { document.title = 'Forgot Password | AjoFlow'; }, []);

  /* Step 1 — send code */
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — verify code + set password */
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6)  return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await API.post('/auth/verify-reset-code', { email, code, password });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="auth-right">
        <ThemeToggle className="auth-theme-btn" />
        <div className="auth-form-wrap">

          {/* ── Step 1: Enter email ── */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 16, color: 'var(--text-3)' }}>
                <Lock size={44} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Forgot password?</h2>
              <p className="auth-form-subtitle">Enter your email and we'll send a 6-digit reset code.</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSendCode}>
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
                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                  {loading ? <><div className="spinner" /> Sending code…</> : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: Enter code + new password ── */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 16, color: 'var(--accent-green)' }}>
                <MailCheck size={44} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Check your email</h2>
              <p className="auth-form-subtitle">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below along with your new password.
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div className="form-group">
                  <label className="form-label">6-Digit Code</label>
                  <input
                    className="form-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ letterSpacing: '0.3em', fontSize: '1.2rem', textAlign: 'center' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: 42 }}
                      required
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Repeat new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? <><div className="spinner" /> Changing password…</> : 'Change Password'}
                </button>
              </form>

              <button
                onClick={() => { setStep(1); setError(''); setCode(''); setPassword(''); setConfirm(''); }}
                style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '.82rem', cursor: 'pointer', width: '100%', textAlign: 'center' }}
              >
                ← Use a different email
              </button>
            </>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--accent-green)', display: 'flex', justifyContent: 'center' }}>
                <CheckCircle size={52} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Password changed!</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 28 }}>
                Your password has been updated successfully. Sign in with your new password.
              </p>
              <Link to="/login">
                <button className="btn btn-primary btn-full btn-lg">Go to Sign In</button>
              </Link>
            </div>
          )}

          {step !== 3 && (
            <p className="auth-footer-text" style={{ marginTop: 28 }}>
              <Link to="/login" style={{ color: '#6B7280', fontSize: '.85rem' }}>← Back to Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
