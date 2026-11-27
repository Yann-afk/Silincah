import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Info,
  KeyRound,
  Printer,
  Search,
  X,
  XCircle,
} from 'lucide-react';

import { STUDENT_PROFILE, presensiCourses } from '../../data/academicMockData.js';
import './PresensiFeature.css';

const DURASI_ANIMASI = 800;

// Geometri donat kesimpulan: viewBox 180x180, r=68 (sesuai spesifikasi).
const DONAT_RADIUS = 68;
const DONAT_KELILING = 2 * Math.PI * DONAT_RADIUS;
const DONAT_JEDA = 3.2;

const STATUS_PERTEMUAN = {
  present: { label: 'Hadir', Ikon: CheckCircle2 },
  absent: { label: 'Tidak Hadir', Ikon: XCircle },
  'not-evaluated': { label: 'Belum Dinilai', Ikon: Clock3 },
};

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTanggal(tanggal) {
  return `${tanggal.getDate()} ${NAMA_BULAN[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

function persentaseKursus(mk) {
  return mk.evaluated > 0 ? Math.round((mk.attended / mk.evaluated) * 100) : 0;
}

function useKurangiGerak() {
  const [kurangiGerak, setKurangiGerak] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const perbarui = () => setKurangiGerak(media.matches);

    media.addEventListener('change', perbarui);
    return () => media.removeEventListener('change', perbarui);
  }, []);

  return kurangiGerak;
}

/** Kemajuan 0→1 selama ±800ms; langsung 1 bila reduced motion aktif. */
function useProgresMount(kurangiGerak) {
  const [kemajuan, setKemajuan] = useState(() => (kurangiGerak ? 1 : 0));

  useEffect(() => {
    if (kurangiGerak) {
      setKemajuan(1);
      return undefined;
    }

    let frame = 0;
    const mulai = performance.now();

    const langkah = (sekarang) => {
      const t = Math.min(1, (sekarang - mulai) / DURASI_ANIMASI);
      // easeOutCubic memberi kesan speedometer yang melambat di akhir.
      setKemajuan(1 - (1 - t) ** 3);
      if (t < 1) frame = requestAnimationFrame(langkah);
    };

    frame = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(frame);
  }, [kurangiGerak]);

  return kurangiGerak ? 1 : kemajuan;
}

/** Diagram donat multi-segmen: hover/fokus/klik memperbesar satu segmen. */
function KartuKesimpulan({ kemajuan }) {
  const [hover, setHover] = useState(null);
  const [fokus, setFokus] = useState(null);
  const [dipilih, setDipilih] = useState(null);

  const aktif = hover ?? fokus ?? dipilih;

  const totalHadir = presensiCourses.reduce((total, mk) => total + mk.attended, 0);
  const totalDinilai = presensiCourses.reduce((total, mk) => total + mk.evaluated, 0);
  const persenKeseluruhan = totalDinilai > 0 ? ((totalHadir / totalDinilai) * 100).toFixed(1) : '0.0';

  let akumulasi = 0;
  const segmen = presensiCourses.map((mk, indeks) => {
    const proporsi = totalHadir > 0 ? mk.attended / totalHadir : 1 / presensiCourses.length;
    const panjang = proporsi * DONAT_KELILING;
    const mulai = akumulasi;
    akumulasi += panjang;
    return { mk, indeks, panjang, mulai };
  });

  const kursusAktif = aktif != null ? presensiCourses[aktif] : null;
  const rotasi = -90 - 180 * (1 - kemajuan);

  function pilihSegmen(indeks) {
    setDipilih((sebelumnya) => (sebelumnya === indeks ? null : indeks));
  }

  function tanganiTombolSegmen(event, indeks) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pilihSegmen(indeks);
    } else if (event.key === 'Escape') {
      setDipilih(null);
    }
  }

  return (
    <section className="card presensi-overall" aria-labelledby="presensi-overall-judul">
      <div className="presensi-overall-kepala">
        <div>
          <h3 id="presensi-overall-judul">Kesimpulan Kehadiran</h3>
          <p className="presensi-overall-sub">
            Semester {STUDENT_PROFILE.semesterAktif} · {STUDENT_PROFILE.periode}{' '}
            {STUDENT_PROFILE.tahunAkademik} · {presensiCourses.length} mata kuliah
          </p>
        </div>
        <p className="presensi-overall-petunjuk no-print">
          Arahkan kursor, fokuskan, atau klik segmen/legenda untuk melihat detail.
        </p>
      </div>

      <div className="presensi-overall-isi">
        <div className="presensi-donat">
          <svg
            viewBox="0 0 180 180"
            role="group"
            aria-label="Diagram donat kehadiran seluruh mata kuliah"
          >
            <circle
              cx="90"
              cy="90"
              r={DONAT_RADIUS}
              fill="none"
              strokeWidth="20"
              className="presensi-donat-latar"
            />
            <g transform={`rotate(${rotasi} 90 90)`}>
              {segmen.map(({ mk, indeks, panjang, mulai }) => {
                const terlihat = Math.max(0, (panjang - DONAT_JEDA) * kemajuan);
                const segmenAktif = aktif === indeks;
                const diredupkan = aktif != null && !segmenAktif;

                return (
                  <circle
                    key={mk.id}
                    cx="90"
                    cy="90"
                    r={DONAT_RADIUS}
                    fill="none"
                    strokeWidth={segmenAktif ? 24 : 20}
                    strokeLinecap="butt"
                    strokeDasharray={`${terlihat} ${DONAT_KELILING - terlihat}`}
                    strokeDashoffset={-mulai}
                    tabIndex={0}
                    role="button"
                    aria-pressed={dipilih === indeks}
                    aria-label={`${mk.name}: ${persentaseKursus(mk)} persen, ${mk.attended} hadir dari ${mk.evaluated} pertemuan dinilai`}
                    className={`presensi-donat-segmen ${segmenAktif ? 'is-active' : ''} ${diredupkan ? 'is-dim' : ''}`}
                    style={{ stroke: mk.color }}
                    onMouseEnter={() => setHover(indeks)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setFokus(indeks)}
                    onBlur={() => setFokus(null)}
                    onClick={() => pilihSegmen(indeks)}
                    onKeyDown={(event) => tanganiTombolSegmen(event, indeks)}
                  />
                );
              })}
            </g>
          </svg>

          <div className={`presensi-donat-tengah ${kursusAktif ? 'is-kursus' : ''}`} aria-hidden="true">
            {kursusAktif ? (
              <>
                <span className="presensi-donat-label">{kursusAktif.name.toUpperCase()}</span>
                <span className="presensi-donat-nilai">
                  {persentaseKursus(kursusAktif)}
                  <span className="presensi-donat-persen">%</span>
                </span>
                <span className="presensi-donat-keterangan">
                  {kursusAktif.attended} hadir / {kursusAktif.evaluated} dinilai
                </span>
              </>
            ) : (
              <>
                <span className="presensi-donat-label">TOTAL KEHADIRAN</span>
                <span className="presensi-donat-nilai">
                  {persenKeseluruhan}
                  <span className="presensi-donat-persen">%</span>
                </span>
                <span className="presensi-donat-keterangan">
                  {totalHadir} / {totalDinilai} pertemuan dinilai
                </span>
              </>
            )}
          </div>
        </div>

        <div className="presensi-donat-legenda" role="group" aria-label="Legenda mata kuliah">
          {presensiCourses.map((mk, indeks) => {
            const segmenAktif = aktif === indeks;

            return (
              <button
                key={mk.id}
                type="button"
                className={`presensi-donat-legenda-item ${segmenAktif ? 'is-active' : ''}`}
                style={{ '--presensi-aksen': mk.color }}
                aria-pressed={dipilih === indeks}
                onMouseEnter={() => setHover(indeks)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setFokus(indeks)}
                onBlur={() => setFokus(null)}
                onClick={() => pilihSegmen(indeks)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setDipilih(null);
                }}
              >
                <span
                  className="presensi-donat-titik"
                  style={{ backgroundColor: mk.color }}
                  aria-hidden="true"
                />
                <span className="presensi-donat-legenda-teks">
                  <span className="presensi-donat-legenda-nama">{mk.name}</span>
                  <span className="presensi-donat-legenda-meta">
                    {mk.code} · {mk.attended}/{mk.evaluated} dinilai
                  </span>
                </span>
                <span className="presensi-donat-legenda-persen">{persentaseKursus(mk)}%</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="presensi-sr-only">
        Total kehadiran {persenKeseluruhan} persen, yaitu {totalHadir} dari {totalDinilai} pertemuan yang
        sudah dinilai.
      </p>
    </section>
  );
}

function CincinProgres({ mk, kemajuan }) {
  const ukuran = 84;
  const tengah = ukuran / 2;
  const tebal = 7;
  const jariJari = tengah - tebal;
  const keliling = 2 * Math.PI * jariJari;
  const persen = persentaseKursus(mk);
  const progres = (persen * kemajuan) / 100;
  const angka = Math.round(persen * kemajuan);

  return (
    <span className="presensi-progres">
      <span
        className="presensi-cincin"
        role="img"
        aria-label={`Kehadiran ${mk.name}: ${persen} persen, ${mk.attended} hadir dari ${mk.evaluated} pertemuan dinilai`}
      >
        <svg viewBox={`0 0 ${ukuran} ${ukuran}`} aria-hidden="true" focusable="false">
          <circle
            className="presensi-cincin-latar"
            cx={tengah}
            cy={tengah}
            r={jariJari}
            fill="none"
            strokeWidth={tebal}
          />
          <circle
            className="presensi-cincin-garis"
            cx={tengah}
            cy={tengah}
            r={jariJari}
            fill="none"
            strokeWidth={tebal}
            strokeLinecap="round"
            strokeDasharray={keliling}
            strokeDashoffset={keliling * (1 - progres)}
            transform={`rotate(-90 ${tengah} ${tengah})`}
          />
        </svg>
        <span className="presensi-cincin-angka" aria-hidden="true">
          {angka}
          <span className="presensi-cincin-persen">%</span>
        </span>
      </span>
      <span className="presensi-cincin-ket">
        {mk.attended} hadir / {mk.evaluated} dinilai
      </span>
    </span>
  );
}

function KartuPresensi({ mk, terbuka, onToggle, kemajuan }) {
  const idHeader = `presensi-${mk.id}-header`;
  const idPanel = `presensi-${mk.id}-panel`;
  const jumlahTidakHadir = mk.evaluated - mk.attended;
  const jumlahBelumDinilai = mk.totalMeetings - mk.evaluated;

  return (
    <li className="presensi-item" style={{ '--presensi-aksen': mk.color }}>
      <article className="card presensi-kartu">
        <button
          type="button"
          id={idHeader}
          className="presensi-header"
          aria-expanded={terbuka}
          aria-controls={idPanel}
          onClick={onToggle}
        >
          <span className="presensi-identitas">
            <span className="presensi-kode">{mk.code}</span>
            <span className="presensi-nama">{mk.name}</span>
            <span className="presensi-dosen">{mk.lecturer}</span>
            <span className="presensi-sks">{mk.sks} SKS · Semester 5</span>
          </span>

          <CincinProgres mk={mk} kemajuan={kemajuan} />

          <span className={`presensi-chevron ${terbuka ? 'open' : ''}`} aria-hidden="true">
            <ChevronDown size={18} />
          </span>
        </button>

        <div
          className={`presensi-panel ${terbuka ? 'open' : ''}`}
          id={idPanel}
          role="region"
          aria-labelledby={idHeader}
        >
          <div className="presensi-panel-kepala">
            <h3>Rincian Pertemuan 1–{mk.totalMeetings}</h3>
            <span>
              {mk.attended} dari {mk.evaluated} pertemuan dinilai
            </span>
          </div>

          <div className="presensi-legenda" aria-hidden="true">
            <span className="presensi-legenda-item presensi-legenda-item--present">
              <CheckCircle2 size={14} />
              Hadir {mk.attended}
            </span>
            <span className="presensi-legenda-item presensi-legenda-item--absent">
              <XCircle size={14} />
              Tidak Hadir {jumlahTidakHadir}
            </span>
            <span className="presensi-legenda-item presensi-legenda-item--not-evaluated">
              <Clock3 size={14} />
              Belum Dinilai {jumlahBelumDinilai}
            </span>
          </div>

          <ol className="presensi-pertemuan">
            {mk.meetings.map((pertemuan) => {
              const meta = STATUS_PERTEMUAN[pertemuan.status];
              const Ikon = meta.Ikon;

              return (
                <li
                  key={pertemuan.meeting}
                  className={`presensi-pertemuan-item presensi-pertemuan-item--${pertemuan.status}`}
                >
                  <span className="presensi-pertemuan-nomor">Pertemuan {pertemuan.meeting}</span>
                  <span className={`presensi-status presensi-status--${pertemuan.status}`}>
                    <Ikon size={14} aria-hidden="true" />
                    <span>{meta.label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </article>
    </li>
  );
}

export default function PresensiFeature() {
  const [kueri, setKueri] = useState('');
  const [terbuka, setTerbuka] = useState(() => new Set());

  const [bukaCheckIn, setBukaCheckIn] = useState(false);
  const [pin, setPin] = useState('');
  const [galatPin, setGalatPin] = useState('');
  const [statusCheckIn, setStatusCheckIn] = useState('idle');

  const kurangiGerak = useKurangiGerak();
  const kemajuan = useProgresMount(kurangiGerak);

  const tombolCheckInRef = useRef(null);
  const dialogRef = useRef(null);
  const inputPinRef = useRef(null);
  const timerRef = useRef(0);

  const daftarTampil = useMemo(() => {
    const kataKunci = kueri.trim().toLowerCase();
    if (!kataKunci) return presensiCourses;

    return presensiCourses.filter((mk) =>
      `${mk.name} ${mk.code} ${mk.lecturer}`.toLowerCase().includes(kataKunci),
    );
  }, [kueri]);

  const tanggalCetak = formatTanggal(new Date());

  const toggleKartu = (id) => {
    setTerbuka((sebelumnya) => {
      const berikut = new Set(sebelumnya);
      if (berikut.has(id)) {
        berikut.delete(id);
      } else {
        berikut.add(id);
      }
      return berikut;
    });
  };

  function bukaFormCheckIn() {
    setPin('');
    setGalatPin('');
    setStatusCheckIn('idle');
    setBukaCheckIn(true);
  }

  function tutupFormCheckIn() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
    setBukaCheckIn(false);
  }

  // Fokus awal, kunci fokus di dalam dialog, Escape untuk menutup.
  useEffect(() => {
    if (!bukaCheckIn) return undefined;

    const elemenSebelumnya = document.activeElement;
    const overflowSebelumnya = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = requestAnimationFrame(() => inputPinRef.current?.focus());

    const tanganiTombol = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        tutupFormCheckIn();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const fokusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea',
      );
      if (fokusable.length === 0) return;

      const pertama = fokusable[0];
      const terakhir = fokusable[fokusable.length - 1];

      if (event.shiftKey && document.activeElement === pertama) {
        event.preventDefault();
        terakhir.focus();
      } else if (!event.shiftKey && document.activeElement === terakhir) {
        event.preventDefault();
        pertama.focus();
      }
    };

    document.addEventListener('keydown', tanganiTombol);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', tanganiTombol);
      document.body.style.overflow = overflowSebelumnya;
      if (elemenSebelumnya instanceof HTMLElement) elemenSebelumnya.focus();
    };
  }, [bukaCheckIn]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function tanganiPin(event) {
    const bersih = event.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(bersih);
    if (galatPin) setGalatPin('');
  }

  function kirimCheckIn(event) {
    event.preventDefault();

    if (pin.length !== 6) {
      setGalatPin('PIN harus terdiri dari tepat 6 digit angka.');
      return;
    }

    setGalatPin('');
    setStatusCheckIn('memeriksa');
    timerRef.current = window.setTimeout(() => {
      timerRef.current = 0;
      setStatusCheckIn('berhasil');
    }, 700);
  }

  function bersihkanPencarian() {
    setKueri('');
  }

  return (
    <div className="presensi">
      <div className="presensi-cetak-header" aria-hidden="true">
        <div className="presensi-cetak-judul">SILINCAH — Rekap Presensi Mahasiswa</div>
        <div>
          {STUDENT_PROFILE.nama} · NIM {STUDENT_PROFILE.nim} · {STUDENT_PROFILE.programStudi} · Kelas{' '}
          {STUDENT_PROFILE.kelas}
        </div>
        <div>
          Semester {STUDENT_PROFILE.semesterAktif} · {STUDENT_PROFILE.periode} {STUDENT_PROFILE.tahunAkademik} ·
          Dicetak {tanggalCetak}
        </div>
      </div>

      <KartuKesimpulan kemajuan={kemajuan} />

      <div className="card presensi-toolbar no-print">
        <div className="presensi-cari">
          <label className="presensi-sr-only" htmlFor="presensi-cari">
            Cari mata kuliah berdasarkan nama, kode, atau dosen
          </label>
          <Search size={17} aria-hidden="true" />
          <input
            id="presensi-cari"
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Cari nama mata kuliah, kode, atau dosen…"
            value={kueri}
            onChange={(event) => setKueri(event.target.value)}
          />
          {kueri ? (
            <button
              type="button"
              className="presensi-cari-hapus"
              onClick={bersihkanPencarian}
              aria-label="Hapus kata kunci pencarian"
            >
              <X size={15} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="presensi-aksi">
          <button
            type="button"
            ref={tombolCheckInRef}
            className="btn btn-primary presensi-tombol"
            onClick={bukaFormCheckIn}
          >
            <KeyRound size={17} aria-hidden="true" />
            <span>Self Check-In</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost presensi-tombol"
            onClick={() => window.print()}
          >
            <Printer size={17} aria-hidden="true" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      <p className="presensi-hasil no-print" role="status" aria-live="polite">
        {daftarTampil.length > 0
          ? `Menampilkan ${daftarTampil.length} dari ${presensiCourses.length} mata kuliah.`
          : 'Tidak ada mata kuliah yang cocok dengan pencarian.'}
      </p>

      {daftarTampil.length > 0 ? (
        <ul className="presensi-daftar">
          {daftarTampil.map((mk) => (
            <KartuPresensi
              key={mk.id}
              mk={mk}
              terbuka={terbuka.has(mk.id)}
              onToggle={() => toggleKartu(mk.id)}
              kemajuan={kemajuan}
            />
          ))}
        </ul>
      ) : (
        <div className="card presensi-kosong">
          <p>Tidak ada mata kuliah yang cocok dengan “{kueri}”.</p>
          <button type="button" className="btn btn-ghost" onClick={bersihkanPencarian}>
            Tampilkan semua mata kuliah
          </button>
        </div>
      )}

      <p className="presensi-catatan no-print">
        <Info size={15} aria-hidden="true" />
        <span>
          Data presensi bersifat prototipe. Klik kartu mata kuliah untuk melihat status Pertemuan 1–14.
        </span>
      </p>

      {bukaCheckIn ? (
        <div
          className="presensi-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) tutupFormCheckIn();
          }}
        >
          <div
            className="card presensi-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="presensi-checkin-judul"
            aria-describedby="presensi-checkin-deskripsi"
            ref={dialogRef}
          >
            <div className="presensi-dialog-kepala">
              <div className="presensi-dialog-judul-grup">
                <span className="presensi-dialog-ikon" aria-hidden="true">
                  <KeyRound size={20} />
                </span>
                <h2 id="presensi-checkin-judul">Self Check-In Presensi</h2>
              </div>
              <button
                type="button"
                className="presensi-dialog-tutup"
                onClick={tutupFormCheckIn}
                aria-label="Tutup formulir check-in"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <p id="presensi-checkin-deskripsi" className="presensi-dialog-deskripsi">
              Masukkan PIN 6 digit yang ditampilkan dosen pada sesi perkuliahan. Ini adalah simulasi—PIN tidak
              dikirim ke server.
            </p>

            {statusCheckIn === 'berhasil' ? (
              <div className="presensi-checkin-sukses" role="status">
                <CheckCircle2 size={38} aria-hidden="true" />
                <p className="presensi-checkin-sukses-judul">Kehadiran berhasil dikonfirmasi</p>
                <p className="presensi-checkin-sukses-teks">
                  Simulasi check-in diterima. Pada prototipe ini data presensi tidak diubah.
                </p>
                <button type="button" className="btn btn-primary" onClick={tutupFormCheckIn}>
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={kirimCheckIn} noValidate>
                <label className="presensi-pin-label" htmlFor="presensi-pin">
                  PIN Kehadiran
                </label>
                <input
                  id="presensi-pin"
                  ref={inputPinRef}
                  className={`presensi-pin-input ${galatPin ? 'is-error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="••••••"
                  value={pin}
                  onChange={tanganiPin}
                  aria-invalid={galatPin ? 'true' : undefined}
                  aria-describedby={galatPin ? 'presensi-pin-error' : 'presensi-pin-bantuan'}
                />
                <p id="presensi-pin-bantuan" className="presensi-pin-bantuan">
                  6 digit angka, tanpa spasi.
                </p>
                {galatPin ? (
                  <p id="presensi-pin-error" className="presensi-pin-galat" role="alert">
                    {galatPin}
                  </p>
                ) : null}

                <div className="presensi-dialog-aksi">
                  <button type="button" className="btn btn-ghost" onClick={tutupFormCheckIn}>
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={statusCheckIn === 'memeriksa'}
                  >
                    {statusCheckIn === 'memeriksa' ? 'Memeriksa PIN…' : 'Konfirmasi Kehadiran'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
