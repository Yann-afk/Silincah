import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import ConstellationBg from '../components/ui/ConstellationBg.jsx';
import ThemeMoodToggle from '../components/ui/ThemeMoodToggle.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <ConstellationBg />

      <div className="auth-layout">
      <div className="auth-topbar">
        <ThemeMoodToggle />
      </div>

      <div className="auth-card">
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Halaman Masuk</span>
        </Link>

        <h1 className="auth-title">Pemulihan Kata Sandi</h1>
        <p className="auth-subtitle" style={{ marginBottom: 20 }}>
          Masukkan email kampus Anda untuk menerima tautan pengaturan ulang kata sandi.
        </p>

        {sent ? (
          <div className="demo-box" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--primary)' }}>
              <CheckCircle2 size={18} />
              <span>Tautan Pemulihan Terkirim (Simulasi)</span>
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>
              Instruksi reset kata sandi telah dikirim ke <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">Email Kampus / Terdaftar</label>
              <input
                id="reset-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@student.tazkia.ac.id"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Kirim Tautan Pemulihan
            </button>
          </form>
        )}
      </div>
      </div>
    </>
  );
}
