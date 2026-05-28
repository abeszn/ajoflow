import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, MailCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';

export default function ForgotPassword() {
  const [step, setStep]       = useState(1); // 1 = enter email, 2 = check inbox
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { document.title = 'Forgot Password | AjoFlow'; }, []);

  const handleSendLink = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (sbError) throw sbError;
      setStep(2);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
              <p className="auth-form-subtitle">
                Enter your email and we'll send a secure reset link.
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSendLink}>
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
          )}

          {/* ── Step 2: Check inbox ── */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--accent-green)', display: 'flex', justifyContent: 'center' }}>
                <MailCheck size={52} strokeWidth={1.4} />
              </div>
              <h2 className="auth-form-title">Check your inbox</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '.9rem', lineHeight: 1.75, marginBottom: 8 }}>
                A password reset link was sent to
              </p>
              <p style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '.95rem', marginBottom: 20, wordBreak: 'break-all' }}>
                {email}
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: '.82rem', lineHeight: 1.7, marginBottom: 28 }}>
                Click the link in the email to create a new password.
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
              <button
                className="btn btn-ghost btn-full"
                onClick={() => { setStep(1); setError(''); }}
              >
                ← Try a different email
              </button>
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
