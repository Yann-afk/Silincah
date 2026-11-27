import { useEffect, useRef, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Flag,
  Inbox,
  MessageSquare,
  Send,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';

import {
  DAFTAR_TUGAS,
  GRADE_SCALE,
} from '../../data/academicMockData.js';

const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const EKSTENSI_DITERIMA = ['.pdf', '.docx', '.zip'];
const MAKS_UKURAN_BERKAS = 10 * 1024 * 1024;
const TEKS_EKSTENSI = '.pdf, .docx, .zip';

const pad2 = (angka) => String(angka).padStart(2, '0');

function formatTanggalSingkat(iso) {
  const [bagianTanggal] = String(iso).split('T');
  const [tahun, bulan, tanggal] = bagianTanggal.split('-');
  return `${Number(tanggal)} ${BULAN_SINGKAT[Number(bulan) - 1]} ${tahun}`;
}

function formatJam(iso) {
  return String(iso).split('T')[1];
}

function isoWaktuLokal(date) {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  );
}

function formatUkuran(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function hurufDariNilai(nilai) {
  const skala = GRADE_SCALE.find((item) => nilai >= item.batasMinimal);
  return skala ? skala.huruf : 'E';
}

// Selisih hari kalender antara tenggat dan hari ini (tanpa pengaruh jam).
function selisihHari(iso) {
  const [bagianTanggal] = String(iso).split('T');
  const [tahun, bulan, tanggal] = bagianTanggal.split('-').map(Number);
  const tenggat = new Date(tahun, bulan - 1, tanggal);
  const kini = new Date();
  const kiniTengahMalam = new Date(kini.getFullYear(), kini.getMonth(), kini.getDate());
  return Math.round((tenggat.getTime() - kiniTengahMalam.getTime()) / 86400000);
}

// Penanda mendesak untuk tugas aktif: tenggat hari ini, besok, atau 2 hari lagi.
function uraianTenggat(tugas) {
  const selisih = selisihHari(tugas.tenggat);
  const selesai = tugas.status === 'dinilai' || tugas.status === 'terlambat';

  if (selesai) return { label: null, mendesak: false };
  if (selisih < 0) return { label: `Melewati tenggat ${Math.abs(selisih)} hari`, mendesak: true };
  if (selisih === 0) return { label: 'Tenggat hari ini', mendesak: true };
  if (selisih === 1) return { label: 'Besok', mendesak: true };
  if (selisih === 2) return { label: '2 hari lagi', mendesak: true };
  return { label: `${selisih} hari lagi`, mendesak: false };
}

// Validasi tipe dan ukuran berkas; mengembalikan pesan galat atau null bila sah.
function validasiBerkas(file) {
  if (!file) return null;
  const nama = file.name.toLowerCase();
  const ekstensiSah = EKSTENSI_DITERIMA.some((ekstensi) => nama.endsWith(ekstensi));
  if (!ekstensiSah) {
    return `Tipe berkas tidak didukung. Gunakan ${TEKS_EKSTENSI}.`;
  }
  if (file.size > MAKS_UKURAN_BERKAS) {
    return `Ukuran berkas ${formatUkuran(file.size)} melebihi batas 10 MB.`;
  }
  return null;
}

function gayaStatus(status) {
  switch (status) {
    case 'terkumpul':
      return { backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', label: 'Terkumpul' };
    case 'dinilai':
      return { backgroundColor: 'var(--surface-alt)', color: 'var(--text)', label: 'Dinilai' };
    case 'terlambat':
      return { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', label: 'Terlambat' };
    default:
      return { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', label: 'Belum Dikumpulkan' };
  }
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

const gayaInputTersembunyi = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const barisMetaStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  fontSize: '0.88rem',
};

/**
 * Dropzone unggah berkas: klik atau seret-lepas, memvalidasi tipe (.pdf, .docx,
 * .zip) dan ukuran (maks 10 MB), lalu menampilkan ringkasan berkas terpilih
 * beserta tombol kirim.
 */
function DropzoneUnggah({ berkas, galat, dragAktif, onPilih, onKirim, onBersihkan, onDragAktif, onDragKeluar }) {
  const inputRef = useRef(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {berkas ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid var(--border)',
            backgroundColor: 'var(--primary-soft)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
          }}
        >
          <FileText size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', overflowWrap: 'anywhere' }}>{berkas.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {formatUkuran(berkas.size)} · siap dikirim
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onBersihkan}
            aria-label={`Hapus berkas terpilih ${berkas.name}`}
            style={{ minHeight: 34, padding: '6px 10px', flexShrink: 0 }}
          >
            <X size={15} />
          </button>
        </div>
      ) : null}

      {!berkas ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            onDragAktif();
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) onDragKeluar();
          }}
          onDrop={(event) => {
            event.preventDefault();
            onDragKeluar();
            const file = event.dataTransfer?.files?.[0];
            if (file) onPilih(file);
          }}
          style={{
            border: `2px dashed ${dragAktif ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: dragAktif ? 'var(--primary-soft)' : 'transparent',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            textAlign: 'center',
            transition: 'border-color 0.15s ease, background-color 0.15s ease',
          }}
        >
          <Upload size={20} color="var(--text-muted)" aria-hidden="true" />
          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Tarik &amp; letakkan berkas di sini</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>atau</div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => inputRef.current?.click()}
            style={{ minHeight: 36, padding: '6px 14px' }}
          >
            <Upload size={15} />
            <span>Pilih Berkas</span>
          </button>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {TEKS_EKSTENSI} · maksimal 10 MB
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.zip"
            style={gayaInputTersembunyi}
            aria-label={`Pilih berkas tugas (${TEKS_EKSTENSI}, maksimal 10 MB)`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPilih(file);
              event.target.value = '';
            }}
          />
        </div>
      ) : null}

      {galat ? (
        <div
          role="alert"
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
          <p style={{ margin: 0, fontSize: '0.82rem' }}>{galat}</p>
        </div>
      ) : null}

      <button type="button" className="btn btn-primary" disabled={!berkas} onClick={onKirim} style={!berkas ? { opacity: 0.65, cursor: 'not-allowed' } : null}>
        <Send size={15} />
        <span>Kirim Tugas</span>
      </button>
    </div>
  );
}

export default function TugasFeature() {
  const [tugasList, setTugasList] = useState(() => [...DAFTAR_TUGAS]);
  const [tab, setTab] = useState('perlu');
  const [berkasTerpilih, setBerkasTerpilih] = useState({});
  const [galatUnggah, setGalatUnggah] = useState({});
  const [unggahDibuka, setUnggahDibuka] = useState(() => new Set());
  const [dropzoneAktif, setDropzoneAktif] = useState(null);
  const [konfirmasi, setKonfirmasi] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const TABS = [
    { id: 'semua', label: 'Semua', filter: () => true },
    { id: 'perlu', label: 'Perlu Dikerjakan', filter: (tugas) => tugas.status === 'belum-dikumpulkan' },
    { id: 'menunggu', label: 'Menunggu Dinilai', filter: (tugas) => tugas.status === 'terkumpul' },
    {
      id: 'dinilai',
      label: 'Sudah Dinilai',
      filter: (tugas) => tugas.status === 'dinilai' || tugas.status === 'terlambat',
    },
  ];

  const hitungJumlah = (filter) => tugasList.filter(filter).length;
  const tabAktif = TABS.find((item) => item.id === tab) ?? TABS[0];
  const daftarTersaring = tabAktif.filter
    ? [...tugasList].filter(tabAktif.filter).sort((a, b) => a.tenggat.localeCompare(b.tenggat))
    : [];

  const toggleUnggah = (id) => {
    setUnggahDibuka((sebelumnya) => {
      const berikut = new Set(sebelumnya);
      if (berikut.has(id)) {
        berikut.delete(id);
      } else {
        berikut.add(id);
      }
      return berikut;
    });
  };

  const pilihBerkas = (tugasId, file) => {
    const galat = validasiBerkas(file);
    setGalatUnggah((sebelumnya) => ({ ...sebelumnya, [tugasId]: galat }));
    setBerkasTerpilih((sebelumnya) => {
      const berikut = { ...sebelumnya };
      if (galat) {
        delete berikut[tugasId];
      } else {
        berikut[tugasId] = file;
      }
      return berikut;
    });
  };

  const bersihkanBerkas = (tugasId) => {
    setBerkasTerpilih((sebelumnya) => {
      const berikut = { ...sebelumnya };
      delete berikut[tugasId];
      return berikut;
    });
    setGalatUnggah((sebelumnya) => ({ ...sebelumnya, [tugasId]: null }));
  };

  const kirimTugas = (tugas) => {
    const file = berkasTerpilih[tugas.id];
    if (!file || validasiBerkas(file)) return;

    // Pembaruan status real-time: tugas langsung menjadi "terkumpul".
    setTugasList((sebelumnya) =>
      sebelumnya.map((item) =>
        item.id === tugas.id
          ? { ...item, status: 'terkumpul', namaBerkas: file.name, diunggahPada: isoWaktuLokal(new Date()) }
          : item,
      ),
    );
    bersihkanBerkas(tugas.id);
    setUnggahDibuka((sebelumnya) => {
      const berikut = new Set(sebelumnya);
      berikut.delete(tugas.id);
      return berikut;
    });
    setKonfirmasi({ judul: tugas.judul });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setKonfirmasi(null), 6000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div
          role="tablist"
          aria-label="Filter status tugas"
          onKeyDown={(event) => {
            const index = TABS.findIndex((item) => item.id === tab);
            let target = null;
            if (event.key === 'ArrowRight') target = (index + 1) % TABS.length;
            else if (event.key === 'ArrowLeft') target = (index - 1 + TABS.length) % TABS.length;
            else if (event.key === 'Home') target = 0;
            else if (event.key === 'End') target = TABS.length - 1;
            if (target != null) {
              event.preventDefault();
              setTab(TABS[target].id);
            }
          }}
          style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'thin' }}
        >
          {TABS.map((itemTab, index) => {
            const aktif = tab === itemTab.id;
            const jumlah = hitungJumlah(itemTab.filter);
            return (
              <button
                key={itemTab.id}
                type="button"
                role="tab"
                id={`tab-tugas-${itemTab.id}`}
                aria-selected={aktif}
                aria-controls="panel-tugas"
                aria-label={`${itemTab.label}, ${jumlah} tugas`}
                tabIndex={aktif ? 0 : -1}
                className={`btn ${aktif ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTab(itemTab.id)}
                style={{ flexShrink: 0, whiteSpace: 'nowrap', minHeight: 40, padding: '8px 14px' }}
              >
                <span>{itemTab.label}</span>
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
                  {jumlah}
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id="panel-tugas" aria-labelledby={`tab-tugas-${tab}`} style={{ paddingTop: 14 }}>
          {konfirmasi ? (
            <div
              role="status"
              style={{
                backgroundColor: 'var(--primary-soft)',
                borderLeft: '3px solid var(--primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                <strong>“{konfirmasi.judul}”</strong> terkumpul — kini berada di kategori Menunggu Dinilai.
              </p>
            </div>
          ) : null}

          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Menampilkan {daftarTersaring.length} dari {tugasList.length} tugas.
          </p>

          {daftarTersaring.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '20px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <Inbox size={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                  Tidak ada tugas pada kategori ini.
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                  Coba kategori lain untuk melihat tugas Anda.
                </p>
                {tab !== 'semua' ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setTab('semua')}
                    style={{ marginTop: 10, minHeight: 36 }}
                  >
                    <span>Lihat Semua Tugas</span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 12,
              }}
            >
              {daftarTersaring.map((tugas) => {
                const gayaStatusTugas = gayaStatus(tugas.status);
                const tenggatInfo = uraianTenggat(tugas);
                const berkas = berkasTerpilih[tugas.id];
                const galat = galatUnggah[tugas.id];
                const sudahDikumpulkan = tugas.status === 'terkumpul';
                const sudahDinilai = tugas.status === 'dinilai' || tugas.status === 'terlambat';

                return (
                  <article
                    key={tugas.id}
                    className="card"
                    style={{
                      padding: 16,
                      margin: 0,
                      boxShadow: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
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
                      <span className="badge" style={{ backgroundColor: gayaStatusTugas.backgroundColor, color: gayaStatusTugas.color }}>
                        <span>{gayaStatusTugas.label}</span>
                      </span>
                      <span
                        className="badge"
                        style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }}
                      >
                        <span>{tugas.jenis}</span>
                      </span>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.35 }}>{tugas.judul}</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={chipKodeStyle}>{tugas.kodeMk}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tugas.mataKuliah}</span>
                      </div>
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
                      <div style={barisMetaStyle}>
                        <CalendarClock
                          size={15}
                          color={tenggatInfo.mendesak ? 'var(--danger)' : 'var(--text-muted)'}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <span
                          style={{
                            color: tenggatInfo.mendesak ? 'var(--danger)' : 'var(--text)',
                            fontWeight: tenggatInfo.mendesak ? 600 : 400,
                          }}
                        >
                          Tenggat {formatTanggalSingkat(t.tenggat)}, {formatJam(t.tenggat)}
                        </span>
                        {tenggatInfo.label ? (
                          <span
                            className="badge"
                            style={
                              tenggatInfo.mendesak
                                ? { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }
                                : { backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }
                            }
                          >
                            {tenggatInfo.mendesak ? <TriangleAlert size={11} /> : null}
                            <span>{tenggatInfo.mendesak ? `Mendesak · ${tenggatInfo.label}` : tenggatInfo.label}</span>
                          </span>
                        ) : null}
                      </div>
                      <div style={barisMetaStyle}>
                        <Flag
                          size={15}
                          color={tugas.prioritas === 'tinggi' ? 'var(--danger)' : 'var(--text-muted)'}
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <span
                          className="badge"
                          style={
                            tugas.prioritas === 'tinggi'
                              ? { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }
                              : { backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }
                          }
                        >
                          <span>Prioritas {tugas.prioritas.charAt(0).toUpperCase() + tugas.prioritas.slice(1)}</span>
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tugas.bobot}</span>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {tugas.deskripsi}
                    </p>

                    {sudahDinilai ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'stretch' }}>
                        <div
                          style={{
                            backgroundColor: 'var(--primary-soft)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 96,
                          }}
                        >
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {tugas.nilai}
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                            /100 · Huruf {hurufDariNilai(tugas.nilai)}
                          </div>
                        </div>
                        <div
                          style={{
                            flex: '1 1 220px',
                            backgroundColor: 'var(--surface-alt)',
                            borderLeft: '3px solid var(--primary)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 12px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--primary)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>Umpan Balik Dosen</span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', lineHeight: 1.5 }}>
                            {tugas.catatanDosen}
                          </p>
                          <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            — {tugas.dosen}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {sudahDikumpulkan || tugas.status === 'terlambat' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                        }}
                      >
                        <FileText size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, overflowWrap: 'anywhere' }}>
                            {tugas.namaBerkas}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Diunggah {formatTanggalSingkat(tugas.diunggahPada)}, {formatJam(tugas.diunggahPada)}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {tugas.status === 'belum-dikumpulkan' ? (
                      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}>
                        <DropzoneUnggah
                          berkas={berkas}
                          galat={galat}
                          dragAktif={dropzoneAktif === tugas.id}
                          onPilih={(file) => pilihBerkas(tugas.id, file)}
                          onKirim={() => kirimTugas(tugas)}
                          onBersihkan={() => bersihkanBerkas(tugas.id)}
                          onDragAktif={() => setDropzoneAktif(tugas.id)}
                          onDragKeluar={() => setDropzoneAktif((sebelumnya) => (sebelumnya === tugas.id ? null : sebelumnya))}
                        />
                      </div>
                    ) : null}

                    {sudahDikumpulkan ? (
                      unggahDibuka.has(tugas.id) ? (
                        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                              marginBottom: 8,
                            }}
                          >
                            Perbarui berkas pengumpulan
                          </div>
                          <DropzoneUnggah
                            berkas={berkas}
                            galat={galat}
                            dragAktif={dropzoneAktif === tugas.id}
                            onPilih={(file) => pilihBerkas(tugas.id, file)}
                            onKirim={() => kirimTugas(tugas)}
                            onBersihkan={() => bersihkanBerkas(tugas.id)}
                            onDragAktif={() => setDropzoneAktif(tugas.id)}
                            onDragKeluar={() => setDropzoneAktif((sebelumnya) => (sebelumnya === tugas.id ? null : sebelumnya))}
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => toggleUnggah(tugas.id)}
                          style={{ minHeight: 36, alignSelf: 'flex-start' }}
                        >
                          <Upload size={15} />
                          <span>Perbarui Berkas</span>
                        </button>
                      )
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
