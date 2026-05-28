import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = 'Create Account | AjoFlow'; }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <h1>Building a community<br />that saves together.</h1>
            <p style={{ marginBottom: 36 }}>
              AjoFlow is where trust meets technology. Join a circle of savers, contribute consistently,
              and watch your community grow stronger — one cycle at a time.
            </p>
            <div className="auth-steps">
              <div className="auth-step"><div className="step-num">1</div><div className="step-text">Create your free account</div></div>
              <div className="auth-step"><div className="step-num">2</div><div className="step-text">Join or start a savings circle</div></div>
              <div className="auth-step"><div className="step-num">3</div><div className="step-text">Grow together with your community</div></div>
            </div>
          </div>
          <div />
        </div>
      </div>

      <div className="auth-right">
        <ThemeToggle className="auth-theme-btn" />
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-subtitle">Free forever. No credit card required.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group mb-0">
                <label className="form-label">First Name <span style={{ color: '#DC2626' }}>*</span></label>
                <input className="form-input" type="text" name="firstName" placeholder="Femi" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Last Name <span style={{ color: '#DC2626' }}>*</span></label>
                <input className="form-input" type="text" name="lastName" placeholder="Timi" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Email Address <span style={{ color: '#DC2626' }}>*</span></label>
              <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Phone Number
                <span style={{ fontSize: '.72rem', color: 'var(--text-3)', fontWeight: 400 }}>Optional</span>
              </label>
              <input className="form-input" type="tel" name="phone" placeholder="+234 801 234 5678" value={form.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span style={{ color: '#DC2626' }}>*</span></label>
              <PasswordInput
                name="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">I Am A</label>
              <div className="role-toggle">
                <button type="button" className={`role-btn ${form.role === 'member' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'member' })}>Member</button>
                <button type="button" className={`role-btn ${form.role === 'admin'  ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'admin'  })}>Group Admin</button>
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" /> Creating account…</> : 'Create Free Account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
