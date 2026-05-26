import AppLayout from '../components/AppLayout';

export default function ComingSoon({ icon, title, description }) {
  return (
    <AppLayout>
      <div className="coming-soon">
        <div className="coming-soon-icon">{icon}</div>
        <h2>{title}</h2>
        <p>{description}</p>
        <span className="badge badge-pending" style={{ marginTop: 8, padding: '6px 16px', fontSize: '.8rem' }}>
          Coming Soon
        </span>
      </div>
    </AppLayout>
  );
}
