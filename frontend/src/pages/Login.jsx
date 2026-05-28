import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Users, Banknote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ThemeToggle from '../components/ThemeToggle';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = 'Sign In | AjoFlow'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    form.email.trim(),
        password: form.password,
      });
      if (authError) throw authError;
      // AuthContext onAuthStateChange → SIGNED_IN → loads MongoDB profile
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
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
            <p style={{ marginBottom: 40 }}>Digitising Ajo &amp; Esusu for modern cooperatives across Nigeria.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
              {[
                { icon: Users,       text: 'Create or join a savings circle in minutes' },
                { icon: Banknote,    text: 'Track every contribution — nothing gets lost' },
                { icon: ShieldCheck, text: 'Your data is private and yours alone' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(61,220,132,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color="#3DDC84" strokeWidth={2} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,.75)', fontSize: '.88rem', lineHeight: 1.45 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div />
        </div>
      </div>

      <div className="auth-right">
        <ThemeToggle className="auth-theme-btn" />
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Sign in to your AjoFlow account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Password</label>
              <PasswordInput
                placeholder="••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: '.82rem', color: '#6B7280' }}>Forgot password?</Link>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
