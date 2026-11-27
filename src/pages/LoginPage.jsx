import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { useAuth } from '../app/AuthProvider.jsx';
import ConstellationBg from '../components/ui/ConstellationBg.jsx';
import ThemeMoodToggle from '../components/ui/ThemeMoodToggle.jsx';
import { DEMO_ACCOUNT } from '../data/demoAccount.js';

export default function LoginPage() {
  const [nim, setNim] = useState(DEMO_ACCOUNT.nim);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/app';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ nim, password, remember });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal masuk ke sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ConstellationBg />

      <div className="auth-layout">
      <div className="auth-topbar">
        <ThemeMoodToggle />
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">S</div>
          <div>
            <h1 className="auth-title">Masuk ke SILINCAH</h1>
            <p className="auth-subtitle">Sistem Informasi Akademik STMIK Tazkia</p>
          </div>
        </div>

        <div className="demo-box">
          <div>
            <strong>Akun Demo Prototipe:</strong>
            <div style={{ color: 'var(--text-muted)' }}>
              NIM: <code>{DEMO_ACCOUNT.nim}</code> · Sandi: <code>{DEMO_ACCOUNT.password}</code>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ minHeight: 34, padding: '4px 10px', fontSize: '0.8rem' }}
            onClick={() => {
              setNim(DEMO_ACCOUNT.nim);
              setPassword(DEMO_ACCOUNT.password);
            }}
          >
            Isi Otomatis
          </button>
        </div>

        {error && <div className="alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="nim">Nomor Induk Mahasiswa (NIM)</label>
            <input
              id="nim"
              type="text"
              className="form-input"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 20260001"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Kata Sandi</label>
            <div className="input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: 42 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Ingat sesi saya</span>
            </label>
            <Link to="/lupa-password" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Lupa kata sandi?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Portal'}</span>
          </button>
        </form>
      </div>
      </div>
    </>
  );
}
