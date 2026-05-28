import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, LogIn, SearchX } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'var(--bg)',
      textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{ color: 'var(--text-3)', opacity: 0.3, marginBottom: 24 }}>
        <SearchX size={80} strokeWidth={1.1} />
      </div>

      {/* Number */}
      <div style={{
        fontSize: 'clamp(5rem, 20vw, 8rem)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'var(--text-1)',
        letterSpacing: '-0.05em',
        marginBottom: 12,
      }}>
        404
      </div>

      {/* Heading */}
      <h2 style={{
        fontSize: '1.4rem',
        fontWeight: 700,
        color: 'var(--text-1)',
        marginBottom: 12,
      }}>
        Page not found
      </h2>

      {/* Subtext */}
      <p style={{
        color: 'var(--text-2)',
        fontSize: '.92rem',
        lineHeight: 1.75,
        maxWidth: 380,
        marginBottom: 40,
      }}>
        The page you're looking for doesn't exist or has been moved.
        Check the URL, or use one of the options below.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Go Back
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Home size={16} strokeWidth={2} />
          Home
        </button>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/login')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <LogIn size={16} strokeWidth={2} />
          Sign In
        </button>
      </div>
    </div>
  );
}
