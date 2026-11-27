import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'silincah.theme';

/** Tiga mode terkurasi yang tersedia pada portal. */
export const DAFTAR_TEMA = ['light', 'sunset', 'dark'];

const WARNA_META = {
  light: '#f4f6fa',
  sunset: '#232946',
  dark: '#0d1326',
};

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (DAFTAR_TEMA.includes(saved)) return saved;
  } catch {
    // localStorage can be unavailable in private or locked-down contexts.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function terapkanTema(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'light' ? 'light' : 'dark';

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute('content', WARNA_META[theme] ?? WARNA_META.light);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Pasang tema sebelum paint pertama agar tidak terjadi kilat warna.
  useLayoutEffect(() => {
    const root = document.documentElement;

    root.classList.add('is-instant');
    terapkanTema(theme);

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The visual theme still works without persistence.
    }

    const timer = window.setTimeout(() => root.classList.remove('is-instant'), 80);

    return () => {
      window.clearTimeout(timer);
      root.classList.remove('is-instant');
    };
    // Hanya pada mount: perubahan tema berikutnya harus dianimasikan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    terapkanTema(theme);

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The visual theme still works without persistence.
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next) => {
        if (DAFTAR_TEMA.includes(next)) setThemeState(next);
      },
      toggleTheme: () =>
        setThemeState((current) => {
          const index = DAFTAR_TEMA.indexOf(current);
          return DAFTAR_TEMA[(index + 1) % DAFTAR_TEMA.length];
        }),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme harus dipakai di dalam ThemeProvider.');
  }

  return context;
}
