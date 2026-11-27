import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarRange,
  ChevronDown,
  GraduationCap,
  Info,
  Layers,
  Lock,
  Printer,
} from 'lucide-react';

import {
  GRADE_SCALE,
  IPK_KUMULATIF,
  KHS_HISTORY,
  NILAI_BOBOT,
  STUDENT_PROFILE,
  TOTAL_SKS_DITEMPUH,
  TOTAL_SKS_LULUS,
  getKhs,
  getPredikatIPK,
} from '../../data/academicMockData.js';
import './NilaiFeature.css';

const BULAN_PENUH = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const KOMPONEN_LABEL = { kehadiran: 'Kehadiran', tugas: 'Tugas', uts: 'UTS', uas: 'UAS' };

const pad2 = (angka) => String(angka).padStart(2, '0');

function formatTanggalPenuh(tanggal) {
  return `${tanggal.getDate()} ${BULAN_PENUH[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

// Warna badge huruf mengikuti kelompok bobot: A → primary, B → netral, C ke bawah → danger.
function gayaBadgeHuruf(huruf) {
  if (!huruf) {
    return { backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' };
  }
  const skala = GRADE_SCALE.find((item) => item.huruf === huruf);
  const bobot = skala ? skala.bobot : 0;
  if (bobot >= 3.3) return { backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' };
  if (bobot >= 2.0) return { backgroundColor: 'var(--surface-alt)', color: 'var(--text)' };
  return { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' };
}

const chipKodeStyle = {
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  backgroundColor: 'var(--surface-alt)',
  padding: '2px 8px',
  borderRadius: 999,
};

const kotakKomponenStyle = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--surface-alt)',
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

/**
 * Satu baris mata kuliah berbentuk akordeon: header ringkas (kode, nama, SKS,
 * huruf) dan badan rincian komponen nilai. Badan selalu berada di DOM agar
 * dapat dipaksa tampil saat mencetak.
 */
function BarisMataKuliah({ mk, berjalan, diperluas, onToggle, kunci, idPrefix }) {
  const headerId = `${idPrefix}-${mk.kode}-header`;
  const bodyId = `${idPrefix}-${mk.kode}-body`;

  return (
    <div className="card" style={{ padding: 14, margin: 0, boxShadow: 'none' }}>
      <button
        type="button"
        className="nilai-accordion-header"
        id={headerId}
        aria-expanded={diperluas}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={chipKodeStyle}>{mk.kode}</span>
          <span className="nilai-judul" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{mk.nama}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mk.sks} SKS</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span className="badge" style={gayaBadgeHuruf(mk.nilaiHuruf)}>
            <span>{mk.nilaiHuruf ?? 'Berjalan'}</span>
          </span>
          <ChevronDown
            size={16}
            color="var(--text-muted)"
            aria-hidden="true"
            className={`nilai-chevron no-print${diperluas ? ' open' : ''}`}
          />
        </span>
      </button>

      <div
        className={`nilai-accordion-body${diperluas ? ' open' : ''}`}
        id={bodyId}
        role="region"
        aria-labelledby={headerId}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 8,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
          {['kehadiran', 'tugas', 'uts', 'uas'].map((namaKomponen) => {
            const nilai = mk.komponen[namaKomponen];
            return (
              <div key={namaKomponen} style={kotakKomponenStyle}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {KOMPONEN_LABEL[namaKomponen]} · {NILAI_BOBOT[namaKomponen]}%
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  {nilai != null ? nilai : '—'}
                </div>
                {nilai != null ? (
                  <div style={{ height: 5, borderRadius: 999, backgroundColor: 'var(--border)' }}>
                    <div
                      style={{
                        width: `${nilai}%`,
                        height: '100%',
                        borderRadius: 999,
                        backgroundColor: 'var(--primary)',
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Belum dinilai</div>
                )}
              </div>
            );
          })}

          <div
            style={{
              ...kotakKomponenStyle,
              borderColor: 'var(--primary)',
              backgroundColor: 'var(--primary-soft)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Nilai Akhir
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
              {mk.nilaiAkhir != null ? mk.nilaiAkhir.toFixed(2) : '—'}
            </div>
            <div style={{ fontSize: '0.72rem', color: mk.nilaiHuruf ? 'var(--text-muted)' : 'var(--primary)' }}>
              {mk.nilaiHuruf ? `Huruf ${mk.nilaiHuruf} · bobot ${mk.bobot}` : 'Menunggu nilai UAS'}
            </div>
          </div>
        </div>

        {berjalan && mk.komponen.uas == null ? (
          <div
            style={{
              backgroundColor: 'var(--primary-soft)',
              borderLeft: '3px solid var(--primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginTop: 10,
            }}
          >
            <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
              Nilai UAS belum diinput — KHS semester berjalan. Nilai akhir dan huruf terbit setelah UAS dinilai
              serta periode EDOM ditutup.
            </p>
          </div>
        ) : null}

        {!berjalan ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
              borderTop: '1px dashed var(--border)',
              paddingTop: 10,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                gap: 6,
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              <Lock size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                KHS terkunci (EDOM selesai) — koreksi nilai hanya melalui dosen pengampu dan bagian akademik.
              </span>
            </span>
            <Link
              to="/app/fitur/edom"
              className="btn btn-ghost no-print"
              style={{ minHeight: 34, padding: '6px 12px', fontSize: '0.82rem', flexShrink: 0 }}
            >
              <span>Buka EDOM</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function KartuRingkasan({ ikon: Ikon, label, nilai, keterangan, penekanan }) {
  return (
    <div className="card" style={{ padding: 16, margin: 0, boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        <Ikon size={13} />
        <span>{label}</span>
      </div>
      <div
        style={{
          fontWeight: 700,
          lineHeight: 1.25,
          fontSize: penekanan ? '1.15rem' : '1.6rem',
          color: penekanan ? 'var(--text)' : 'var(--primary)',
        }}
      >
        {nilai}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{keterangan}</div>
    </div>
  );
}

export default function NilaiFeature() {
  const [tab, setTab] = useState('khs');
  const [semesterDipilih, setSemesterDipilih] = useState(STUDENT_PROFILE.semesterAktif);
  const [terbuka, setTerbuka] = useState(() => new Set());

  const khsAktif = getKhs(semesterDipilih) ?? KHS_HISTORY[0];
  const ipSemester = khsAktif.ip;
  const ipkTeks = IPK_KUMULATIF.toFixed(2);
  const predikat = getPredikatIPK(IPK_KUMULATIF);
  const persenSksLulus = Math.round((TOTAL_SKS_LULUS / TOTAL_SKS_DITEMPUH) * 100);

  const toggle = (kunci) => {
    setTerbuka((sebelumnya) => {
      const berikut = new Set(sebelumnya);
      if (berikut.has(kunci)) {
        berikut.delete(kunci);
      } else {
        berikut.add(kunci);
      }
      return berikut;
    });
  };

  const navigasiTab = (event) => {
    const daftarTab = ['khs', 'transkrip'];
    const index = daftarTab.indexOf(tab);
    let target = null;

    if (event.key === 'ArrowRight') target = (index + 1) % daftarTab.length;
    else if (event.key === 'ArrowLeft') target = (index - 1 + daftarTab.length) % daftarTab.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = daftarTab.length - 1;

    if (target != null) {
      event.preventDefault();
      setTab(daftarTab[target]);
    }
  };

  const judulCetak =
    tab === 'khs'
      ? `Kartu Hasil Studi Semester ${khsAktif.semester} (${khsAktif.periode} ${khsAktif.tahunAkademik})`
      : `Transkrip Kumulatif Semester 1–${KHS_HISTORY.length}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header identitas dokumen — hanya muncul pada hasil cetak */}
      <div className="print-only" style={{ paddingBottom: 10, borderBottom: '2px solid var(--text)' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>SILINCAH — Portal Akademik</div>
        <div style={{ fontSize: '0.9rem' }}>
          {STUDENT_PROFILE.nama} · NIM {STUDENT_PROFILE.nim} · {STUDENT_PROFILE.programStudi} · Kelas{' '}
          {STUDENT_PROFILE.kelas}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{judulCetak}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          IPK {ipkTeks} ({predikat}) · {TOTAL_SKS_LULUS} dari {TOTAL_SKS_DITEMPUH} SKS lulus · Dicetak{' '}
          {formatTanggalPenuh(new Date())}
        </div>
      </div>

      {/* Kartu ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
        <KartuRingkasan
          ikon={CalendarRange}
          label={`IPS Semester ${khsAktif.semester}`}
          nilai={ipSemester != null ? ipSemester.toFixed(2) : '—'}
          keterangan={
            ipSemester != null
              ? `${khsAktif.totalSks} SKS · ${khsAktif.mataKuliah.length} mata kuliah`
              : 'Menunggu UAS & penutupan EDOM'
          }
        />
        <KartuRingkasan
          ikon={GraduationCap}
          label="IPK Kumulatif"
          nilai={ipkTeks}
          keterangan="Akumulasi seluruh semester final · skala 4.00"
        />
        <KartuRingkasan
          ikon={Award}
          label="Predikat"
          nilai={predikat}
          keterangan={`Berdasarkan IPK ${ipkTeks}`}
          penekanan
        />
        <KartuRingkasan
          ikon={Layers}
          label="Progres SKS"
          nilai={
            <>
              {TOTAL_SKS_LULUS}
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}> / {TOTAL_SKS_DITEMPUH}</span>
            </>
          }
          keterangan="SKS lulus dari SKS ditempuh"
        />
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            role="tablist"
            aria-label="Mode tampilan nilai"
            onKeyDown={navigasiTab}
            style={{ display: 'flex', gap: 8, overflowX: 'auto' }}
          >
            {[
              { id: 'khs', label: 'KHS per Semester' },
              { id: 'transkrip', label: 'Transkrip Kumulatif' },
            ].map((itemTab, index) => {
              const aktif = tab === itemTab.id;
              return (
                <button
                  key={itemTab.id}
                  type="button"
                  role="tab"
                  id={`tab-nilai-${itemTab.id}`}
                  aria-selected={aktif}
                  aria-controls="panel-nilai"
                  tabIndex={aktif ? 0 : -1}
                  className={`btn no-print ${aktif ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTab(itemTab.id)}
                  style={{ flexShrink: 0, whiteSpace: 'nowrap', minHeight: 40, padding: '8px 14px' }}
                >
                  <span>{itemTab.label}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="btn btn-primary no-print" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>

        <div
          role="tabpanel"
          id="panel-nilai"
          aria-labelledby={`tab-nilai-${tab}`}
          style={{ paddingTop: 14 }}
        >
          {tab === 'khs' ? (
            <div>
              <div
                className="no-print"
                role="group"
                aria-label="Pilih semester KHS"
                style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}
              >
                {KHS_HISTORY.map((semester) => {
                  const aktif = semester.semester === semesterDipilih;
                  return (
                    <button
                      key={semester.semester}
                      type="button"
                      aria-pressed={aktif}
                      className={`btn ${aktif ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setSemesterDipilih(semester.semester)}
                      style={{ flexShrink: 0, whiteSpace: 'nowrap', minHeight: 38, padding: '6px 12px' }}
                    >
                      <span>Semester {semester.semester}</span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--surface-alt)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  margin: '12px 0 14px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Semester {khsAktif.semester} · {khsAktif.periode} {khsAktif.tahunAkademik}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {khsAktif.status === 'berjalan' ? (
                      <Info size={13} color="var(--primary)" />
                    ) : (
                      <Lock size={13} color="var(--text-muted)" />
                    )}
                    <span>{khsAktif.statusLabel}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>
                    IP Semester: {ipSemester != null ? ipSemester.toFixed(2) : '—'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {khsAktif.totalSks} SKS · {khsAktif.mataKuliah.length} mata kuliah
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {khsAktif.mataKuliah.map((mk) => {
                  const kunci = `khs-${khsAktif.semester}-${mk.kode}`;
                  return (
                    <BarisMataKuliah
                      key={kunci}
                      mk={mk}
                      berjalan={khsAktif.status === 'berjalan'}
                      diperluas={terbuka.has(kunci)}
                      onToggle={() => toggle(kunci)}
                      kunci={kunci}
                      idPrefix={`khs-${khsAktif.semester}`}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p className="no-print" style={{ margin: '0 0 14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Seluruh riwayat {TOTAL_SKS_DITEMPUH} SKS dari Semester 1–{KHS_HISTORY.length}. Klik mata kuliah
                untuk membuka rincian komponen nilainya.
              </p>

              {KHS_HISTORY.map((semester) => (
                <section key={semester.semester} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '0.98rem' }}>
                      Semester {semester.semester} · {semester.periode} {semester.tahunAkademik}
                    </h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      IP {semester.ip != null ? semester.ip.toFixed(2) : '—'} · {semester.totalSks} SKS ·{' '}
                      {semester.mataKuliah.length} MK
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {semester.mataKuliah.map((mk) => {
                      const kunci = `tr-${semester.semester}-${mk.kode}`;
                      return (
                        <BarisMataKuliah
                          key={kunci}
                          mk={mk}
                          berjalan={semester.status === 'berjalan'}
                          diperluas={terbuka.has(kunci)}
                          onToggle={() => toggle(kunci)}
                          kunci={kunci}
                          idPrefix={`tr-${semester.semester}`}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}

              <p className="no-print" style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Skala nilai:{' '}
                {GRADE_SCALE.filter((item) => item.huruf !== 'E')
                  .map((item) => `${item.huruf} ≥ ${item.batasMinimal}`)
                  .join(' · ')}{' '}
                · E di bawah 45.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
