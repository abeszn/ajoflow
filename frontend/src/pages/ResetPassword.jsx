import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { KeyRound, CheckCircle } from 'lucide-react';
import API from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { document.title = 'Reset Password | AjoFlow'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or has expired.');
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
          {!done ? (
            <>
              <div style={{ marginBottom: 16, color: 'var(--text-3)' }}><KeyRound size={44} strokeWidth={1.4} /></div>
              <h2 className="auth-form-title">Set new password</h2>
              <p className="auth-form-subtitle">Your new password must be at least 6 characters.</p>

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
                  {loading ? <><div className="spinner" /> Resetting…</> : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, color: 'var(--accent-green)' }}><CheckCircle size={52} strokeWidth={1.4} /></div>
              <h2 className="auth-form-title">Password reset!</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '.9rem', marginBottom: 8 }}>
                Your password has been updated. Redirecting you to sign in…
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
