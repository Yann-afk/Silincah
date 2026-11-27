import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

import { useTheme } from '../../app/ThemeProvider.jsx';
import './ThemeMoodToggle.css';

const KUNCI_TEMA = 'silincah.theme';
const KUNCI_SUARA = 'silincah.themeSound';

const TEMA = [
  { id: 'light', label: 'Light', nama: 'Mode Terang' },
  { id: 'sunset', label: 'Sunset', nama: 'Mode Tengah' },
  { id: 'dark', label: 'Dark', nama: 'Mode Gelap' },
];

/**
 * Warna knob mengikuti posisi mode pada lingkaran warna:
 * Light Original (Navy 225°) → Twilight (Indigo 233°) → Reverse (Amber 43°).
 */
const GAYA_KNOB = {
  light: { bg: '#1b2a59', fg: '#ffffff' },
  sunset: { bg: '#8fa2ff', fg: '#161b33' },
  dark: { bg: '#fbbf24', fg: '#1a1204' },
};

function bacaPreferensiSuara() {
  try {
    return window.localStorage.getItem(KUNCI_SUARA) === 'aktif';
  } catch {
    // Suara tetap OFF bila penyimpanan tidak tersedia.
    return false;
  }
}

function simpanPreferensiSuara(aktif) {
  try {
    window.localStorage.setItem(KUNCI_SUARA, aktif ? 'aktif' : 'nonaktif');
  } catch {
    // Preferensi tetap berlaku untuk sesi ini meski penyimpanan gagal.
  }
}

/* --- Ikon SVG ------------------------------------------------------------ */

function IkonMatahari() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="theme-mood-svg theme-mood-svg--sun"
      aria-hidden="true"
      focusable="false"
    >
      <g className="theme-mood-rays">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((derajat) => (
          <line
            key={derajat}
            x1="12"
            y1="2.3"
            x2="12"
            y2="4.9"
            transform={`rotate(${derajat} 12 12)`}
          />
        ))}
      </g>
      <circle className="theme-mood-core" cx="12" cy="12" r="4.1" />
    </svg>
  );
}

function IkonSenja() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="theme-mood-svg theme-mood-svg--sunset"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="theme-mood-halo" cx="12" cy="13.1" r="5.4" />
      <g className="theme-mood-glow">
        <line x1="12" y1="3.4" x2="12" y2="5.6" />
        <line x1="5.6" y1="6.6" x2="7.2" y2="8.2" />
        <line x1="18.4" y1="6.6" x2="16.8" y2="8.2" />
      </g>
      <path className="theme-mood-arc" d="M7.4 13.1a4.6 4.6 0 0 1 9.2 0Z" />
      <path
        className="theme-mood-wave theme-mood-wave--1"
        d="M2.4 16.3c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2"
      />
      <path
        className="theme-mood-wave theme-mood-wave--2"
        d="M4.2 19.6c1.4 0 1.4-1 2.8-1s1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1"
      />
    </svg>
  );
}

function IkonBulan() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="theme-mood-svg theme-mood-svg--moon"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="theme-mood-crescent"
        d="M15.3 3a8.8 8.8 0 1 0 5.4 10.2A7.2 7.2 0 0 1 15.3 3Z"
      />
      <g className="theme-mood-stars">
        <circle className="theme-mood-star theme-mood-star--1" cx="17.7" cy="6" r="0.95" />
        <circle className="theme-mood-star theme-mood-star--2" cx="20.4" cy="10.2" r="0.7" />
        <circle className="theme-mood-star theme-mood-star--3" cx="14.3" cy="9.1" r="0.6" />
        <circle className="theme-mood-star theme-mood-star--4" cx="18.5" cy="13.7" r="0.8" />
      </g>
    </svg>
  );
}

const IKON = {
  light: <IkonMatahari />,
  sunset: <IkonSenja />,
  dark: <IkonBulan />,
};

/* --- Web Audio API: efek suara sintetis --------------------------------- */

function nadaSintesis(ac, master, { frekuensi, mulai, durasi, jenis = 'sine', volume = 0.16 }) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = jenis;
  osc.frequency.setValueAtTime(frekuensi, mulai);
  gain.gain.setValueAtTime(0.0001, mulai);
  gain.gain.exponentialRampToValueAtTime(volume, mulai + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi);

  osc.connect(gain);
  gain.connect(master);
  osc.start(mulai);
  osc.stop(mulai + durasi + 0.05);
}

function humSynth(ac, master, { frekuensi, mulai, durasi, volume = 0.1 }) {
  const osc = ac.createOscillator();
  const oscHarmonik = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();

  osc.type = 'triangle';
  osc.frequency.value = frekuensi;
  oscHarmonik.type = 'sine';
  oscHarmonik.frequency.value = frekuensi * 1.5;
  oscHarmonik.detune.value = 7;

  filter.type = 'lowpass';
  filter.frequency.value = 720;
  filter.Q.value = 3;

  gain.gain.setValueAtTime(0.0001, mulai);
  gain.gain.exponentialRampToValueAtTime(volume, mulai + 0.28);
  gain.gain.setValueAtTime(volume, mulai + durasi * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi);

  osc.connect(filter);
  oscHarmonik.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  osc.start(mulai);
  oscHarmonik.start(mulai);
  osc.stop(mulai + durasi + 0.05);
  oscHarmonik.stop(mulai + durasi + 0.05);
}

/* --- Komponen ------------------------------------------------------------ */

export default function ThemeMoodToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();
  const [suaraAktif, setSuaraAktif] = useState(() => bacaPreferensiSuara());

  const knobRef = useRef(null);
  const stopRefs = useRef([]);
  const audioRef = useRef(null);

  const indeksAktif = Math.max(
    0,
    TEMA.findIndex((item) => item.id === theme),
  );

  const gayaKnob = GAYA_KNOB[theme] ?? GAYA_KNOB.light;

  useEffect(
    () => () => {
      if (audioRef.current && typeof audioRef.current.close === 'function') {
        audioRef.current.close().catch(() => {});
      }
    },
    [],
  );

  const animasiSquash = useCallback(() => {
    const knob = knobRef.current;
    if (!knob || typeof knob.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    knob.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.16, 0.86)', offset: 0.42 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 420, easing: 'cubic-bezier(0.34, 1.42, 0.52, 1)' },
    );
  }, []);

  const pastikanKonteks = useCallback(() => {
    if (!audioRef.current) {
      const AudioContextKelas = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextKelas) return null;
      audioRef.current = new AudioContextKelas();
    }

    if (audioRef.current.state === 'suspended') {
      audioRef.current.resume().catch(() => {});
    }

    return audioRef.current;
  }, []);

  const mainkanSuara = useCallback(
    (id) => {
      const ac = pastikanKonteks();
      if (!ac) return;

      const mulai = ac.currentTime + 0.02;
      const master = ac.createGain();
      master.gain.value = 0.85;
      master.connect(ac.destination);

      if (id === 'light') {
        // Chime cerah.
        nadaSintesis(ac, master, { frekuensi: 783.99, mulai, durasi: 0.7, volume: 0.16 });
        nadaSintesis(ac, master, {
          frekuensi: 1174.66,
          mulai: mulai + 0.09,
          durasi: 0.85,
          volume: 0.11,
        });
      } else if (id === 'sunset') {
        // Hum hangat.
        humSynth(ac, master, { frekuensi: 196, mulai, durasi: 1.5, volume: 0.1 });
      } else {
        // Deep bell.
        nadaSintesis(ac, master, { frekuensi: 110, mulai, durasi: 2.4, volume: 0.2 });
        nadaSintesis(ac, master, {
          frekuensi: 164.81,
          mulai: mulai + 0.04,
          durasi: 2.1,
          volume: 0.1,
        });
      }
    },
    [pastikanKonteks],
  );

  const pilihTema = useCallback(
    (id) => {
      if (!id || id === theme) return;

      // Terapkan langsung + simpan preferensi (tanpa kilat saat pergantian).
      try {
        window.localStorage.setItem(KUNCI_TEMA, id);
      } catch {
        // Preferensi tetap berlaku untuk sesi ini meski penyimpanan gagal.
      }
      document.documentElement.dataset.theme = id;
      setTheme(id);

      animasiSquash();
      if (suaraAktif) mainkanSuara(id);
    },
    [theme, setTheme, animasiSquash, mainkanSuara, suaraAktif],
  );

  const toggleSuara = useCallback(() => {
    const berikut = !suaraAktif;
    setSuaraAktif(berikut);
    simpanPreferensiSuara(berikut);
    if (berikut) mainkanSuara(theme);
  }, [suaraAktif, mainkanSuara, theme]);

  const tanganiPanah = useCallback(
    (event) => {
      const index = TEMA.findIndex((item) => item.id === theme);
      let target = null;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        target = (index + 1) % TEMA.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        target = (index - 1 + TEMA.length) % TEMA.length;
      } else if (event.key === 'Home') {
        target = 0;
      } else if (event.key === 'End') {
        target = TEMA.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      stopRefs.current[target]?.focus();
      pilihTema(TEMA[target].id);
    },
    [theme, pilihTema],
  );

  return (
    <div className={`theme-mood ${className}`.trim()}>
      <div
        className="theme-mood-pill"
        role="radiogroup"
        aria-label="Tema tampilan"
        onKeyDown={tanganiPanah}
      >
        <span
          className="theme-mood-knob-wrap"
          style={{ '--theme-mood-index': indeksAktif }}
          aria-hidden="true"
        >
          <span
            className="theme-mood-knob"
            ref={knobRef}
            style={{ '--theme-mood-knob-bg': gayaKnob.bg, '--theme-mood-knob-fg': gayaKnob.fg }}
          >
            {TEMA.map((item) => (
              <span
                key={item.id}
                className={`theme-mood-icon theme-mood-icon--${item.id} ${
                  theme === item.id ? 'is-active' : ''
                }`}
              >
                {IKON[item.id]}
              </span>
            ))}
          </span>
        </span>

        <div className="theme-mood-stops" role="none">
          {TEMA.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              className="theme-mood-stop"
              aria-checked={theme === item.id}
              tabIndex={theme === item.id ? 0 : -1}
              ref={(element) => {
                stopRefs.current[index] = element;
              }}
              onClick={() => pilihTema(item.id)}
              title={item.nama}
            >
              <span className="theme-mood-sr-only">{item.nama}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="theme-mood-sound"
        aria-pressed={suaraAktif}
        aria-label={suaraAktif ? 'Matikan suara tema' : 'Aktifkan suara tema'}
        title={suaraAktif ? 'Matikan suara tema' : 'Aktifkan suara tema'}
        onClick={toggleSuara}
      >
        {suaraAktif ? (
          <Volume2 size={16} aria-hidden="true" />
        ) : (
          <VolumeX size={16} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
