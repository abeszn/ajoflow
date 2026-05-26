import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, BarChart3, Bell, ShieldCheck, Banknote,
  UserPlus, TrendingUp, ArrowRight, CheckCircle, Menu, X
} from 'lucide-react';

const FEATURES = [
  { icon: Users,       title: 'Savings Circles',     desc: 'Create or join a group in minutes. Set contribution amounts and frequency to fit your community.' },
  { icon: Calendar,    title: 'Flexible Schedules',   desc: 'Daily, weekly, or monthly cycles. Ajo adapts to how your group likes to save.' },
  { icon: BarChart3,   title: 'Live Dashboard',       desc: 'Track your contribution history, group progress, and upcoming payments in real time.' },
  { icon: Bell,        title: 'Missed Payment Alerts',desc: 'Automated tracking flags missed payments instantly so no member falls behind unnoticed.' },
  { icon: ShieldCheck, title: 'Secure by Design',     desc: 'JWT-authenticated sessions, encrypted data, and admin-controlled group settings keep your money safe.' },
  { icon: Banknote,    title: 'Transparent Records',  desc: 'Every contribution logged with paid, pending, and missed statuses — full accountability for all members.' },
];

const STEPS = [
  { n: '01', icon: UserPlus,   title: 'Create an Account',   desc: 'Sign up free in under a minute. No credit card needed.' },
  { n: '02', icon: Users,      title: 'Start or Join a Group', desc: 'Set up your own savings circle or accept an invitation to join one.' },
  { n: '03', icon: TrendingUp, title: 'Contribute & Grow',   desc: 'Make regular contributions and watch your collective savings grow.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);

  useEffect(() => {
    document.title = 'AjoFlow | Save Together, Thrive Together';
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-box">A</div>
            <span className="lp-logo-name">AjoFlow</span>
          </div>

          {/* desktop links */}
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how"      className="lp-nav-link">How It Works</a>
          </div>

          <div className="lp-nav-actions">
            <button className="lp-btn lp-btn--ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="lp-btn lp-btn--accent" onClick={() => navigate('/register')}>Get Started</button>
          </div>

          {/* hamburger */}
          <button className="lp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* mobile drawer */}
        {menuOpen && (
          <div className="lp-mobile-menu">
            <a href="#features" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how"      className="lp-mobile-link" onClick={() => setMenuOpen(false)}>How It Works</a>
            <button className="lp-btn lp-btn--ghost   lp-btn--full" onClick={() => navigate('/login')}>Sign In</button>
            <button className="lp-btn lp-btn--accent  lp-btn--full" onClick={() => navigate('/register')}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-tag">
              <span className="lp-tag-dot" />
              Built for Nigerian cooperatives
            </div>
            <h1 className="lp-hero-h1">
              The smarter way<br />
              to save <span className="lp-hero-accent">together</span>.
            </h1>
            <p className="lp-hero-sub">
              AjoFlow digitalises the age-old Ajo &amp; Esusu tradition —
              so your savings circle runs smoothly, transparently, and on time.
            </p>
            <div className="lp-hero-cta">
              <button className="lp-btn lp-btn--accent lp-btn--lg" onClick={() => navigate('/register')}>
                Start Saving Free <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <button className="lp-btn lp-btn--outline-light lp-btn--lg" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
            <div className="lp-hero-checks">
              {['No credit card required', 'Free for small groups', 'Set up in 60 seconds'].map(t => (
                <span key={t} className="lp-check-item">
                  <CheckCircle size={14} strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mock app preview */}
          <div className="lp-hero-visual">
            <div className="lp-mock">
              <div className="lp-mock-bar" />
              <div className="lp-mock-head">
                <div className="lp-mock-logo">A</div>
                <span>My Groups</span>
              </div>
              {[
                { name: 'Market Women Circle', amount: '₦5,000', freq: 'Monthly', pct: 72, members: 8, color: '#16A34A' },
                { name: 'Tech Bros Ajo',        amount: '₦10,000', freq: 'Weekly', pct: 45, members: 5, color: '#2563EB' },
                { name: 'Family Esusu',          amount: '₦2,500', freq: 'Monthly', pct: 90, members: 12, color: '#7C3AED' },
              ].map(g => (
                <div key={g.name} className="lp-mock-card">
                  <div className="lp-mc-bar" style={{ background: g.color }} />
                  <div className="lp-mc-body">
                    <div className="lp-mc-row">
                      <span className="lp-mc-name">{g.name}</span>
                      <span className="lp-mc-amt">{g.amount}</span>
                    </div>
                    <div className="lp-mc-meta">
                      <Users size={11} />{g.members} members &nbsp;·&nbsp;
                      <Calendar size={11} />{g.freq}
                    </div>
                    <div className="lp-mc-track">
                      <div className="lp-mc-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                    </div>
                    <div className="lp-mc-pct">{g.pct}% contributed this cycle</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────────────── */}
      <div className="lp-trust">
        {[
          { v: 'Free',            l: 'Forever for small groups' },
          { v: 'Real-time',       l: 'Contribution tracking' },
          { v: 'Admin controls',  l: 'Approve & manage payouts' },
          { v: 'Secure',          l: 'JWT-authenticated sessions' },
        ].map(({ v, l }) => (
          <div key={v} className="lp-trust-item">
            <span className="lp-trust-v">{v}</span>
            <span className="lp-trust-l">{l}</span>
          </div>
        ))}
      </div>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-head">
            <span className="lp-section-tag">Features</span>
            <h2 className="lp-section-h2">Everything your savings circle needs</h2>
            <p className="lp-section-sub">Built for communities. Powered by trust. Secured by technology.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="lp-feat-card">
                <div className="lp-feat-icon"><Icon size={24} strokeWidth={1.7} /></div>
                <h3 className="lp-feat-title">{title}</h3>
                <p className="lp-feat-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="lp-section lp-section--tinted" id="how">
        <div className="lp-section-inner">
          <div className="lp-section-head">
            <span className="lp-section-tag">How It Works</span>
            <h2 className="lp-section-h2">Three steps to your first savings circle</h2>
          </div>
          <div className="lp-steps">
            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div key={n} className="lp-step">
                {i < STEPS.length - 1 && <div className="lp-step-connector" />}
                <div className="lp-step-icon-wrap">
                  <Icon size={28} strokeWidth={1.6} />
                </div>
                <div className="lp-step-num">{n}</div>
                <h3 className="lp-step-title">{title}</h3>
                <p className="lp-step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-h2">Ready to start saving together?</h2>
          <p className="lp-cta-sub">Join your first savings circle today — free, fast, and built on trust.</p>
          <div className="lp-cta-actions">
            <button className="lp-btn lp-btn--accent lp-btn--lg" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <button className="lp-btn lp-btn--outline-light lp-btn--lg" onClick={() => navigate('/login')}>
              I already have an account
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo">
              <div className="lp-logo-box">A</div>
              <span className="lp-logo-name">AjoFlow</span>
            </div>
            <p className="lp-footer-tagline">Digitalising cooperative savings across Nigeria.</p>
          </div>
          <div className="lp-footer-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <button className="lp-footer-link-btn" onClick={() => navigate('/login')}>Sign In</button>
            <button className="lp-footer-link-btn" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} AjoFlow. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
