import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './CustomCursor.css';

const KUNCI_PENYIMPANAN = 'silincah.cursor';

export const OPSI_KURSOR = [
  { id: 'ring-dot', label: 'Ring & Dot' },
  { id: 'arrow-pointer', label: 'Arrow Pointer' },
  { id: 'system', label: 'Kursor Standar' },
];

const ID_OPSI = new Set(OPSI_KURSOR.map((opsi) => opsi.id));
const PEMICU_PERBESAR = 'a, button, [role="button"], .card';

// Magnetic morphing hanya untuk navigasi utama. Dock bawah dikecualikan agar
// interaksi AnimatedTabDock tetap utuh.
const PEMICU_MORF = 'nav:not(.tab-dock) a, nav:not(.tab-dock) button, header button';
const DURASI_MORF = 200;

function bacaPreferensi() {
  try {
    const nilai = window.localStorage.getItem(KUNCI_PENYIMPANAN);
    return ID_OPSI.has(nilai) ? nilai : 'ring-dot';
  } catch {
    // localStorage bisa tidak tersedia (mode privat); pakai default tanpa gagal.
    return 'ring-dot';
  }
}

function simpanPreferensi(nilai) {
  try {
    window.localStorage.setItem(KUNCI_PENYIMPANAN, nilai);
  } catch {
    // Penyimpanan gagal — preferensi tetap berlaku untuk sesi ini.
  }
}

function normalisasiSudut(selisih) {
  return ((((selisih + 180) % 360) + 360) % 360) - 180;
}

const KursorContext = createContext(null);

export function CustomCursorProvider({ children }) {
  const [preferensi, setPreferensiState] = useState(bacaPreferensi);
  const [larangan, setLarangan] = useState(() => ({
    sentuh: window.matchMedia('(pointer: coarse)').matches,
    gerakMinimal: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }));

  // Kondisi larangan bisa berubah saat aplikasi berjalan (mis. perangkat
  // sentuh/_mouse_ dipasang, atau pengguna mengubah pengaturan OS).
  useEffect(() => {
    const mediaSentuh = window.matchMedia('(pointer: coarse)');
    const mediaGerak = window.matchMedia('(prefers-reduced-motion: reduce)');
    const perbarui = () =>
      setLarangan({ sentuh: mediaSentuh.matches, gerakMinimal: mediaGerak.matches });

    mediaSentuh.addEventListener('change', perbarui);
    mediaGerak.addEventListener('change', perbarui);
    return () => {
      mediaSentuh.removeEventListener('change', perbarui);
      mediaGerak.removeEventListener('change', perbarui);
    };
  }, []);

  const value = useMemo(() => {
    const didukung = !larangan.sentuh && !larangan.gerakMinimal;

    const gantiPreferensi = (nilai) => {
      if (!ID_OPSI.has(nilai)) return;
      setPreferensiState(nilai);
      simpanPreferensi(nilai);
    };

    const lanjut = () => {
      const index = OPSI_KURSOR.findIndex((opsi) => opsi.id === preferensi);
      gantiPreferensi(OPSI_KURSOR[(index + 1) % OPSI_KURSOR.length].id);
    };

    return { preferensi, gantiPreferensi, lanjut, opsi: OPSI_KURSOR, didukung, larangan };
  }, [preferensi, larangan]);

  return <KursorContext.Provider value={value}>{children}</KursorContext.Provider>;
}

export function useCustomCursor() {
  const context = useContext(KursorContext);
  if (!context) {
    throw new Error('useCustomCursor harus dipakai di dalam CustomCursorProvider.');
  }
  return context;
}

/**
 * Kursor kustom bergaya Curzr.
 *  - ring-dot      : cincin + titik, membesar halus saat hover di atas
 *                    a, button, [role="button"], dan .card (default).
 *                    Pada mode ini cincin juga melakukan "magnetic morphing":
 *                    menempel pada elemen navigasi (sidebar/topbar) mengikuti
 *                    getBoundingClientRect() elemen tersebut.
 *  - arrow-pointer : panah yang berotasi mengikuti arah gerak mouse.
 *  - system        : kursor bawaan browser (kursor kustom dimatikan).
 * Posisi memakai event.clientX/clientY dengan position: fixed sehingga tetap
 * akurat saat halaman di-scroll. Nonaktif otomatis pada layar sentuh,
 * prefers-reduced-motion, dan mode cetak.
 */
export default function CustomCursor() {
  const { preferensi, larangan } = useCustomCursor();
  const aktif = preferensi !== 'system' && !larangan.sentuh && !larangan.gerakMinimal;

  const refTitik = useRef(null);
  const refPengikut = useRef(null);

  useEffect(() => {
    if (!aktif) return undefined;

    const akar = document.documentElement;
    akar.classList.add('silincah-kursor-aktif');

    const elemenTitik = refTitik.current;
    const elemenPengikut = refPengikut.current;
    const visualTitik = elemenTitik?.querySelector('.custom-cursor-dot-visual');
    const visualCincin = elemenPengikut?.querySelector('.custom-cursor-ring-visual');
    const visualPanah = elemenPengikut?.querySelector('.custom-cursor-arrow-visual');

    // Posisi viewport (clientX/clientY), bukan pageX/pageY — elemen fixed.
    const target = { x: -100, y: -100 };
    const titik = { x: -100, y: -100 };
    const pengikut = { x: -100, y: -100 };
    const sebelumnya = { x: -100, y: -100 };
    let sudutTarget = 0;
    let sudut = 0;
    let skala = 1;
    let targetSkala = 1;
    let pernahBergerak = false;
    let frame = 0;

    // Status magnetic morphing: 'normal' | 'morph' | 'kembali'
    let modeCincin = 'normal';
    let elemenMorf = null;
    let timerKembali = 0;

    const tandaiTampak = (tampak) => {
      elemenTitik?.classList.toggle('is-visible', tampak);
      elemenPengikut?.classList.toggle('is-visible', tampak);
    };

    const saatGerak = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!pernahBergerak) {
        pernahBergerak = true;
        titik.x = target.x;
        titik.y = target.y;
        pengikut.x = target.x;
        pengikut.y = target.y;
        tandaiTampak(true);
      }
    };

    const saatMasukJendela = () => {
      if (pernahBergerak) tandaiTampak(true);
    };

    const saatKeluarJendela = (event) => {
      if (!event.relatedTarget) {
        tandaiTampak(false);
        selesaiMorf();
      }
    };

    /** Menempatkan pusat cincin pada rect elemen (koordinat viewport). */
    const terapkanPosisiMorf = (elemen) => {
      const rect = elemen.getBoundingClientRect();
      const tengahX = rect.left + rect.width / 2;
      const tengahY = rect.top + rect.height / 2;

      if (elemenPengikut) {
        elemenPengikut.style.transform = `translate3d(${tengahX}px, ${tengahY}px, 0) translate(-50%, -50%)`;
      }

      return rect;
    };

    const mulaiMorf = (elemen) => {
      // Magnetic morphing hanya untuk mode ring-dot.
      if (preferensi !== 'ring-dot') return;

      if (elemenMorf === elemen) {
        // Elemen sama — hanya perbarui posisi (mis. setelah halaman digulir).
        terapkanPosisiMorf(elemen);
        return;
      }

      window.clearTimeout(timerKembali);
      elemenMorf = elemen;
      modeCincin = 'morph';

      const rect = elemen.getBoundingClientRect();
      const gaya = window.getComputedStyle(elemen);

      visualCincin?.classList.add('is-morphing');
      if (visualCincin) {
        visualCincin.style.width = `${rect.width}px`;
        visualCincin.style.height = `${rect.height}px`;
        visualCincin.style.borderRadius = gaya.borderRadius || '8px';
      }

      elemenPengikut?.classList.add('is-morphing');
      // Paksa reflow agar transisi transform container pasti terdaftar.
      void elemenPengikut?.offsetWidth;
      terapkanPosisiMorf(elemen);
    };

    const selesaiMorf = () => {
      if (!elemenMorf) return;

      elemenMorf = null;
      modeCincin = 'kembali';

      visualCincin?.classList.remove('is-morphing');
      if (visualCincin) {
        visualCincin.style.width = '';
        visualCincin.style.height = '';
        visualCincin.style.borderRadius = '';
      }

      // Kembali ke titik kursor; transisi transform container masih aktif.
      if (elemenPengikut) {
        elemenPengikut.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }

      window.clearTimeout(timerKembali);
      timerKembali = window.setTimeout(() => {
        modeCincin = 'normal';
        elemenPengikut?.classList.remove('is-morphing');
        pengikut.x = target.x;
        pengikut.y = target.y;
      }, DURASI_MORF + 40);
    };

    const saatHover = (event) => {
      const elemenEvent = event.target instanceof Element ? event.target : null;

      const diAtasInteraktif = elemenEvent?.closest(PEMICU_PERBESAR) != null;
      visualTitik?.classList.toggle('is-hover', diAtasInteraktif);
      visualCincin?.classList.toggle('is-hover', diAtasInteraktif);
      targetSkala = diAtasInteraktif ? 1.3 : 1;

      // Magnetic morphing: menempel pada elemen navigasi sidebar/topbar.
      const elemenNav = elemenEvent?.closest(PEMICU_MORF) ?? null;
      if (elemenNav) mulaiMorf(elemenNav);
      else selesaiMorf();
    };

    const saatGulir = () => {
      if (modeCincin === 'morph' && elemenMorf?.isConnected) {
        terapkanPosisiMorf(elemenMorf);
      }
    };

    const animasi = () => {
      // Titik mengikuti kursor seketika; cincin/panah menyusul dengan lerp halus.
      titik.x = target.x;
      titik.y = target.y;

      if (modeCincin === 'normal') {
        pengikut.x += (target.x - pengikut.x) * 0.18;
        pengikut.y += (target.y - pengikut.y) * 0.18;
      } else if (modeCincin === 'morph' && elemenMorf && !elemenMorf.isConnected) {
        // Elemen navigasi dilepas dari DOM (mis. pindah rute) — kembali normal.
        selesaiMorf();
      }

      // Arah gerak untuk rotasi panah (varian arrow-pointer).
      const deltaX = target.x - sebelumnya.x;
      const deltaY = target.y - sebelumnya.y;
      sebelumnya.x = target.x;
      sebelumnya.y = target.y;
      if (Math.hypot(deltaX, deltaY) > 1) {
        sudutTarget = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      }
      sudut += normalisasiSudut(sudutTarget - sudut) * 0.25;
      skala += (targetSkala - skala) * 0.2;

      if (elemenTitik) {
        elemenTitik.style.transform = `translate3d(${titik.x}px, ${titik.y}px, 0) translate(-50%, -50%)`;
      }

      if (elemenPengikut && modeCincin === 'normal') {
        const rotasi =
          preferensi === 'arrow-pointer'
            ? ` rotate(${sudut.toFixed(2)}deg) scale(${skala.toFixed(3)})`
            : '';
        elemenPengikut.style.transform = `translate3d(${pengikut.x}px, ${pengikut.y}px, 0) translate(-50%, -50%)${rotasi}`;
      }

      frame = requestAnimationFrame(animasi);
    };

    window.addEventListener('mousemove', saatGerak);
    document.addEventListener('mouseover', saatHover);
    window.addEventListener('scroll', saatGulir, { passive: true });
    window.addEventListener('resize', saatGulir);
    document.documentElement.addEventListener('mouseenter', saatMasukJendela);
    document.documentElement.addEventListener('mouseleave', saatKeluarJendela);
    frame = requestAnimationFrame(animasi);

    return () => {
      window.removeEventListener('mousemove', saatGerak);
      document.removeEventListener('mouseover', saatHover);
      window.removeEventListener('scroll', saatGulir);
      window.removeEventListener('resize', saatGulir);
      document.documentElement.removeEventListener('mouseenter', saatMasukJendela);
      document.documentElement.removeEventListener('mouseleave', saatKeluarJendela);
      window.clearTimeout(timerKembali);
      cancelAnimationFrame(frame);
      akar.classList.remove('silincah-kursor-aktif');
      tandaiTampak(false);

      // Reset state visual morphing agar mode kursor lain tetap bersih.
      visualCincin?.classList.remove('is-morphing', 'is-hover');
      if (visualCincin) {
        visualCincin.style.width = '';
        visualCincin.style.height = '';
        visualCincin.style.borderRadius = '';
      }
      elemenPengikut?.classList.remove('is-morphing');
    };
  }, [aktif, preferensi]);

  if (!aktif) return null;

  return (
    <>
      {preferensi === 'ring-dot' ? (
        <>
          <div ref={refPengikut} className="custom-cursor-elemen custom-cursor-ring" aria-hidden="true">
            <span className="custom-cursor-ring-visual" />
          </div>
          <div ref={refTitik} className="custom-cursor-elemen custom-cursor-dot" aria-hidden="true">
            <span className="custom-cursor-dot-visual" />
          </div>
        </>
      ) : null}
      {preferensi === 'arrow-pointer' ? (
        <div ref={refPengikut} className="custom-cursor-elemen custom-cursor-arrow" aria-hidden="true">
          <svg
            className="custom-cursor-arrow-visual"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 2 L19 20.5 L12 16.5 L5 20.5 Z"
              fill="var(--primary)"
              stroke="var(--surface)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : null}
    </>
  );
}
