import { useEffect, useRef, useState } from 'react';
import './ConstellationBg.css';

/**
 * Kunci penyimpanan preferensi animasi latar.
 * Nilai yang disimpan: 'aktif' | 'nonaktif'.
 */
export const KUNCI_BG_ANIMASI = 'silincah.bgAnimasi';

/** Preferensi default aktif; hanya nilai 'nonaktif' yang mematikan animasi. */
export function bacaPreferensiBg() {
  try {
    return window.localStorage.getItem(KUNCI_BG_ANIMASI) !== 'nonaktif';
  } catch {
    // localStorage bisa diblokir; animasi tetap aktif untuk sesi ini.
    return true;
  }
}

export function simpanPreferensiBg(aktif) {
  try {
    window.localStorage.setItem(KUNCI_BG_ANIMASI, aktif ? 'aktif' : 'nonaktif');
  } catch {
    // Preferensi tetap berlaku untuk sesi ini meski penyimpanan gagal.
  }
}

// ~70 titik pada layar desktop, menyesuaikan lebar layar tanpa membanjiri mobile.
const JUMLAH_MIN = 34;
const JUMLAH_MAKS = 80;
const RADIUS_PENGARUH = 185;
const JARAK_GARIS = 138;
const OPASITAS_JAUH = 0.06;
const OPASITAS_DEKAT = 0.25;

function hitungJumlahTitik(lebar) {
  return Math.min(JUMLAH_MAKS, Math.max(JUMLAH_MIN, Math.round(lebar / 20)));
}

function buatTitik(jumlah) {
  return Array.from({ length: jumlah }, () => ({
    dasarX: 0.03 + Math.random() * 0.94,
    dasarY: 0.03 + Math.random() * 0.94,
    amplitudoX: 0.01 + Math.random() * 0.022,
    amplitudoY: 0.01 + Math.random() * 0.022,
    faseX: Math.random() * Math.PI * 2,
    faseY: Math.random() * Math.PI * 2,
    kecepatanX: 0.00004 + Math.random() * 0.00008,
    kecepatanY: 0.00004 + Math.random() * 0.00008,
    jariJari: 1.1 + Math.random() * 1.3,
  }));
}

export default function ConstellationBg({ aktif }) {
  const canvasRef = useRef(null);
  const [preferensiAktif] = useState(() => bacaPreferensiBg());
  const aktifFinal = typeof aktif === 'boolean' ? aktif : preferensiAktif;

  const [kurangiGerak, setKurangiGerak] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const perbarui = (event) => setKurangiGerak(event.matches);

    media.addEventListener('change', perbarui);
    return () => media.removeEventListener('change', perbarui);
  }, []);

  useEffect(() => {
    if (!aktifFinal) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const mediaKasar = window.matchMedia('(pointer: coarse)');
    let lacakKursor = !mediaKasar.matches;

    let lebar = 0;
    let tinggi = 0;
    let rasio = 1;
    let titik = [];
    let warna = '#0f766e';
    let bingkai = 0;
    let bingkaiUkuran = 0;

    const kursor = { x: -9999, y: -9999, aktif: false };

    function bacaWarna() {
      const gaya = window.getComputedStyle(document.documentElement);
      // Aksen portal (teal/emerald) otomatis mengikuti tema Light/Dark.
      return gaya.getPropertyValue('--primary').trim() || '#0f766e';
    }

    function ukur() {
      lebar = window.innerWidth;
      tinggi = window.innerHeight;
      rasio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(lebar * rasio);
      canvas.height = Math.round(tinggi * rasio);
      ctx.setTransform(rasio, 0, 0, rasio, 0, 0);

      const jumlah = hitungJumlahTitik(lebar);
      if (titik.length !== jumlah) titik = buatTitik(jumlah);

      warna = bacaWarna();
    }

    function posisiTitik(waktu) {
      return titik.map((p) => {
        const getarX = Math.sin(waktu * p.kecepatanX + p.faseX) * p.amplitudoX;
        const getarY = Math.cos(waktu * p.kecepatanY + p.faseY) * p.amplitudoY;

        return {
          x: (p.dasarX + getarX) * lebar,
          y: (p.dasarY + getarY) * tinggi,
          jariJari: p.jariJari,
        };
      });
    }

    function posisiStatis() {
      return titik.map((p) => ({
        x: p.dasarX * lebar,
        y: p.dasarY * tinggi,
        jariJari: p.jariJari,
      }));
    }

    function gambar(waktu) {
      ctx.clearRect(0, 0, lebar, tinggi);

      const posisi = kurangiGerak ? posisiStatis() : posisiTitik(waktu);
      const kursorAktif = !kurangiGerak && lacakKursor && kursor.aktif;

      const pengaruh = posisi.map((p) => {
        if (!kursorAktif) return 0;
        const dx = p.x - kursor.x;
        const dy = p.y - kursor.y;
        const jarak = Math.hypot(dx, dy);
        return Math.max(0, 1 - jarak / RADIUS_PENGARUH);
      });

      ctx.lineWidth = 1;
      ctx.strokeStyle = warna;
      ctx.fillStyle = warna;

      // Hubungkan titik-titik yang berdekatan di sekitar kursor.
      if (kursorAktif) {
        for (let i = 0; i < posisi.length; i += 1) {
          if (pengaruh[i] <= 0) continue;

          for (let j = i + 1; j < posisi.length; j += 1) {
            if (pengaruh[j] <= 0) continue;

            const dx = posisi[i].x - posisi[j].x;
            const dy = posisi[i].y - posisi[j].y;
            if (Math.hypot(dx, dy) > JARAK_GARIS) continue;

            const kedekatan = Math.min(pengaruh[i], pengaruh[j]);
            ctx.globalAlpha = OPASITAS_JAUH + (OPASITAS_DEKAT - OPASITAS_JAUH) * kedekatan;
            ctx.beginPath();
            ctx.moveTo(posisi[i].x, posisi[i].y);
            ctx.lineTo(posisi[j].x, posisi[j].y);
            ctx.stroke();
          }
        }

        // Garis tipis dari kursor ke titik terdekat memperkuat kesan jaringan.
        posisi.forEach((p, indeks) => {
          if (pengaruh[indeks] <= 0.12) return;

          ctx.globalAlpha =
            OPASITAS_JAUH + (OPASITAS_DEKAT - OPASITAS_JAUH) * pengaruh[indeks] * 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(kursor.x, kursor.y);
          ctx.stroke();
        });
      }

      // Titik-titik: redup saat jauh, lebih terang saat didekati kursor.
      posisi.forEach((p, indeks) => {
        const kedekatan = pengaruh[indeks];
        ctx.globalAlpha = OPASITAS_JAUH + (OPASITAS_DEKAT - OPASITAS_JAUH) * kedekatan;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.jariJari + kedekatan * 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    }

    function ulang(waktu) {
      gambar(waktu);
      bingkai = window.requestAnimationFrame(ulang);
    }

    function tanganiGerak(event) {
      if (!lacakKursor) return;
      kursor.x = event.clientX;
      kursor.y = event.clientY;
      kursor.aktif = true;
    }

    function tanganiKeluar() {
      kursor.aktif = false;
    }

    function tanganiPerubahanPointer(event) {
      lacakKursor = event.matches;
      if (!lacakKursor) kursor.aktif = false;
    }

    function tanganiUkuran() {
      window.cancelAnimationFrame(bingkaiUkuran);
      bingkaiUkuran = window.requestAnimationFrame(() => {
        ukur();
        if (kurangiGerak) gambar(0);
      });
    }

    // Reaksi terhadap pergantian tema tanpa memulai ulang animasi.
    const pengamat = new MutationObserver(() => {
      warna = bacaWarna();
      if (kurangiGerak) gambar(0);
    });
    pengamat.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });

    ukur();

    if (kurangiGerak) {
      gambar(0);
    } else {
      bingkai = window.requestAnimationFrame(ulang);
      window.addEventListener('mousemove', tanganiGerak, { passive: true });
      document.addEventListener('mouseleave', tanganiKeluar);
      window.addEventListener('blur', tanganiKeluar);
    }

    window.addEventListener('resize', tanganiUkuran);
    mediaKasar.addEventListener('change', tanganiPerubahanPointer);

    return () => {
      window.cancelAnimationFrame(bingkai);
      window.cancelAnimationFrame(bingkaiUkuran);
      window.removeEventListener('mousemove', tanganiGerak);
      document.removeEventListener('mouseleave', tanganiKeluar);
      window.removeEventListener('blur', tanganiKeluar);
      window.removeEventListener('resize', tanganiUkuran);
      mediaKasar.removeEventListener('change', tanganiPerubahanPointer);
      pengamat.disconnect();
      ctx.clearRect(0, 0, lebar, tinggi);
    };
  }, [aktifFinal, kurangiGerak]);

  return <canvas ref={canvasRef} className="constellation-bg" aria-hidden="true" />;
}
