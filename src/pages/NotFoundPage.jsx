import { Link } from 'react-router-dom';

export default function NotFoundPage({ embedded = false }) {
  return (
    <div className={embedded ? '' : 'auth-layout'}>
      <div className="card" style={{ maxWidth: 440, textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Halaman Tidak Ditemukan (404)</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Tautan yang Anda buka tidak tersedia pada prototipe SILINCAH ini.
        </p>
        <Link to="/app" className="btn btn-primary">Kembali ke Beranda</Link>
      </div>
    </div>
  );
}
