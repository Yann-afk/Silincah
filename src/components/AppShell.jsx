import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  CircleDot,
  LogOut,
  Menu,
  Mouse,
  MousePointer2,
  PanelBottom,
  Sparkles,
  X,
} from 'lucide-react';

import { useAuth } from '../app/AuthProvider.jsx';
import { useCustomCursor } from './ui/CustomCursor.jsx';
import AnimatedTabDock from './ui/AnimatedTabDock.jsx';
import ConstellationBg, { bacaPreferensiBg, simpanPreferensiBg } from './ui/ConstellationBg.jsx';
import ThemeMoodToggle from './ui/ThemeMoodToggle.jsx';
import { getBreadcrumbs, getPageMeta, mainNavigation } from '../data/navigation.js';
import './layout/AppShell.css';

const IKON_GAYA_KURSOR = { 'ring-dot': CircleDot, 'arrow-pointer': MousePointer2, system: Mouse };
const KUNCI_DOCK_BAWAH = 'silincah.dockBawah';
const KUERI_SELULER = '(max-width: 768px)';

function bacaPreferensiDock() {
  try {
    const nilai = window.localStorage.getItem(KUNCI_DOCK_BAWAH);
    return nilai === 'aktif' || nilai === 'nonaktif' ? nilai : null;
  } catch {
    // localStorage bisa diblokir; fallback ke perilaku otomatis per lebar layar.
    return null;
  }
}

function simpanPreferensiDock(nilai) {
  try {
    window.localStorage.setItem(KUNCI_DOCK_BAWAH, nilai);
  } catch {
    // Preferensi tetap berlaku untuk sesi ini meski penyimpanan gagal.
  }
}

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preferensiDock, setPreferensiDock] = useState(bacaPreferensiDock);
  const [bgAktif, setBgAktif] = useState(bacaPreferensiBg);
  const [layarSeluler, setLayarSeluler] = useState(
    () => window.matchMedia(KUERI_SELULER).matches,
  );
  const { session, logout } = useAuth();
  const { preferensi: gayaKursor, lanjut: lanjutGayaKursor, opsi: opsiKursor, didukung: kursorDidukung } =
    useCustomCursor();
  const location = useLocation();
  const navigate = useNavigate();

  const indeksKursor = Math.max(
    0,
    opsiKursor.findIndex((opsi) => opsi.id === gayaKursor),
  );
  const opsiKursorAktif = opsiKursor[indeksKursor];
  const opsiKursorBerikut = opsiKursor[(indeksKursor + 1) % opsiKursor.length];
  const IkonKursor = IKON_GAYA_KURSOR[opsiKursorAktif.id] ?? CircleDot;

  const meta = getPageMeta(location.pathname);
  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Dock bawah aktif otomatis di layar seluler; di desktop mengikuti pilihan pengguna.
  const dockAktif = preferensiDock ? preferensiDock === 'aktif' : layarSeluler;

  useEffect(() => {
    const media = window.matchMedia(KUERI_SELULER);
    const perbarui = (event) => setLayarSeluler(event.matches);

    media.addEventListener('change', perbarui);
    return () => media.removeEventListener('change', perbarui);
  }, []);

  function toggleDock() {
    const berikut = dockAktif ? 'nonaktif' : 'aktif';
    setPreferensiDock(berikut);
    simpanPreferensiDock(berikut);
  }

  function toggleBgAnimasi() {
    setBgAktif((sebelumnya) => {
      const berikut = !sebelumnya;
      simpanPreferensiBg(berikut);
      return berikut;
    });
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <ConstellationBg aktif={bgAktif} />

      <div className={`shell ${dockAktif ? 'has-tab-dock' : ''}`}>
      <div
        className={`mobile-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`} aria-label="Navigasi Utama">
        <div className="sidebar-brand" style={{ justifyContent: 'space-between' }}>
          <Link
            to="/app"
            className="sidebar-brand-link"
            onClick={() => setDrawerOpen(false)}
            aria-label="SILINCAH — kembali ke Dashboard"
          >
            <span className="auth-logo" style={{ width: 36, height: 36, fontSize: '1rem' }}>
              S
            </span>
            <span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block' }}>SILINCAH</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                Portal Mahasiswa
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="btn btn-ghost mobile-menu-btn"
            style={{ minHeight: 36, padding: 6 }}
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.kind === 'dashboard'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setDrawerOpen(false)}
              >
                <span className="nav-item-left">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </span>
                {item.count ? <span className="nav-count">{item.count}</span> : null}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
          <div style={{ padding: '0 8px 12px', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600 }}>{session?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>NIM {session?.nim}</div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)' }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn btn-ghost mobile-menu-btn"
              style={{ padding: '8px 10px' }}
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {meta.eyebrow}
              </div>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{meta.title}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <ThemeMoodToggle />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={lanjutGayaKursor}
              disabled={!kursorDidukung}
              aria-label={`Gaya kursor: ${opsiKursorAktif.label}. Klik untuk ganti ke ${opsiKursorBerikut.label}.`}
              title={
                kursorDidukung
                  ? `Gaya kursor: ${opsiKursorAktif.label} — klik untuk ganti`
                  : 'Kursor kustom tidak tersedia di perangkat ini'
              }
            >
              <IkonKursor size={18} />
              <span className="topbar-action-label" style={{ fontSize: '0.85rem' }}>
                {opsiKursorAktif.label}
              </span>
            </button>
            <button
              type="button"
              className={`btn btn-ghost constellation-toggle ${bgAktif ? 'is-active' : ''}`}
              onClick={toggleBgAnimasi}
              aria-pressed={bgAktif}
              aria-label={
                bgAktif ? 'Matikan animasi latar' : 'Nyalakan animasi latar'
              }
              title={
                bgAktif
                  ? 'Matikan animasi latar'
                  : 'Nyalakan animasi latar jaringan titik'
              }
            >
              <Sparkles size={18} />
            </button>
            <button
              type="button"
              className={`btn btn-ghost tab-dock-toggle ${dockAktif ? 'is-active' : ''}`}
              onClick={toggleDock}
              aria-pressed={dockAktif}
              aria-label={dockAktif ? 'Sembunyikan navigasi bawah' : 'Tampilkan navigasi bawah'}
              title={
                dockAktif
                  ? 'Sembunyikan navigasi bawah'
                  : 'Tampilkan navigasi bawah (pintasan cepat)'
              }
            >
              <PanelBottom size={18} />
            </button>
          </div>
        </header>

        <main className="content-wrap">
          {breadcrumbs.length > 1 && (
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {idx > 0 && <span>/</span>}
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <strong>{crumb.label}</strong>}
                </span>
              ))}
            </nav>
          )}
          <Outlet />
        </main>
      </div>

      {dockAktif ? <AnimatedTabDock /> : null}
      </div>
    </>
  );
}
