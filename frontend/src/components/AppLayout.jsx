import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const PAGES = {
  '/dashboard':    { title: 'Dashboard',     subtitle: (name) => `Good ${greet()}, ${name}` },
  '/groups':       { title: 'My Groups',     subtitle: () => 'Browse and manage your savings circles' },
  '/contributions':{ title: 'Contributions', subtitle: () => 'Record and track every payment you make' },
  '/payouts':      { title: 'Payouts',       subtitle: () => 'Full payment history across all your groups' },
  '/reports':      { title: 'Reports',       subtitle: () => 'Analytics and insights on your savings' },
  '/settings':     { title: 'Settings',      subtitle: () => 'Manage your account and preferences' },
};

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const page = PAGES[location.pathname] || { title: 'AjoFlow', subtitle: () => '' };

  useEffect(() => {
    document.title = `${page.title} | AjoFlow`;
  }, [page.title]);
  const firstName = user?.name?.split(' ')[0] || 'there';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} strokeWidth={1.75} />
            </button>
            <div className="topbar-left">
              <div className="topbar-page-title">{page.title}</div>
              <div className="topbar-subtitle">{page.subtitle(firstName)}</div>
            </div>
          </div>

          <div className="topbar-right">
            <ThemeToggle />
            <div
              className="topbar-avatar"
              onClick={() => navigate('/settings')}
              title="Go to Settings"
              style={{ cursor: 'pointer' }}
            >{initials}</div>
          </div>
        </header>

        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}
