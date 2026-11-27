import { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Info,
  Lock,
  MapPin,
  Plus,
  Printer,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import {
  KRS_CATALOG,
  KRS_META,
  cekBentrokJadwal,
} from '../../data/academicMockData.js';

const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const pad2 = (angka) => String(angka).padStart(2, '0');

function formatTanggalIndo(iso) {
  const [bagianTanggal, bagianJam] = String(iso).split('T');
  const [tahun, bulan, tanggal] = bagianTanggal.split('-');
  const teksTanggal = `${Number(tanggal)} ${BULAN_SINGKAT[Number(bulan) - 1]} ${tahun}`;
  return bagianJam ? `${teksTanggal}, ${bagianJam}` : teksTanggal;
}

function formatJam(date) {
  return `${pad2(date.getHours())}.${pad2(date.getMinutes())}`;
}

/**
 * Deteksi bentrok terhadap jadwal efektif mahasiswa:
 *  1. cekBentrokJadwal (data layer) membandingkan kandidat dengan WEEKLY_SCHEDULE;
 *     hasilnya disaring hanya untuk kelas yang MASIH dipilih agar realtime
 *     mengikuti aksi ambil/hapus pengguna.
 *  2. Kelas yang baru ditambahkan belum tercatat di jadwal statis, sehingga
 *     tumpang tindihnya dicek langsung antar kandidat KRS yang dipilih.
 * Jadwal statis memakai format "HH:MM" sehingga perbandingan string aman.
 */
function bentrokJadwalEfektif(item, dipilih) {
  const kodeDipilih = new Set(dipilih.map((kelas) => kelas.kode));

  const dariJadwal = cekBentrokJadwal({ ...item, sudahDiambil: false }).filter((bentrok) =>
    kodeDipilih.has(bentrok.kode),
  );

  const dariKrsBaru = dipilih
    .filter((kelas) => !kelas.sudahDiambil && kelas.kode !== item.kode)
    .filter(
      (kelas) =>
        kelas.hari === item.hari &&
        kelas.jamMulai < item.jamSelesai &&
        kelas.jamSelesai > item.jamMulai,
    )
    .map((kelas) => ({
      hari: kelas.hari,
      kode: kelas.kode,
      mataKuliah: kelas.nama,
      jenis: 'KRS Dipilih',
      jamMulai: kelas.jamMulai,
      jamSelesai: kelas.jamSelesai,
      ruang: kelas.ruang,
      isKelasPengganti: false,
    }));

  return [...dariJadwal, ...dariKrsBaru];
}

/**
 * Status kandidat kelas: alasan tombol dinonaktifkan bila bentrok,
 * kuota penuh, SKS tidak cukup, sudah dipilih, atau KRS terkunci.
 */
function hitungStatusKelas(item, dipilih, { sisaSks, terkunci }) {
  const sudahDipilih = dipilih.some((kelas) => kelas.kode === item.kode);
  const bentrokList = bentrokJadwalEfektif(item, dipilih);
  const kuotaPenuh = item.kuotaTerisi >= item.kuota;
  const sksTidakCukup = item.sks > sisaSks;
  const bisaDiambil = !sudahDipilih && !terkunci && bentrokList.length === 0 && !kuotaPenuh && !sksTidakCukup;

  let labelTombol = 'Ambil Kelas';
  if (sudahDipilih) labelTombol = 'Sudah di KRS';
  else if (terkunci) labelTombol = 'Menunggu Validasi';
  else if (bentrokList.length > 0) labelTombol = 'Bentrok Jadwal';
  else if (kuotaPenuh) labelTombol = 'Kelas Penuh';
  else if (sksTidakCukup) labelTombol = 'SKS Tidak Cukup';

  return { sudahDipilih, bentrokList, kuotaPenuh, sksTidakCukup, bisaDiambil, labelTombol };
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

const barisMetaStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  fontSize: '0.88rem',
  lineHeight: 1.45,
};

const gayaPeringatan = {
  backgroundColor: 'var(--danger-soft)',
  borderLeft: '3px solid var(--danger)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
};

export default function KrsFeature() {
  const [dipilih, setDipilih] = useState(() => KRS_CATALOG.filter((item) => item.sudahDiambil));
  const [tab, setTab] = useState('tersedia');
  const [tampilkanLintas, setTampilkanLintas] = useState(false);
  const [kueri, setKueri] = useState('');
  const [statusPengajuan, setStatusPengajuan] = useState('draft');
  const [waktuPengajuan, setWaktuPengajuan] = useState(null);
  const tabRefs = useRef([]);

  const sksDipilih = dipilih.reduce((total, kelas) => total + kelas.sks, 0);
  const sisaSks = KRS_META.batasSks - sksDipilih;
  const terkunci = statusPengajuan !== 'draft';
  const persenSks = Math.min(100, Math.round((sksDipilih / KRS_META.batasSks) * 100));

  const daftarTersaring = useMemo(() => {
    const kata = kueri.trim().toLowerCase();
    return KRS_CATALOG.filter((item) => tampilkanLintas || item.isSemesterSesuai).filter(
      (item) =>
        !kata ||
        item.kode.toLowerCase().includes(kata) ||
        item.nama.toLowerCase().includes(kata),
    );
  }, [tampilkanLintas, kueri]);

  const navigasiTab = (event) => {
    const daftarTab = ['tersedia', 'dipilih'];
    const index = daftarTab.indexOf(tab);
    let target = null;

    if (event.key === 'ArrowRight') target = (index + 1) % daftarTab.length;
    else if (event.key === 'ArrowLeft') target = (index - 1 + daftarTab.length) % daftarTab.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = daftarTab.length - 1;

    if (target != null) {
      event.preventDefault();
      setTab(daftarTab[target]);
      tabRefs.current[target]?.focus();
    }
  };

  const ambilKelas = (item) => {
    setDipilih((sebelumnya) =>
      sebelumnya.some((kelas) => kelas.kode === item.kode) ? sebelumnya : [...sebelumnya, item],
    );
  };

  const hapusKelas = (kode) => {
    setDipilih((sebelumnya) => sebelumnya.filter((kelas) => kelas.kode !== kode));
  };

  const ajukanKrs = () => {
    setWaktuPengajuan(new Date());
    setStatusPengajuan('menunggu-validasi');
  };

  const batalkanPengajuan = () => {
    setStatusPengajuan('draft');
    setWaktuPengajuan(null);
  };

  const cetakKrs = () => {
    setTab('dipilih');
    window.setTimeout(() => window.print(), 150);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner status periode KRS */}
      <div
        className="card"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge">
              <Lock size={12} />
              <span>{KRS_META.periode}</span>
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
              {KRS_META.statusLabel}
            </span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Kartu Rencana Studi</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Tenggat pengisian: {formatTanggalIndo(KRS_META.tenggatPengisian)} · Validator: {KRS_META.validator}
            </p>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{KRS_META.catatan}</p>
        </div>

        <div
          style={{
            flex: '1 1 260px',
            minWidth: 240,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 14,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-alt)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SKS Diambil</span>
            <span style={{ fontWeight: 700 }}>
              <span style={{ fontSize: '1.5rem' }}>{sksDipilih}</span>
              <span style={{ color: 'var(--text-muted)' }}> / {KRS_META.batasSks} SKS</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`SKS diambil semester ini: ${sksDipilih} dari ${KRS_META.batasSks}`}
            aria-valuemin={0}
            aria-valuemax={KRS_META.batasSks}
            aria-valuenow={sksDipilih}
            style={{ height: 8, borderRadius: 999, backgroundColor: 'var(--surface)' }}
          >
            <div
              style={{
                width: `${persenSks}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: sisaSks < 0 ? 'var(--danger)' : 'var(--primary)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.82rem',
              color: sisaSks < 0 ? 'var(--danger)' : 'var(--text-muted)',
              fontWeight: sisaSks < 0 ? 600 : 400,
            }}
          >
            {sisaSks > 0
              ? `Sisa ${sisaSks} SKS untuk pengambilan kelas baru.`
              : sisaSks === 0
                ? 'Batas maksimal SKS tercapai.'
                : `Melebihi batas ${Math.abs(sisaSks)} SKS — hapus beberapa kelas.`}
          </p>
        </div>
      </div>

      <div className="card">
        <div
          role="tablist"
          aria-label="Bagian KRS"
          onKeyDown={navigasiTab}
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 10,
            borderBottom: '1px solid var(--border)',
            scrollbarWidth: 'thin',
          }}
        >
          {[
            { id: 'tersedia', label: 'Kelas Tersedia' },
            { id: 'dipilih', label: 'KRS Dipilih' },
          ].map((itemTab, index) => {
            const aktif = tab === itemTab.id;
            const jumlah = itemTab.id === 'dipilih' ? dipilih.length : daftarTersaring.length;
            return (
              <button
                key={itemTab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`tab-krs-${itemTab.id}`}
                aria-selected={aktif}
                aria-controls="panel-krs"
                aria-label={`${itemTab.label}, ${jumlah} mata kuliah`}
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

        <div role="tabpanel" id="panel-krs" aria-labelledby={`tab-krs-${tab}`}>
          {tab === 'tersedia' ? (
            <div style={{ paddingTop: 16 }}>
              {terkunci ? (
                <div
                  role="status"
                  style={{
                    ...gayaPeringatan,
                    backgroundColor: 'var(--primary-soft)',
                    borderLeftColor: 'var(--primary)',
                    marginBottom: 14,
                  }}
                >
                  <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>
                    KRS sedang menunggu validasi DPA — pengambilan kelas dinonaktifkan sementara.
                  </p>
                </div>
              ) : null}

              {/* Filter: default semester sendiri, toggle lintas semester, dan pencarian */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 220 }}>
                  <Search
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Cari kode atau nama mata kuliah…"
                    aria-label="Cari mata kuliah berdasarkan kode atau nama"
                    value={kueri}
                    onChange={(event) => setKueri(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={tampilkanLintas}
                  className="btn btn-ghost"
                  onClick={() => setTampilkanLintas(nilai => !nilai)}
                  style={{
                    ...(tampilkanLintas
                      ? { backgroundColor: 'var(--primary)', color: 'var(--primary-text)', borderColor: 'var(--primary)' }
                      : null),
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 34,
                      height: 20,
                      borderRadius: 999,
                      padding: 2,
                      flexShrink: 0,
                      display: 'inline-flex',
                      justifyContent: tampilkanLintas ? 'flex-end' : 'flex-start',
                      backgroundColor: tampilkanLintas ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        backgroundColor: tampilkanLintas ? 'var(--primary-text)' : 'var(--surface)',
                      }}
                    />
                  </span>
                  <span>Tampilkan Lintas Semester</span>
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                  margin: '12px 0 14px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span
                  className="badge"
                  style={
                    tampilkanLintas
                      ? { backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }
                      : null
                  }
                >
                  <SlidersHorizontal size={12} />
                  <span>
                    {tampilkanLintas
                      ? 'Semua Semester (termasuk lintas semester)'
                      : 'Mata Kuliah Semester Saya (Semester 5)'}
                  </span>
                </span>
                <span>
                  Menampilkan {daftarTersaring.length} dari {KRS_CATALOG.length} mata kuliah.
                </span>
              </div>

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
                  <Search size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                      Tidak ada mata kuliah yang cocok.
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                      Coba kata kunci lain atau aktifkan “Tampilkan Lintas Semester”.
                    </p>
                    {kueri ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setKueri('')}
                        style={{ marginTop: 10, minHeight: 36 }}
                      >
                        <X size={15} />
                        <span>Bersihkan Pencarian</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 12,
                  }}
                >
                  {daftarTersaring.map((item) => {
                    const status = hitungStatusKelas(item, dipilih, { sisaSks, terkunci });
                    const kuotaPenuh = item.kuotaTerisi >= item.kuota;
                    const persenKuota = Math.round((item.kuotaTerisi / item.kuota) * 100);

                    return (
                      <article
                        key={item.id}
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
                          <span style={chipKodeStyle}>{item.kode}</span>
                          <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                            <span
                              className="badge"
                              style={
                                item.isSemesterSesuai
                                  ? null
                                  : { backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }
                              }
                            >
                              <span>Semester {item.semesterKurikulum}</span>
                            </span>
                            <span
                              className="badge"
                              style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }}
                            >
                              <span>{item.jenis}</span>
                            </span>
                          </span>
                        </div>

                        <h4 style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.35 }}>{item.nama}</h4>

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
                            <Clock size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>
                              {item.hari} · {item.jamMulai}–{item.jamSelesai}
                            </span>
                          </div>
                          <div style={barisMetaStyle}>
                            <MapPin size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{item.ruang}</span>
                          </div>
                          <div style={barisMetaStyle}>
                            <UserRound size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{item.dosen}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: 8,
                                  fontSize: '0.82rem',
                                }}
                              >
                                <span style={{ color: 'var(--text-muted)' }}>Kuota</span>
                                <span style={{ fontWeight: 600, color: kuotaPenuh ? 'var(--danger)' : 'var(--text)' }}>
                                  {item.kuotaTerisi}/{item.kuota}{kuotaPenuh ? ' · Penuh' : ''}
                                </span>
                              </div>
                              <div style={{ height: 5, borderRadius: 999, backgroundColor: 'var(--surface-alt)', marginTop: 4 }}>
                                <div
                                  style={{
                                    width: `${persenKuota}%`,
                                    height: '100%',
                                    borderRadius: 999,
                                    backgroundColor: kuotaPenuh ? 'var(--danger)' : 'var(--primary)',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          {item.prasyarat.length > 0 ? (
                            <div style={barisMetaStyle}>
                              <Info size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                              <span style={{ color: 'var(--text-muted)' }}>
                                Prasyarat: {item.prasyarat.join(', ')}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {!status.sudahDipilih && status.bentrokList.length > 0 ? (
                          <div style={gayaPeringatan}>
                            <TriangleAlert size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.85rem' }}>
                                Bentrok Jadwal Kuliah
                              </div>
                              <ul
                                style={{
                                  margin: '4px 0 0',
                                  paddingLeft: 16,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 2,
                                }}
                              >
                                {status.bentrokList.map((bentrok) => (
                                  <li key={`${bentrok.kode}-${bentrok.jamMulai}`} style={{ fontSize: '0.82rem' }}>
                                    {bentrok.hari} {bentrok.jamMulai}–{bentrok.jamSelesai} · {bentrok.kode}{' '}
                                    {bentrok.mataKuliah}
                                    {bentrok.isKelasPengganti ? ' (Kelas Pengganti)' : ''}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : null}

                        {!status.sudahDipilih && status.kuotaPenuh ? (
                          <div style={gayaPeringatan}>
                            <TriangleAlert size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ margin: 0, fontSize: '0.82rem' }}>
                              Kuota kelas sudah penuh ({item.kuotaTerisi}/{item.kuota}).
                            </p>
                          </div>
                        ) : null}

                        {!status.sudahDipilih && !status.kuotaPenuh && status.sksTidakCukup ? (
                          <div style={gayaPeringatan}>
                            <TriangleAlert size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ margin: 0, fontSize: '0.82rem' }}>
                              Butuh {item.sks} SKS, sisa kuota SKS Anda {sisaSks} SKS.
                            </p>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          className={`btn ${status.bisaDiambil ? 'btn-primary' : 'btn-ghost'}`}
                          disabled={!status.bisaDiambil}
                          onClick={() => ambilKelas(item)}
                          style={{
                            marginTop: 'auto',
                            ...(status.bisaDiambil ? null : { opacity: 0.65, cursor: 'not-allowed' }),
                          }}
                        >
                          {status.bisaDiambil ? <Plus size={16} /> : <Lock size={15} />}
                          <span>{status.labelTombol}</span>
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {terkunci ? (
                <div
                  role="status"
                  style={{
                    backgroundColor: 'var(--primary-soft)',
                    borderLeft: '3px solid var(--primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      KRS berhasil diajukan pukul {formatJam(waktuPengajuan)} — menunggu validasi.
                    </div>
                    <p style={{ margin: '2px 0 0' }}>
                      Validator: {KRS_META.validator}. Perubahan kelas terkunci selama menunggu validasi; batalkan
                      pengajuan bila ingin menyesuaikan kelas.
                    </p>
                  </div>
                </div>
              ) : null}

              {dipilih.length === 0 ? (
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
                  <ClipboardList size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>Belum ada mata kuliah dipilih.</div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                      Buka tab “Kelas Tersedia” untuk menambah kelas ke KRS Anda.
                    </p>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setTab('tersedia')}
                      style={{ marginTop: 10, minHeight: 36 }}
                    >
                      <span>Buka Kelas Tersedia</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {dipilih.map((item) => (
                    <article
                      key={item.id}
                      className="card"
                      style={{
                        padding: 14,
                        margin: 0,
                        boxShadow: 'none',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          <span style={chipKodeStyle}>{item.kode}</span>
                          <span
                            className="badge"
                            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                          >
                            <span>{item.sks} SKS</span>
                          </span>
                          <span
                            className="badge"
                            style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }}
                          >
                            <span>{item.jenis}</span>
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{item.nama}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {item.hari} · {item.jamMulai}–{item.jamSelesai} · {item.ruang} · {item.dosen}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => hapusKelas(item.kode)}
                        disabled={terkunci}
                        aria-label={`Hapus ${item.nama} dari KRS`}
                        style={terkunci ? { opacity: 0.65, cursor: 'not-allowed' } : null}
                      >
                        <Trash2 size={15} />
                        <span>Hapus</span>
                      </button>
                    </article>
                  ))}

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border)',
                      paddingTop: 14,
                      marginTop: 4,
                    }}
                  >
                    <div style={{ fontSize: '0.92rem' }}>
                      <strong>{dipilih.length} mata kuliah</strong> · <strong>{sksDipilih} SKS</strong>
                      <span style={{ color: 'var(--text-muted)' }}> dari batas {KRS_META.batasSks} SKS</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={cetakKrs}
                        disabled={dipilih.length === 0}
                      >
                        <Printer size={16} />
                        <span>Cetak KRS</span>
                      </button>
                      {terkunci ? (
                        <button type="button" className="btn btn-ghost" onClick={batalkanPengajuan}>
                          <X size={16} />
                          <span>Batalkan Pengajuan</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={ajukanKrs}
                          disabled={dipilih.length === 0}
                        >
                          <Send size={16} />
                          <span>Ajukan KRS</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
