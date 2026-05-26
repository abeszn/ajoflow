import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/dashboard' },
  { icon: Users,           label: 'My Groups',     path: '/groups' },
  { icon: CreditCard,      label: 'Contributions', path: '/contributions' },
  { icon: Wallet,          label: 'Payouts',       path: '/payouts' },
  { icon: BarChart3,       label: 'Reports',       path: '/reports' },
  { icon: Settings,        label: 'Settings',      path: '/settings' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const go = (path) => { navigate(path); onClose?.(); };
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div style={{ height: 4, background: '#3DDC84', flexShrink: 0 }} />

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-box">A</div>
          <span className="logo-name">AjoFlow</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
              onClick={() => go(path)}
            >
              <Icon size={17} strokeWidth={1.75} className="nav-icon" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-divider" />
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div className="sidebar-user-role">{user?.role || 'member'}</div>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ color: 'rgba(255,100,100,.8)', marginTop: 4 }}
          >
            <LogOut size={17} strokeWidth={1.75} className="nav-icon" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
