import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  MapPin,
  TriangleAlert,
  UserRound,
} from 'lucide-react';

import { STUDENT_PROFILE, WEEKLY_SCHEDULE } from '../../data/academicMockData.js';

const HARI_JS_IKA = { senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6 };
const KODE_HARI_ICS = { senin: 'MO', selasa: 'TU', rabu: 'WE', kamis: 'TH', jumat: 'FR', sabtu: 'SA' };
const JUMLAH_PERTEMUAN = 16;
const NAMA_BERKAS_ICS = `jadwal-kuliah-${STUDENT_PROFILE.nim}.ics`;

// Tab default mengikuti hari aktif; di luar Senin-Sabtu (mis. Minggu) kembali ke Senin.
function ambilHariDefault() {
  const hariIni = new Date().getDay();
  const cocok = WEEKLY_SCHEDULE.find((hari) => HARI_JS_IKA[hari.id] === hariIni);
  return cocok ? cocok.id : WEEKLY_SCHEDULE[0].id;
}

// Tanggal kemunculan berikutnya untuk sebuah hari kuliah (selalu di masa depan).
function tanggalBerikutnya(hariId) {
  const target = HARI_JS_IKA[hariId];
  const sekarang = new Date();
  const selisih = (target - sekarang.getDay() + 7) % 7 || 7;
  const tanggal = new Date(sekarang);
  tanggal.setDate(sekarang.getDate() + selisih);
  return tanggal;
}

const pad2 = (angka) => String(angka).padStart(2, '0');

function formatTanggalIcs(tanggal, jam) {
  const [jamAngka, menitAngka] = jam.split(':');
  return (
    `${tanggal.getFullYear()}${pad2(tanggal.getMonth() + 1)}${pad2(tanggal.getDate())}` +
    `T${jamAngka}${menitAngka}00`
  );
}

function formatDtstampIcs() {
  const sekarang = new Date();
  return (
    `${sekarang.getUTCFullYear()}${pad2(sekarang.getUTCMonth() + 1)}${pad2(sekarang.getUTCDate())}` +
    `T${pad2(sekarang.getUTCHours())}${pad2(sekarang.getUTCMinutes())}${pad2(sekarang.getUTCSeconds())}Z`
  );
}

// Pelarian teks sesuai RFC 5545 (backslash, titik koma, koma, baris baru).
function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// RFC 5545 melarang baris lebih dari 75 oktet; baris lanjutan diawali satu spasi.
function lipatBarisIcs(baris) {
  const potongan = [];
  let sisa = baris;
  while (sisa.length > 75) {
    potongan.push(sisa.slice(0, 75));
    sisa = ` ${sisa.slice(75)}`;
  }
  potongan.push(sisa);
  return potongan.join('\r\n');
}

function buatIsiIcs() {
  const baris = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SILINCAH//Jadwal Kuliah Mahasiswa//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(`Jadwal Kuliah ${STUDENT_PROFILE.nama} - ${STUDENT_PROFILE.periode} ${STUDENT_PROFILE.tahunAkademik}`)}`,
  ];

  WEEKLY_SCHEDULE.forEach((hari) => {
    const tanggal = tanggalBerikutnya(hari.id);

    hari.kelasList.forEach((kelas) => {
      const deskripsi = [
        `Dosen: ${kelas.dosen}`,
        `Kelas: ${kelas.kelas}`,
        kelas.catatan,
      ]
        .filter(Boolean)
        .join('\n');

      baris.push('BEGIN:VEVENT');
      baris.push(`UID:silincah-${STUDENT_PROFILE.nim}-${kelas.id}@silincah.local`);
      baris.push(`DTSTAMP:${formatDtstampIcs()}`);
      baris.push(`DTSTART:${formatTanggalIcs(tanggal, kelas.jamMulai)}`);
      baris.push(`DTEND:${formatTanggalIcs(tanggal, kelas.jamSelesai)}`);
      baris.push(
        `SUMMARY:${escapeIcs(
          `${kelas.isKelasPengganti ? '[Kelas Pengganti] ' : ''}${kelas.kode} - ${kelas.mataKuliah} (${kelas.jenis})`,
        )}`,
      );
      baris.push(`LOCATION:${escapeIcs(kelas.ruang)}`);
      baris.push(`DESCRIPTION:${escapeIcs(deskripsi)}`);
      // Kelas pengganti hanya berlaku satu kali; kelas reguler berulang sepanjang semester.
      if (!kelas.isKelasPengganti) {
        baris.push(`RRULE:FREQ=WEEKLY;BYDAY=${KODE_HARI_ICS[hari.id]};COUNT=${JUMLAH_PERTEMUAN}`);
      }
      baris.push('END:VEVENT');
    });
  });

  baris.push('END:VCALENDAR');
  return baris.map(lipatBarisIcs).join('\r\n');
}

const metaRowStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  fontSize: '0.9rem',
  lineHeight: 1.45,
};

export default function JadwalFeature() {
  const [hariAktif, setHariAktif] = useState(ambilHariDefault);
  const [statusUnduh, setStatusUnduh] = useState('idle');
  const tabRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const hari = WEEKLY_SCHEDULE.find((item) => item.id === hariAktif) ?? WEEKLY_SCHEDULE[0];
  const adaKelasPengganti = hari.kelasList.some((kelas) => kelas.isKelasPengganti);

  const navigasiTab = (event) => {
    const index = WEEKLY_SCHEDULE.findIndex((item) => item.id === hariAktif);
    let target = null;

    if (event.key === 'ArrowRight') target = (index + 1) % WEEKLY_SCHEDULE.length;
    else if (event.key === 'ArrowLeft') target = (index - 1 + WEEKLY_SCHEDULE.length) % WEEKLY_SCHEDULE.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = WEEKLY_SCHEDULE.length - 1;

    if (target != null) {
      event.preventDefault();
      setHariAktif(WEEKLY_SCHEDULE[target].id);
      tabRefs.current[target]?.focus();
    }
  };

  const unduhJadwal = () => {
    const blob = new Blob([buatIsiIcs()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement('a');
    tautan.href = url;
    tautan.download = NAMA_BERKAS_ICS;
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    URL.revokeObjectURL(url);

    setStatusUnduh('berhasil');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatusUnduh('idle'), 2600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        className="card"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ minWidth: 220 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Jadwal Kuliah Mingguan</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {STUDENT_PROFILE.programStudi} · {STUDENT_PROFILE.kelas} · Semester{' '}
            {STUDENT_PROFILE.semesterAktif} ({STUDENT_PROFILE.periode}) {STUDENT_PROFILE.tahunAkademik}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span
            aria-live="polite"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary)',
              visibility: statusUnduh === 'berhasil' ? 'visible' : 'hidden',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Jadwal tersimpan sebagai .ics</span>
          </span>
          <button type="button" className="btn btn-primary" onClick={unduhJadwal}>
            <Download size={16} />
            <span>Unduh Jadwal (.ics)</span>
          </button>
          <Link to="/app/fitur/presensi" className="btn btn-ghost">
            <ClipboardCheck size={16} />
            <span>Buka Presensi</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <div
          role="tablist"
          aria-label="Pilih hari jadwal kuliah"
          onKeyDown={navigasiTab}
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'thin',
          }}
        >
          {WEEKLY_SCHEDULE.map((item, index) => {
            const aktif = item.id === hari.id;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`tab-jadwal-${item.id}`}
                aria-selected={aktif}
                aria-controls="panel-jadwal"
                aria-label={`${item.hari}, ${item.kelasList.length} kelas`}
                tabIndex={aktif ? 0 : -1}
                className={`btn ${aktif ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setHariAktif(item.id)}
                style={{ flexShrink: 0, whiteSpace: 'nowrap', minHeight: 40, padding: '8px 14px' }}
              >
                <span>{item.hari}</span>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 999,
                    border: '1px solid currentColor',
                  }}
                >
                  {item.kelasList.length}
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="panel-jadwal"
          aria-labelledby={`tab-jadwal-${hari.id}`}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 8, margin: '16px 0 12px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Agenda {hari.hari}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {hari.kelasList.length} sesi kuliah{adaKelasPengganti ? ' · ada kelas pengganti' : ''}
            </span>
          </div>

          {hari.kelasList.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '20px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <CalendarDays size={20} />
              <span>Tidak ada kelas terjadwal pada hari {hari.hari}. Pilih hari lain di atas.</span>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 12,
              }}
            >
              {hari.kelasList.map((kelas) => (
                <article
                  key={kelas.id}
                  className="card"
                  style={{
                    padding: 16,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: 'none',
                    ...(kelas.isKelasPengganti ? { borderLeft: '3px solid var(--danger)' } : null),
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '1.02rem' }}>
                      <Clock size={16} color="var(--primary)" />
                      <span>
                        {kelas.jamMulai} – {kelas.jamSelesai}
                      </span>
                    </span>
                    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                      {kelas.isKelasPengganti ? (
                        <span
                          className="badge"
                          style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}
                        >
                          <TriangleAlert size={12} />
                          <span>Kelas Pengganti</span>
                        </span>
                      ) : null}
                      <span
                        className="badge"
                        style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }}
                      >
                        <span>{kelas.jenis}</span>
                      </span>
                    </span>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {kelas.kode} · Kelas {kelas.kelas}
                    </div>
                    <h5 style={{ margin: '2px 0 0', fontSize: '1.05rem', lineHeight: 1.35 }}>{kelas.mataKuliah}</h5>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      borderTop: '1px solid var(--border)',
                      paddingTop: 10,
                    }}
                  >
                    <div style={metaRowStyle}>
                      <MapPin size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        <span style={{ color: 'var(--text-muted)' }}>Ruang: </span>
                        {kelas.ruang}
                      </span>
                    </div>
                    <div style={metaRowStyle}>
                      <UserRound size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        <span style={{ color: 'var(--text-muted)' }}>Dosen: </span>
                        {kelas.dosen}
                      </span>
                    </div>
                  </div>

                  {kelas.isKelasPengganti ? (
                    <div
                      style={{
                        backgroundColor: 'var(--danger-soft)',
                        borderLeft: '3px solid var(--danger)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <TriangleAlert size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{kelas.catatan}</p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
