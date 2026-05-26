import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BarChart3, Bell, ShieldCheck, Banknote, UserPlus, TrendingUp, Globe2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'AjoFlow | Save Together, Thrive Together'; }, []);

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="logo">
          <div className="logo-box">A</div>
          <span className="logo-name">Ajo</span>
        </div>
        <div className="landing-nav-links">
          <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,.8)', borderColor: 'rgba(255,255,255,.2)' }} onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Globe2 size={14} strokeWidth={2} />
            Trusted by thousands across West Africa
          </div>
          <h1>
            Save Together,<br />
            <span>Thrive Together</span>
          </h1>
          <p>
            Ajo is a modern rotating savings platform built on the trusted tradition of cooperative savings.
            Join groups, contribute regularly, and grow your wealth together.
          </p>
          <div className="hero-cta">
            <button className="btn btn-accent btn-lg" onClick={() => navigate('/register')}>
              Start Saving Free
            </button>
            <button
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.25)' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="hero-visual">
          <div className="floating-card">
            <div className="fc-label">Total Savings Pool</div>
            <div className="fc-value">₦4.2M+</div>
            <div className="fc-sub">Across all active groups</div>
          </div>
          <div className="floating-card">
            <div className="fc-label">Active Groups</div>
            <div className="fc-value">320+</div>
            <div className="fc-sub">Running this month</div>
          </div>
          <div className="floating-card">
            <div className="fc-label">Members Saving</div>
            <div className="fc-value">1,800+</div>
            <div className="fc-sub">And growing daily</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="section-header">
          <span className="section-tag">Why Ajo</span>
          <h2>Everything you need to save smarter</h2>
          <p>Built for communities, powered by trust, secured by technology.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="f-icon"><Users size={28} strokeWidth={1.6} /></div>
            <h3>Create or Join Groups</h3>
            <p>Start your own savings circle or join an existing one. Set the amount and frequency that works for your community.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon"><Calendar size={28} strokeWidth={1.6} /></div>
            <h3>Flexible Schedules</h3>
            <p>Choose daily, weekly, or monthly contribution cycles. Ajo adapts to your lifestyle, not the other way around.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon"><BarChart3 size={28} strokeWidth={1.6} /></div>
            <h3>Track Everything</h3>
            <p>Real-time dashboard showing your savings progress, group activity, contribution history, and upcoming payments.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon"><Bell size={28} strokeWidth={1.6} /></div>
            <h3>Missed Payment Alerts</h3>
            <p>Automated reminders and missed payment tracking keep every member accountable and your group healthy.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon"><ShieldCheck size={28} strokeWidth={1.6} /></div>
            <h3>Secure & Private</h3>
            <p>Bank-grade JWT authentication protects your data. Your savings information is always encrypted and safe.</p>
          </div>
          <div className="feature-card">
            <div className="f-icon"><Banknote size={28} strokeWidth={1.6} /></div>
            <h3>Transparent History</h3>
            <p>Full contribution history with paid, pending, and missed statuses so every member stays on the same page.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 6%', background: 'var(--gray-50)' }}>
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2>Three simple steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, maxWidth: 860, margin: '0 auto' }}>
          {[
            { step: '01', icon: <UserPlus size={36} strokeWidth={1.5} />, title: 'Create an Account', desc: 'Sign up in under 60 seconds. No credit card required.' },
            { step: '02', icon: <Users size={36} strokeWidth={1.5} />,    title: 'Join a Group',      desc: 'Browse open groups or create your own savings circle.' },
            { step: '03', icon: <TrendingUp size={36} strokeWidth={1.5} />, title: 'Contribute & Grow', desc: 'Make regular contributions and watch your savings grow.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--primary-light)', letterSpacing: '.1em', marginBottom: 12 }}>{step}</div>
              <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center', opacity: .75 }}>{icon}</div>
              <h3 style={{ marginBottom: 8 }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to start your savings journey?</h2>
        <p>Join thousands of people already saving smarter with Ajo.</p>
        <div className="cta-buttons">
          <button className="btn btn-accent btn-lg" onClick={() => navigate('/register')}>
            Create Free Account
          </button>
          <button
            className="btn btn-lg"
            style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.25)' }}
            onClick={() => navigate('/login')}
          >
            Sign In Instead
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Ajo Savings Platform. Built with ❤️ for communities.</p>
      </footer>
    </div>
  );
}
