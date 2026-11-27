import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, ClipboardCheck, ListChecks, Upload } from 'lucide-react';
import './AnimatedTabDock.css';

/**
 * 5 pintasan harian utama pada navbar bawah.
 * Slug rute dicocokkan dengan `src/data/navigation.js`:
 *   - presensi → fitur 'presensi' (kategori Akademik)
 *   - jadwal   → fitur 'jadwal'   (kategori Akademik)
 *   - tugas    → fitur 'tugas'    (kategori Tugas & Ujian)
 *   - tenggat  → fitur 'tenggat'  (legacy: Deliverable & Tenggat)
 *   - materi   → fitur 'materi'   (kategori Akademik)
 */
export const TAB_DOCK_ITEMS = [
  {
    label: 'Presensi',
    to: '/app/fitur/presensi',
    icon: ClipboardCheck,
    description: 'Rekap kehadiran dan check-in',
  },
  {
    label: 'Jadwal',
    to: '/app/fitur/jadwal',
    icon: CalendarDays,
    description: 'Jadwal kuliah hari ini',
  },
  {
    label: 'Kumpul Tugas',
    to: '/app/fitur/tugas',
    icon: Upload,
    description: 'Kumpulkan dan unggah tugas',
  },
  {
    label: 'Daftar Tugas',
    to: '/app/fitur/tenggat',
    icon: ListChecks,
    description: 'Daftar tugas dan tenggat',
  },
  {
    label: 'Materi',
    to: '/app/fitur/materi',
    icon: BookOpen,
    description: 'Materi kuliah terbaru',
  },
];

const JUMLAH_ITEM = TAB_DOCK_ITEMS.length;
const KECEPATAN_LEMBUT = 0.22;
const AMBANG_HENTI = 0.4;

/**
 * Membuat jalur SVG untuk permukaan dock: persegi penuh dengan takik
 * melengkung halus di posisi item aktif. Dipakai sebagai `clip-path: path()`
 * sekaligus outline agar tepi lengkung tetap terlihat di semua tema.
 * Saat tidak ada item aktif (mis. pengguna berada di Dashboard), permukaan
 * dibuat rata tanpa takik.
 */
function buatJalurLengkung(lebar, tinggi, pusat, aktif = true) {
  if (!Number.isFinite(lebar) || !Number.isFinite(tinggi) || lebar <= 0 || tinggi <= 0) {
    return '';
  }

  // Lebar takik dibatasi agar tetap rapi di layar sempit (<=480px).
  const setengah = aktif ? Math.min(46, (lebar / JUMLAH_ITEM) * 0.46) : 0;
  const kedalaman = Math.min(32, tinggi * 0.46);
  const kiri = Math.max(0, pusat - setengah);
  const kanan = Math.min(lebar, pusat + setengah);
  const langkah = 16;

  let jalur = `M0 0 L${kiri.toFixed(2)} 0`;

  if (setengah > 0) {
    for (let i = 1; i <= langkah; i += 1) {
      const x = kiri + ((kanan - kiri) * i) / langkah;
      const t = (x - pusat) / setengah;
      const lipatan = Math.cos((Math.PI / 2) * Math.min(1, Math.abs(t)));
      const y = kedalaman * lipatan * lipatan;
      jalur += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }

  jalur += ` L${lebar.toFixed(2)} 0 L${lebar.toFixed(2)} ${tinggi.toFixed(2)} L0 ${tinggi.toFixed(2)} Z`;
  return jalur;
}

function cocokRute(pathname, to) {
  if (to === '/app') {
    return pathname === '/app' || pathname === '/app/';
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function AnimatedTabDock() {
  const location = useLocation();
  const navigate = useNavigate();

  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const permukaanRef = useRef(null);
  const garisRef = useRef(null);
  const indikatorRef = useRef(null);

  const ukuranRef = useRef({ lebar: 0, tinggi: 0 });
  const targetRef = useRef(0);
  const posisiRef = useRef(0);
  const frameRef = useRef(0);
  const sudahUkurRef = useRef(false);
  const kurangiGerakRef = useRef(false);

  // -1 berarti tidak ada pintasan dock yang sedang aktif.
  const indeksAktif = useMemo(() => {
    const ditemukan = TAB_DOCK_ITEMS.findIndex((item) => cocokRute(location.pathname, item.to));
    return ditemukan;
  }, [location.pathname]);

  const indeksAktifRef = useRef(indeksAktif);
  indeksAktifRef.current = indeksAktif;

  const gambar = useCallback((pusat) => {
    const { lebar, tinggi } = ukuranRef.current;
    const jalur = buatJalurLengkung(lebar, tinggi, pusat, indeksAktifRef.current >= 0);
    if (!jalur) return;

    if (permukaanRef.current) {
      permukaanRef.current.style.clipPath = `path("${jalur}")`;
    }
    garisRef.current?.setAttribute('d', jalur);
    if (indikatorRef.current) {
      indikatorRef.current.style.transform = `translate3d(${pusat.toFixed(2)}px, 0, 0)`;
    }
  }, []);

  const jalankanAnimasi = useCallback(() => {
    if (kurangiGerakRef.current) {
      posisiRef.current = targetRef.current;
      gambar(posisiRef.current);
      return;
    }

    if (frameRef.current) return;

    const langkah = () => {
      const selisih = targetRef.current - posisiRef.current;
      if (Math.abs(selisih) <= AMBANG_HENTI) {
        posisiRef.current = targetRef.current;
        gambar(posisiRef.current);
        frameRef.current = 0;
        return;
      }
      posisiRef.current += selisih * KECEPATAN_LEMBUT;
      gambar(posisiRef.current);
      frameRef.current = requestAnimationFrame(langkah);
    };

    frameRef.current = requestAnimationFrame(langkah);
  }, [gambar]);

  const ukur = useCallback(
    (lompat = false) => {
      const nav = navRef.current;
      if (!nav) return;

      const kotakNav = nav.getBoundingClientRect();
      ukuranRef.current = { lebar: kotakNav.width, tinggi: kotakNav.height };

      const item = indeksAktif >= 0 ? itemRefs.current[indeksAktif] : null;

      if (!item) {
        // Tidak ada pintasan dock yang aktif (mis. di Dashboard): permukaan
        // kembali rata tanpa takik dan indikator disembunyikan.
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
        targetRef.current = 0;
        posisiRef.current = 0;
        sudahUkurRef.current = true;
        gambar(0);
        return;
      }

      const kotakItem = item.getBoundingClientRect();
      targetRef.current = kotakItem.left - kotakNav.left + kotakItem.width / 2;

      if (lompat || !sudahUkurRef.current || kurangiGerakRef.current) {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
        posisiRef.current = targetRef.current;
        sudahUkurRef.current = true;
        gambar(posisiRef.current);
        return;
      }

      jalankanAnimasi();
    },
    [gambar, indeksAktif, jalankanAnimasi],
  );

  // Ukur tepat sebelum browser melukis agar kurva tidak "meloncat" dari x=0.
  // Efek ini juga berjalan ulang setiap rute mengubah item aktif.
  useLayoutEffect(() => {
    ukur(false);
  }, [ukur]);

  // Sinkron saat ukuran dock berubah (rotasi layar, sidebar, dsb).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return undefined;

    const pengamat = new ResizeObserver(() => ukur(false));
    pengamat.observe(nav);
    return () => pengamat.disconnect();
  }, [ukur]);

  // Fallback untuk peramban tanpa ResizeObserver / perubahan viewport.
  useEffect(() => {
    const tangani = () => ukur(false);
    window.addEventListener('resize', tangani);
    window.addEventListener('orientationchange', tangani);
    return () => {
      window.removeEventListener('resize', tangani);
      window.removeEventListener('orientationchange', tangani);
    };
  }, [ukur]);

  // Hormati preferensi reduced motion: kurva langsung pindah tanpa animasi.
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const perbarui = () => {
      kurangiGerakRef.current = media.matches;
      if (media.matches) {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
        posisiRef.current = targetRef.current;
        gambar(posisiRef.current);
      }
    };

    perbarui();
    media.addEventListener('change', perbarui);
    return () => media.removeEventListener('change', perbarui);
  }, [gambar]);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return (
    <nav
      className={`tab-dock ${indeksAktif < 0 ? 'tanpa-item-aktif' : ''}`}
      aria-label="Pintasan harian utama"
      ref={navRef}
    >
      <div className="tab-dock-permukaan" ref={permukaanRef} aria-hidden="true" />
      <svg className="tab-dock-garis" aria-hidden="true" focusable="false">
        <path ref={garisRef} />
      </svg>
      <div className="tab-dock-indikator" ref={indikatorRef} aria-hidden="true">
        <span key={indeksAktif} className="tab-dock-lingkaran" />
      </div>

      <div className="tab-dock-dalam">
        {TAB_DOCK_ITEMS.map((item, indeks) => {
          const Ikon = item.icon;
          const aktif = indeks === indeksAktif;

          return (
            <button
              key={item.to}
              type="button"
              ref={(elemen) => {
                itemRefs.current[indeks] = elemen;
              }}
              className={`tab-dock-item ${aktif ? 'is-active' : ''}`}
              onClick={() => navigate(item.to)}
              aria-current={aktif ? 'page' : undefined}
              title={item.description}
            >
              <span className="tab-dock-ikon">
                <Ikon size={21} strokeWidth={2.1} aria-hidden="true" />
              </span>
              <span className="tab-dock-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
