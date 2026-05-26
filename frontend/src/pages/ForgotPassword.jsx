import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, MailOpen } from 'lucide-react';
import API from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Forgot Password | AjoFlow'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          {!sent ? (
            <>
              <div style={{ marginBottom: 16, color: 'var(--text-3)' }}><Lock size={44} strokeWidth={1.4} /></div>
              <h2 className="auth-form-title">Forgot password?</h2>
              <p className="auth-form-subtitle">
                No worries — enter your email and we'll send you a reset link.
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
                <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                  {loading ? <><div className="spinner" /> Sending…</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--accent-green)' }}><MailOpen size={48} strokeWidth={1.4} /></div>
              <h2 className="auth-form-title">Check your email</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 28 }}>
                If <strong>{email}</strong> is registered with AjoFlow, you'll receive a password reset link shortly.
                The link expires in <strong>15 minutes</strong>.
              </p>
              <p style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>
                Didn't get it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  style={{ background: 'none', border: 'none', color: '#16A34A', fontWeight: 600, cursor: 'pointer', fontSize: '.82rem' }}
                >
                  try again
                </button>.
              </p>
            </div>
          )}

          <p className="auth-footer-text" style={{ marginTop: 28 }}>
            <Link to="/login" style={{ color: '#6B7280', fontSize: '.85rem' }}>← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
