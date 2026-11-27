// ============================================================================
// Data dummy akademik SILINCAH
// Profil: mahasiswa aktif Semester 5 Teknik Informatika — NIM 20260001
// (identik dengan akun demo pada demoAccount.js).
//
// Mendukung 4 fitur utama:
//   1. Jadwal Kuliah   -> WEEKLY_SCHEDULE (Senin-Sabtu, 1 penanda kelas pengganti)
//   2. KRS             -> KRS_CATALOG + KRS_META (filter semester & deteksi bentrok)
//   3. Nilai/Transkrip -> KHS_HISTORY (Semester 1-5, komponen nilai, IPK kumulatif)
//   4. Tugas           -> DAFTAR_TUGAS (aktif & selesai: tenggat, status, nilai, catatan)
//   5. Presensi        -> presensiCourses (8 MK Semester 5, 14 pertemuan per MK)
//
// Semua helper bersifat murni (tanpa state/efek samping) agar mudah dipakai UI
// dan mudah diganti dengan API sungguhan nanti.
// ============================================================================

export const STUDENT_PROFILE = {
  nim: '20260001',
  nama: 'Mahasiswa Demo',
  programStudi: 'Teknik Informatika',
  fakultas: 'Fakultas Teknik',
  kelas: 'TI-5A',
  semesterAktif: 5,
  tahunAkademik: '2026/2027',
  periode: 'Ganjil',
  status: 'Aktif',
  dpa: 'Dr. Ratna Kusuma, M.Kom.',
};

// Bobot komponen nilai (dalam persen) untuk perhitungan nilai akhir KHS.
export const NILAI_BOBOT = {
  kehadiran: 15,
  tugas: 25,
  uts: 30,
  uas: 30,
};

// Skala huruf -> bobot, dengan batas minimal nilai akhir.
export const GRADE_SCALE = [
  { huruf: 'A', bobot: 4.0, batasMinimal: 85 },
  { huruf: 'A-', bobot: 3.7, batasMinimal: 80 },
  { huruf: 'B+', bobot: 3.3, batasMinimal: 75 },
  { huruf: 'B', bobot: 3.0, batasMinimal: 70 },
  { huruf: 'B-', bobot: 2.7, batasMinimal: 65 },
  { huruf: 'C+', bobot: 2.5, batasMinimal: 60 },
  { huruf: 'C', bobot: 2.0, batasMinimal: 55 },
  { huruf: 'D', bobot: 1.0, batasMinimal: 45 },
  { huruf: 'E', bobot: 0.0, batasMinimal: 0 },
];

const bulatkan = (nilai) => Math.round(nilai * 100) / 100;

function ambilHuruf(nilai) {
  const skala = GRADE_SCALE.find((item) => nilai >= item.batasMinimal);
  return skala ? skala.huruf : 'E';
}

function ambilBobot(huruf) {
  const skala = GRADE_SCALE.find((item) => item.huruf === huruf);
  return skala ? skala.bobot : 0;
}

function jamKeMenit(jam) {
  const [jamAngka, menitAngka] = jam.split(':').map(Number);
  return jamAngka * 60 + menitAngka;
}

// ============================================================================
// 1. JADWAL KULIAH MINGGUAN (Senin-Sabtu)
//    Hanya satu kelas berpenanda isKelasPengganti: true (Jumat, IMK).
// ============================================================================

export const WEEKLY_SCHEDULE = [
  {
    id: 'senin',
    hari: 'Senin',
    kelasList: [
      {
        id: 'senin-if30501-teori',
        kode: 'IF-30501',
        mataKuliah: 'Pemrograman Web Lanjut',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '07:30',
        jamSelesai: '10:00',
        ruang: 'Lab Komputer 2',
        dosen: 'Yusuf Ardiansyah, S.T., M.T.I.',
        isKelasPengganti: false,
        catatan: null,
      },
      {
        id: 'senin-if30502-teori',
        kode: 'IF-30502',
        mataKuliah: 'Kecerdasan Buatan',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '10:15',
        jamSelesai: '12:45',
        ruang: 'R. 301',
        dosen: 'Dr. Ratna Kusuma, M.Kom.',
        isKelasPengganti: false,
        catatan: null,
      },
    ],
  },
  {
    id: 'selasa',
    hari: 'Selasa',
    kelasList: [
      {
        id: 'selasa-if30505-teori',
        kode: 'IF-30505',
        mataKuliah: 'Jaringan Komputer',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '08:00',
        jamSelesai: '10:30',
        ruang: 'R. 302',
        dosen: 'Ir. Bambang Wijaya, M.T.',
        isKelasPengganti: false,
        catatan: null,
      },
      {
        id: 'selasa-if30505-praktikum',
        kode: 'IF-30505',
        mataKuliah: 'Jaringan Komputer',
        kelas: 'TI-5A',
        jenis: 'Praktikum',
        jamMulai: '13:00',
        jamSelesai: '15:30',
        ruang: 'Lab Jaringan',
        dosen: 'Andi Pratama, S.Kom. (Asisten Praktikum)',
        isKelasPengganti: false,
        catatan: null,
      },
    ],
  },
  {
    id: 'rabu',
    hari: 'Rabu',
    kelasList: [
      {
        id: 'rabu-if30504-teori',
        kode: 'IF-30504',
        mataKuliah: 'Interaksi Manusia dan Komputer',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '07:30',
        jamSelesai: '10:00',
        ruang: 'R. 305',
        dosen: 'Prof. Dr. Siti Rahmawati, M.T.',
        isKelasPengganti: false,
        catatan: null,
      },
      {
        id: 'rabu-if30503-teori',
        kode: 'IF-30503',
        mataKuliah: 'Rekayasa Perangkat Lunak',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '10:15',
        jamSelesai: '12:45',
        ruang: 'R. 303',
        dosen: 'Ahmad Fauzi, M.Kom.',
        isKelasPengganti: false,
        catatan: null,
      },
      {
        id: 'rabu-if30506-teori',
        kode: 'IF-30506',
        mataKuliah: 'Basis Data Lanjut',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '13:00',
        jamSelesai: '15:30',
        ruang: 'R. 306',
        dosen: 'Dewi Lestari, M.Kom.',
        isKelasPengganti: false,
        catatan: null,
      },
    ],
  },
  {
    id: 'kamis',
    hari: 'Kamis',
    kelasList: [
      {
        id: 'kamis-if30507-teori',
        kode: 'IF-30507',
        mataKuliah: 'Metodologi Penelitian',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '08:00',
        jamSelesai: '10:30',
        ruang: 'R. 304',
        dosen: 'Dr. Hendra Gunawan, M.Si.',
        isKelasPengganti: false,
        catatan: null,
      },
      {
        id: 'kamis-if30501-praktikum',
        kode: 'IF-30501',
        mataKuliah: 'Pemrograman Web Lanjut',
        kelas: 'TI-5A',
        jenis: 'Praktikum',
        jamMulai: '13:00',
        jamSelesai: '15:30',
        ruang: 'Lab Komputer 1',
        dosen: 'Rina Marlina, S.Kom. (Asisten Praktikum)',
        isKelasPengganti: false,
        catatan: null,
      },
    ],
  },
  {
    id: 'jumat',
    hari: 'Jumat',
    kelasList: [
      {
        id: 'jumat-if30504-pengganti',
        kode: 'IF-30504',
        mataKuliah: 'Interaksi Manusia dan Komputer',
        kelas: 'TI-5A',
        jenis: 'Teori',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruang: 'R. 305',
        dosen: 'Prof. Dr. Siti Rahmawati, M.T.',
        isKelasPengganti: true,
        catatan:
          'Kelas pengganti untuk Pertemuan ke-12 (Rabu, 18 November 2026) yang dibatalkan karena dosen mengikuti diklat. Wajib hadir.',
      },
    ],
  },
  {
    id: 'sabtu',
    hari: 'Sabtu',
    kelasList: [
      {
        id: 'sabtu-if30502-praktikum',
        kode: 'IF-30502',
        mataKuliah: 'Kecerdasan Buatan',
        kelas: 'TI-5A',
        jenis: 'Praktikum',
        jamMulai: '08:00',
        jamSelesai: '10:30',
        ruang: 'Lab Komputer 3',
        dosen: 'Dimas Anggara, S.Kom. (Asisten Praktikum)',
        isKelasPengganti: false,
        catatan: null,
      },
    ],
  },
];

// ============================================================================
// 2. KATALOG KRS SEMESTER 5 & PILIHAN
//    - isSemesterSesuai  : flag apakah mata kuliah sesuai semester mahasiswa (5).
//    - sudahDiambil      : sudah masuk KRS mahasiswa (selaras dengan jadwal mingguan).
//    - Sengaja menyediakan kandidat yang BENTROK dengan jadwal berjalan
//      (IF-30552 Kamis 13:00 dan IF-30553 Jumat 08:00) untuk demo deteksi bentrok,
//      serta mata kuliah lintas semester untuk demo filter (IF-30103, IF-40102, IF-30601).
// ============================================================================

const buatKatalog = (data) => ({
  id: `krs-${data.kode.toLowerCase()}`,
  ...data,
  sudahDiambil: data.sudahDiambil ?? false,
  isSemesterSesuai: data.semesterKurikulum === STUDENT_PROFILE.semesterAktif,
});

export const KRS_CATALOG = [
  // --- Wajib Semester 5 (sudah diambil, selaras dengan jadwal) ---
  buatKatalog({
    kode: 'IF-30501',
    nama: 'Pemrograman Web Lanjut',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 5,
    hari: 'Senin',
    jamMulai: '07:30',
    jamSelesai: '10:00',
    ruang: 'Lab Komputer 2',
    dosen: 'Yusuf Ardiansyah, S.T., M.T.I.',
    kuota: 40,
    kuotaTerisi: 38,
    sudahDiambil: true,
    prasyarat: ['IF-20103'],
  }),
  buatKatalog({
    kode: 'IF-30502',
    nama: 'Kecerdasan Buatan',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 5,
    hari: 'Senin',
    jamMulai: '10:15',
    jamSelesai: '12:45',
    ruang: 'R. 301',
    dosen: 'Dr. Ratna Kusuma, M.Kom.',
    kuota: 40,
    kuotaTerisi: 37,
    sudahDiambil: true,
    prasyarat: ['IF-20105'],
  }),
  buatKatalog({
    kode: 'IF-30503',
    nama: 'Rekayasa Perangkat Lunak',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 5,
    hari: 'Rabu',
    jamMulai: '10:15',
    jamSelesai: '12:45',
    ruang: 'R. 303',
    dosen: 'Ahmad Fauzi, M.Kom.',
    kuota: 40,
    kuotaTerisi: 35,
    sudahDiambil: true,
    prasyarat: ['IF-30101'],
  }),
  buatKatalog({
    kode: 'IF-30504',
    nama: 'Interaksi Manusia dan Komputer',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 5,
    hari: 'Rabu',
    jamMulai: '07:30',
    jamSelesai: '10:00',
    ruang: 'R. 305',
    dosen: 'Prof. Dr. Siti Rahmawati, M.T.',
    kuota: 40,
    kuotaTerisi: 39,
    sudahDiambil: true,
    prasyarat: ['IF-20101'],
  }),
  buatKatalog({
    kode: 'IF-30505',
    nama: 'Jaringan Komputer',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 5,
    hari: 'Selasa',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    ruang: 'R. 302',
    dosen: 'Ir. Bambang Wijaya, M.T.',
    kuota: 40,
    kuotaTerisi: 36,
    sudahDiambil: true,
    prasyarat: ['IF-30104'],
  }),
  buatKatalog({
    kode: 'IF-30506',
    nama: 'Basis Data Lanjut',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 5,
    hari: 'Rabu',
    jamMulai: '13:00',
    jamSelesai: '15:30',
    ruang: 'R. 306',
    dosen: 'Dewi Lestari, M.Kom.',
    kuota: 35,
    kuotaTerisi: 31,
    sudahDiambil: true,
    prasyarat: ['IF-30102'],
  }),
  buatKatalog({
    kode: 'IF-30507',
    nama: 'Metodologi Penelitian',
    sks: 2,
    jenis: 'Wajib',
    semesterKurikulum: 5,
    hari: 'Kamis',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    ruang: 'R. 304',
    dosen: 'Dr. Hendra Gunawan, M.Si.',
    kuota: 40,
    kuotaTerisi: 33,
    sudahDiambil: true,
    prasyarat: [],
  }),

  // --- Pilihan Semester 5 (belum diambil) ---
  buatKatalog({
    kode: 'IF-30551',
    nama: 'Pemrograman Game',
    sks: 3,
    jenis: 'Pilihan',
    semesterKurikulum: 5,
    hari: 'Senin',
    jamMulai: '13:00',
    jamSelesai: '15:30',
    ruang: 'Lab Komputer 3',
    dosen: 'Rizky Pratama, M.Kom.',
    kuota: 30,
    kuotaTerisi: 12,
    prasyarat: ['IF-20103'],
  }),
  // Kandidat bentrok: beririsan dengan Praktikum Pemrograman Web Lanjut (Kamis 13:00-15:30).
  buatKatalog({
    kode: 'IF-30552',
    nama: 'Sistem Multimedia',
    sks: 3,
    jenis: 'Pilihan',
    semesterKurikulum: 5,
    hari: 'Kamis',
    jamMulai: '13:00',
    jamSelesai: '15:30',
    ruang: 'Lab Multimedia',
    dosen: 'Nadia Putri, M.Kom.',
    kuota: 30,
    kuotaTerisi: 27,
    prasyarat: ['IF-20102'],
  }),
  // Kandidat bentrok: beririsan dengan kelas pengganti IMK (Jumat 08:00-10:00).
  buatKatalog({
    kode: 'IF-30553',
    nama: 'Robotika',
    sks: 3,
    jenis: 'Pilihan',
    semesterKurikulum: 5,
    hari: 'Jumat',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    ruang: 'R. 307',
    dosen: 'Hariyanto, M.T.',
    kuota: 30,
    kuotaTerisi: 8,
    prasyarat: ['IF-30104'],
  }),

  // --- Lintas semester (tidak sesuai semester mahasiswa; demo filter) ---
  buatKatalog({
    kode: 'IF-30103',
    nama: 'Sistem Operasi',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 3,
    hari: 'Jumat',
    jamMulai: '13:00',
    jamSelesai: '15:30',
    ruang: 'R. 201',
    dosen: 'Drs. Wahyu Santoso, M.Kom.',
    kuota: 30,
    kuotaTerisi: 30,
    prasyarat: ['IF-20101'],
  }),
  buatKatalog({
    kode: 'IF-40102',
    nama: 'Teori Bahasa dan Otomata',
    sks: 3,
    jenis: 'Wajib',
    semesterKurikulum: 4,
    hari: 'Senin',
    jamMulai: '13:00',
    jamSelesai: '15:30',
    ruang: 'R. 202',
    dosen: 'Dr. Agus Salim, M.Si.',
    kuota: 35,
    kuotaTerisi: 34,
    prasyarat: ['IF-20101'],
  }),
  buatKatalog({
    kode: 'IF-30601',
    nama: 'Machine Learning',
    sks: 3,
    jenis: 'Pilihan',
    semesterKurikulum: 6,
    hari: 'Sabtu',
    jamMulai: '10:45',
    jamSelesai: '13:15',
    ruang: 'R. 308',
    dosen: 'Dr. Ratna Kusuma, M.Kom.',
    kuota: 30,
    kuotaTerisi: 25,
    prasyarat: ['IF-30502'],
  }),
];

// Ringkasan status periode KRS untuk banner (dibuka / PRS / menunggu validasi / ditutup).
export const KRS_META = {
  periode: 'Ganjil 2026/2027',
  status: 'prs',
  statusLabel: 'Periode PRS Dibuka — perubahan KRS masih dimungkinkan',
  batasSks: 24,
  tenggatPengisian: '2026-12-05T16:00',
  validator: 'Dr. Ratna Kusuma, M.Kom. (DPA)',
  catatan: 'Perubahan KRS hanya dapat dilakukan selama periode PRS sebelum tanggal tenggat.',
};

export const SKS_DIAMBIL_SEMESTER_INI = KRS_CATALOG
  .filter((item) => item.sudahDiambil)
  .reduce((total, item) => total + item.sks, 0);

// ============================================================================
// 3. NILAI KHS SEMESTER 1-5
//    Semester 1-4 final (terkunci setelah EDOM), Semester 5 berjalan
//    (komponen UTS sudah keluar, UAS belum). IP dan IPK dihitung otomatis
//    agar selalu konsisten dengan data komponen.
// ============================================================================

const buatNilaiMataKuliah = ({ kode, nama, sks, kehadiran, tugas, uts, uas }) => {
  const lengkap = uas != null;
  const nilaiAkhir = lengkap
    ? bulatkan(
        (kehadiran * NILAI_BOBOT.kehadiran +
          tugas * NILAI_BOBOT.tugas +
          uts * NILAI_BOBOT.uts +
          uas * NILAI_BOBOT.uas) /
          100,
      )
    : null;
  const huruf = lengkap ? ambilHuruf(nilaiAkhir) : null;

  return {
    kode,
    nama,
    sks,
    komponen: { kehadiran, tugas, uts, uas },
    nilaiAkhir,
    nilaiHuruf: huruf,
    bobot: huruf != null ? ambilBobot(huruf) : null,
  };
};

const buatSemesterKhs = ({
  semester,
  tahunAkademik,
  periode,
  status,
  statusLabel,
  catatan,
  mataKuliah,
}) => {
  const daftar = mataKuliah.map(buatNilaiMataKuliah);
  const totalSks = daftar.reduce((total, mk) => total + mk.sks, 0);
  const selesai = daftar.filter((mk) => mk.bobot != null);
  const sksSelesai = selesai.reduce((total, mk) => total + mk.sks, 0);
  const bobotSelesai = selesai.reduce((total, mk) => total + mk.bobot * mk.sks, 0);

  return {
    semester,
    tahunAkademik,
    periode,
    status,
    statusLabel,
    catatan,
    mataKuliah: daftar,
    totalSks,
    ip: sksSelesai > 0 ? bulatkan(bobotSelesai / sksSelesai) : null,
  };
};

export const KHS_HISTORY = [
  buatSemesterKhs({
    semester: 1,
    tahunAkademik: '2024/2025',
    periode: 'Ganjil',
    status: 'final',
    statusLabel: 'Final — terkunci setelah EDOM selesai',
    catatan: 'KHS terkunci. Koreksi nilai hanya melalui dosen pengampu dan bagian akademik.',
    mataKuliah: [
      { kode: 'IF-10101', nama: 'Dasar Pemrograman', sks: 3, kehadiran: 95, tugas: 90, uts: 88, uas: 88 },
      { kode: 'IF-10102', nama: 'Matematika Diskrit', sks: 3, kehadiran: 90, tugas: 80, uts: 72, uas: 70 },
      { kode: 'IF-10103', nama: 'Pengantar Teknologi Informasi', sks: 2, kehadiran: 98, tugas: 92, uts: 87, uas: 89 },
      { kode: 'IF-10104', nama: 'Logika Informatika', sks: 3, kehadiran: 85, tugas: 75, uts: 70, uas: 68 },
      { kode: 'IF-10105', nama: 'Bahasa Indonesia', sks: 2, kehadiran: 95, tugas: 85, uts: 82, uas: 80 },
      { kode: 'UNI-10101', nama: 'Pendidikan Agama', sks: 2, kehadiran: 100, tugas: 95, uts: 90, uas: 88 },
      { kode: 'UNI-10102', nama: 'Bahasa Inggris I', sks: 2, kehadiran: 90, tugas: 82, uts: 76, uas: 74 },
    ],
  }),
  buatSemesterKhs({
    semester: 2,
    tahunAkademik: '2024/2025',
    periode: 'Genap',
    status: 'final',
    statusLabel: 'Final — terkunci setelah EDOM selesai',
    catatan: 'KHS terkunci. Koreksi nilai hanya melalui dosen pengampu dan bagian akademik.',
    mataKuliah: [
      { kode: 'IF-20101', nama: 'Algoritma dan Pemrograman', sks: 3, kehadiran: 95, tugas: 88, uts: 82, uas: 78 },
      { kode: 'IF-20102', nama: 'Struktur Data', sks: 3, kehadiran: 92, tugas: 84, uts: 74, uas: 72 },
      { kode: 'IF-20103', nama: 'Pemrograman Berorientasi Objek', sks: 3, kehadiran: 97, tugas: 93, uts: 89, uas: 90 },
      { kode: 'IF-20104', nama: 'Sistem Digital', sks: 3, kehadiran: 88, tugas: 78, uts: 70, uas: 70 },
      { kode: 'IF-20105', nama: 'Statistika dan Probabilitas', sks: 3, kehadiran: 90, tugas: 82, uts: 75, uas: 74 },
      { kode: 'UNI-20101', nama: 'Bahasa Inggris II', sks: 2, kehadiran: 96, tugas: 87, uts: 81, uas: 80 },
    ],
  }),
  buatSemesterKhs({
    semester: 3,
    tahunAkademik: '2025/2026',
    periode: 'Ganjil',
    status: 'final',
    statusLabel: 'Final — terkunci setelah EDOM selesai',
    catatan: 'KHS terkunci. Koreksi nilai hanya melalui dosen pengampu dan bagian akademik.',
    mataKuliah: [
      { kode: 'IF-30101', nama: 'Analisis dan Perancangan Sistem', sks: 3, kehadiran: 96, tugas: 86, uts: 80, uas: 82 },
      { kode: 'IF-30102', nama: 'Basis Data', sks: 3, kehadiran: 98, tugas: 91, uts: 86, uas: 88 },
      { kode: 'IF-30103', nama: 'Sistem Operasi', sks: 3, kehadiran: 92, tugas: 83, uts: 76, uas: 73 },
      { kode: 'IF-30104', nama: 'Arsitektur dan Organisasi Komputer', sks: 3, kehadiran: 88, tugas: 77, uts: 70, uas: 69 },
      { kode: 'IF-30105', nama: 'Etika Profesi', sks: 2, kehadiran: 100, tugas: 94, uts: 88, uas: 87 },
      { kode: 'UNI-30101', nama: 'Pendidikan Pancasila', sks: 2, kehadiran: 93, tugas: 80, uts: 76, uas: 73 },
    ],
  }),
  buatSemesterKhs({
    semester: 4,
    tahunAkademik: '2025/2026',
    periode: 'Genap',
    status: 'final',
    statusLabel: 'Final — terkunci setelah EDOM selesai',
    catatan: 'KHS terkunci. Koreksi nilai hanya melalui dosen pengampu dan bagian akademik.',
    mataKuliah: [
      { kode: 'IF-40101', nama: 'Grafika Komputer', sks: 3, kehadiran: 90, tugas: 82, uts: 74, uas: 75 },
      { kode: 'IF-40102', nama: 'Teori Bahasa dan Otomata', sks: 3, kehadiran: 86, tugas: 76, uts: 72, uas: 70 },
      { kode: 'IF-40103', nama: 'Riset Operasi', sks: 2, kehadiran: 92, tugas: 83, uts: 75, uas: 73 },
      { kode: 'IF-40104', nama: 'Pemrograman Mobile', sks: 3, kehadiran: 97, tugas: 89, uts: 81, uas: 79 },
      { kode: 'IF-40105', nama: 'Keamanan Informasi', sks: 3, kehadiran: 91, tugas: 84, uts: 76, uas: 74 },
      { kode: 'IF-40106', nama: 'Kewirausahaan', sks: 2, kehadiran: 98, tugas: 92, uts: 87, uas: 88 },
    ],
  }),
  buatSemesterKhs({
    semester: 5,
    tahunAkademik: '2026/2027',
    periode: 'Ganjil',
    status: 'berjalan',
    statusLabel: 'Berjalan — nilai sementara hingga komponen UAS keluar',
    catatan: 'KHS final terbit setelah UAS dinilai dan periode EDOM ditutup.',
    mataKuliah: [
      { kode: 'IF-30501', nama: 'Pemrograman Web Lanjut', sks: 3, kehadiran: 100, tugas: 92, uts: 90, uas: null },
      { kode: 'IF-30502', nama: 'Kecerdasan Buatan', sks: 3, kehadiran: 95, tugas: 88, uts: 85, uas: null },
      { kode: 'IF-30503', nama: 'Rekayasa Perangkat Lunak', sks: 3, kehadiran: 98, tugas: 85, uts: 78, uas: null },
      { kode: 'IF-30504', nama: 'Interaksi Manusia dan Komputer', sks: 3, kehadiran: 100, tugas: 90, uts: 88, uas: null },
      { kode: 'IF-30505', nama: 'Jaringan Komputer', sks: 3, kehadiran: 90, tugas: 80, uts: 76, uas: null },
      { kode: 'IF-30506', nama: 'Basis Data Lanjut', sks: 3, kehadiran: 95, tugas: 87, uts: 82, uas: null },
      { kode: 'IF-30507', nama: 'Metodologi Penelitian', sks: 2, kehadiran: 96, tugas: 89, uts: 84, uas: null },
    ],
  }),
];

export const TOTAL_SKS_LULUS = KHS_HISTORY
  .flatMap((semester) => semester.mataKuliah)
  .filter((mk) => mk.bobot != null)
  .reduce((total, mk) => total + mk.sks, 0);

export const TOTAL_SKS_DITEMPUH = KHS_HISTORY.reduce(
  (total, semester) => total + semester.totalSks,
  0,
);

export function hitungIPK(daftarSemester = KHS_HISTORY) {
  const selesai = daftarSemester
    .flatMap((semester) => semester.mataKuliah)
    .filter((mk) => mk.bobot != null);
  const totalSks = selesai.reduce((total, mk) => total + mk.sks, 0);
  const totalBobot = selesai.reduce((total, mk) => total + mk.bobot * mk.sks, 0);
  return totalSks > 0 ? bulatkan(totalBobot / totalSks) : 0;
}

export const IPK_KUMULATIF = hitungIPK();

export function getPredikatIPK(ipk) {
  if (ipk >= 3.5) return 'Sangat Memuaskan';
  if (ipk >= 3.0) return 'Memuaskan';
  if (ipk >= 2.5) return 'Baik';
  if (ipk >= 2.0) return 'Cukup';
  return 'Kurang';
}

export function getKhs(semester) {
  return KHS_HISTORY.find((item) => item.semester === semester) ?? null;
}

// ============================================================================
// 4. DAFTAR TUGAS KULIAH (AKTIF & SELESAI)
//    status : 'belum-dikumpulkan' | 'terkumpul' | 'dinilai' | 'terlambat'
//    kategori: 'aktif' (belum dinilai) | 'selesai' (sudah dinilai)
//    nilai dan catatanDosen hanya terisi untuk tugas yang sudah dinilai.
// ============================================================================

export const DAFTAR_TUGAS = [
  // --- Aktif (urut tenggat terdekat) ---
  {
    id: 'tugas-01',
    kodeMk: 'IF-30504',
    mataKuliah: 'Interaksi Manusia dan Komputer',
    dosen: 'Prof. Dr. Siti Rahmawati, M.T.',
    judul: 'Rancangan Wireframe Portal Akademik',
    jenis: 'Individu',
    bobot: '15% nilai akhir',
    tenggat: '2026-11-26T23:59',
    kategori: 'aktif',
    status: 'belum-dikumpulkan',
    prioritas: 'tinggi',
    deskripsi:
      'Buat wireframe low-fidelity untuk 5 layar utama portal akademik beserta justifikasi keputusan desain.',
    namaBerkas: null,
    diunggahPada: null,
    nilai: null,
    catatanDosen: null,
  },
  {
    id: 'tugas-02',
    kodeMk: 'IF-30503',
    mataKuliah: 'Rekayasa Perangkat Lunak',
    dosen: 'Ahmad Fauzi, M.Kom.',
    judul: 'Dokumen SRS Sistem Perpustakaan Kampus',
    jenis: 'Kelompok (Kelompok 3)',
    bobot: '20% nilai akhir',
    tenggat: '2026-11-27T23:59',
    kategori: 'aktif',
    status: 'belum-dikumpulkan',
    prioritas: 'tinggi',
    deskripsi:
      'Susun SRS lengkap dengan kebutuhan fungsional, non-fungsional, dan diagram use case. Satu berkas per kelompok.',
    namaBerkas: null,
    diunggahPada: null,
    nilai: null,
    catatanDosen: null,
  },
  {
    id: 'tugas-03',
    kodeMk: 'IF-30502',
    mataKuliah: 'Kecerdasan Buatan',
    dosen: 'Dr. Ratna Kusuma, M.Kom.',
    judul: 'Implementasi Algoritma Minimax (Tic-Tac-Toe)',
    jenis: 'Kelompok (Kelompok 5)',
    bobot: '15% nilai akhir',
    tenggat: '2026-11-30T23:59',
    kategori: 'aktif',
    status: 'belum-dikumpulkan',
    prioritas: 'sedang',
    deskripsi:
      'Implementasikan minimax dengan alpha-beta pruning, sertakan analisis jumlah simpul yang dieksplorasi.',
    namaBerkas: null,
    diunggahPada: null,
    nilai: null,
    catatanDosen: null,
  },
  {
    id: 'tugas-04',
    kodeMk: 'IF-30501',
    mataKuliah: 'Pemrograman Web Lanjut',
    dosen: 'Yusuf Ardiansyah, S.T., M.T.I.',
    judul: 'REST API CRUD dengan Autentikasi JWT',
    jenis: 'Individu',
    bobot: '20% nilai akhir',
    tenggat: '2026-12-03T23:59',
    kategori: 'aktif',
    status: 'terkumpul',
    prioritas: 'sedang',
    deskripsi:
      'Bangun REST API lengkap dengan CRUD, autentikasi JWT, dan dokumentasi endpoint. Unggah tautan repositori.',
    namaBerkas: 'if30501-tugas2-20260001.zip',
    diunggahPada: '2026-11-24T21:14',
    nilai: null,
    catatanDosen: null,
  },
  {
    id: 'tugas-05',
    kodeMk: 'IF-30506',
    mataKuliah: 'Basis Data Lanjut',
    dosen: 'Dewi Lestari, M.Kom.',
    judul: 'Optimasi Query dan Perancangan Index',
    jenis: 'Individu',
    bobot: '15% nilai akhir',
    tenggat: '2026-12-05T23:59',
    kategori: 'aktif',
    status: 'belum-dikumpulkan',
    prioritas: 'sedang',
    deskripsi:
      'Analisis EXPLAIN PLAN dari 3 query lambat, lalu usulkan index dan penulisan ulang query beserta bukti perbaikan.',
    namaBerkas: null,
    diunggahPada: null,
    nilai: null,
    catatanDosen: null,
  },
  {
    id: 'tugas-06',
    kodeMk: 'IF-30505',
    mataKuliah: 'Jaringan Komputer',
    dosen: 'Ir. Bambang Wijaya, M.T.',
    judul: 'Laporan Simulasi Subnetting VLSM',
    jenis: 'Kelompok (Kelompok 2)',
    bobot: '15% nilai akhir',
    tenggat: '2026-12-07T23:59',
    kategori: 'aktif',
    status: 'belum-dikumpulkan',
    prioritas: 'rendah',
    deskripsi:
      'Rancang pengalamatan VLSM untuk topologi 4 subnet pada Packet Tracer dan jelaskan tabel perhitungannya.',
    namaBerkas: null,
    diunggahPada: null,
    nilai: null,
    catatanDosen: null,
  },

  // --- Selesai / sudah dinilai ---
  {
    id: 'tugas-07',
    kodeMk: 'IF-30506',
    mataKuliah: 'Basis Data Lanjut',
    dosen: 'Dewi Lestari, M.Kom.',
    judul: 'Studi Kasus Normalisasi 3NF',
    jenis: 'Individu',
    bobot: '15% nilai akhir',
    tenggat: '2026-10-16T23:59',
    kategori: 'selesai',
    status: 'dinilai',
    prioritas: 'sedang',
    deskripsi: 'Normalisasikan skema transaksi koperasi kampus hingga bentuk 3NF lengkap dengan justifikasi.',
    namaBerkas: 'if30506-tugas1-20260001.pdf',
    diunggahPada: '2026-10-16T20:32',
    nilai: 90,
    catatanDosen: 'Rapi, lengkap, dan argumennya jelas.',
  },
  {
    id: 'tugas-08',
    kodeMk: 'IF-30505',
    mataKuliah: 'Jaringan Komputer',
    dosen: 'Ir. Bambang Wijaya, M.T.',
    judul: 'Laporan Traceroute dan Resolusi DNS',
    jenis: 'Kelompok (Kelompok 2)',
    bobot: '15% nilai akhir',
    tenggat: '2026-10-09T23:59',
    kategori: 'selesai',
    status: 'dinilai',
    prioritas: 'rendah',
    deskripsi: 'Dokumentasikan hasil traceroute ke 5 domain dan analisis proses resolusi DNS-nya.',
    namaBerkas: 'if30505-tugas1-kelompok2.pdf',
    diunggahPada: '2026-10-09T22:05',
    nilai: 79,
    catatanDosen: 'Analisis setiap hop kurang mendalam, namun format laporan sudah baik.',
  },
  {
    id: 'tugas-09',
    kodeMk: 'IF-30503',
    mataKuliah: 'Rekayasa Perangkat Lunak',
    dosen: 'Ahmad Fauzi, M.Kom.',
    judul: 'Diagram Use Case dan Activity',
    jenis: 'Kelompok (Kelompok 3)',
    bobot: '20% nilai akhir',
    tenggat: '2026-10-12T23:59',
    kategori: 'selesai',
    status: 'terlambat',
    prioritas: 'tinggi',
    deskripsi: 'Buat diagram use case dan activity untuk skenario peminjaman ruang kuliah.',
    namaBerkas: 'if30503-tugas1-kelompok3.pdf',
    diunggahPada: '2026-10-14T19:47',
    nilai: 75,
    catatanDosen: 'Dikumpulkan 2 hari terlambat. Pengurangan 10 poin sesuai ketentuan perkuliahan.',
  },
  {
    id: 'tugas-10',
    kodeMk: 'IF-30507',
    mataKuliah: 'Metodologi Penelitian',
    dosen: 'Dr. Hendra Gunawan, M.Si.',
    judul: 'Proposal Penelitian (Bab 1-3)',
    jenis: 'Individu',
    bobot: '30% nilai akhir',
    tenggat: '2026-10-20T23:59',
    kategori: 'selesai',
    status: 'dinilai',
    prioritas: 'tinggi',
    deskripsi: 'Susun proposal penelitian Bab 1-3 dengan minimal 10 referensi 5 tahun terakhir.',
    namaBerkas: 'if30507-proposal-20260001.pdf',
    diunggahPada: '2026-10-20T21:58',
    nilai: 87,
    catatanDosen: 'Rumusan masalah perlu dipertajam; cakupan variabel penelitian masih terlalu luas.',
  },
  {
    id: 'tugas-11',
    kodeMk: 'IF-30501',
    mataKuliah: 'Pemrograman Web Lanjut',
    dosen: 'Yusuf Ardiansyah, S.T., M.T.I.',
    judul: 'Landing Page Responsif',
    jenis: 'Individu',
    bobot: '20% nilai akhir',
    tenggat: '2026-10-23T23:59',
    kategori: 'selesai',
    status: 'dinilai',
    prioritas: 'sedang',
    deskripsi: 'Bangun landing page responsif dengan mobile-first CSS tanpa framework UI.',
    namaBerkas: 'if30501-tugas1-20260001.zip',
    diunggahPada: '2026-10-23T23:12',
    nilai: 88,
    catatanDosen: 'Implementasi bagus. Perhatikan kontras warna pada mode gelap.',
  },
  {
    id: 'tugas-12',
    kodeMk: 'IF-30502',
    mataKuliah: 'Kecerdasan Buatan',
    dosen: 'Dr. Ratna Kusuma, M.Kom.',
    judul: 'Kuis Jaringan Syaraf Tiruan Dasar',
    jenis: 'Kuis',
    bobot: '10% nilai akhir',
    tenggat: '2026-10-29T23:59',
    kategori: 'selesai',
    status: 'dinilai',
    prioritas: 'sedang',
    deskripsi: 'Kuis online 20 soal mengenai perceptron, fungsi aktivasi, dan backpropagation.',
    namaBerkas: null,
    diunggahPada: '2026-10-29T14:20',
    nilai: 85,
    catatanDosen: 'Pemahaman backpropagation sudah baik; pelajari kembali materi fungsi aktivasi.',
  },
  {
    id: 'tugas-13',
    kodeMk: 'IF-30504',
    mataKuliah: 'Interaksi Manusia dan Komputer',
    dosen: 'Prof. Dr. Siti Rahmawati, M.T.',
    judul: 'Analisis Persona dan Skenario Pengguna',
    jenis: 'Individu',
    bobot: '15% nilai akhir',
    tenggat: '2026-11-13T23:59',
    kategori: 'selesai',
    status: 'dinilai',
    prioritas: 'tinggi',
    deskripsi: 'Rancang 2 persona utama beserta 3 skenario penggunaan untuk aplikasi portal akademik.',
    namaBerkas: 'if30504-tugas1-20260001.pdf',
    diunggahPada: '2026-11-13T22:40',
    nilai: 92,
    catatanDosen: 'Persona sudah kaya konteks. Tambahkan tujuan aksesibilitas pada skenario berikutnya.',
  },
];

const urutkanTenggat = (a, b) => a.tenggat.localeCompare(b.tenggat);

export const TUGAS_AKTIF = DAFTAR_TUGAS
  .filter((tugas) => tugas.kategori === 'aktif')
  .sort(urutkanTenggat);

export const TUGAS_SELESAI = DAFTAR_TUGAS
  .filter((tugas) => tugas.kategori === 'selesai')
  .sort(urutkanTenggat)
  .reverse();

// ============================================================================
// 5. PRESENSI SEMESTER 5
//    Setiap mata kuliah memiliki 14 pertemuan. Status per pertemuan:
//    'present' | 'absent' | 'not-evaluated'.
//    `evaluated` = pertemuan yang sudah dinilai (present + absent).
//    `color` memakai CSS variable agar otomatis memakai varian kontras tinggi
//    pada mode terang maupun gelap (lihat PresensiFeature.css).
// ============================================================================

const TOTAL_PERTEMUAN = 14;

function buatPertemuanPresensi({ evaluated, absent = [] }) {
  return Array.from({ length: TOTAL_PERTEMUAN }, (_, indeks) => {
    const meeting = indeks + 1;

    if (absent.includes(meeting)) {
      return { meeting, status: 'absent' };
    }
    if (meeting <= evaluated) {
      return { meeting, status: 'present' };
    }
    return { meeting, status: 'not-evaluated' };
  });
}

function buatMataKuliahPresensi({
  id,
  code,
  name,
  lecturer,
  sks,
  attended,
  evaluated,
  color,
  absent = [],
}) {
  return {
    id,
    code,
    name,
    lecturer,
    sks,
    attended,
    evaluated,
    color,
    totalMeetings: TOTAL_PERTEMUAN,
    meetings: buatPertemuanPresensi({ evaluated, absent }),
  };
}

export const presensiCourses = [
  buatMataKuliahPresensi({
    id: 'miti-506',
    code: 'MITI.506',
    name: 'Pemrograman Aman',
    lecturer: 'Q Fadlan M.Kom',
    sks: 3,
    attended: 6,
    evaluated: 6,
    color: 'var(--presensi-warna-teal)',
  }),
  buatMataKuliahPresensi({
    id: 'mpti-cs03',
    code: 'MPTI.CS03',
    name: 'Forensik Digital',
    lecturer: 'Q Fadlan M.Kom',
    sks: 3,
    attended: 4,
    evaluated: 5,
    color: 'var(--presensi-warna-amber)',
    absent: [3],
  }),
  buatMataKuliahPresensi({
    id: 'miti-504',
    code: 'MITI.504',
    name: 'Sistem Terdistribusi',
    lecturer: 'Hendri Karisma S.Kom., MT.',
    sks: 3,
    attended: 5,
    evaluated: 5,
    color: 'var(--presensi-warna-blue)',
  }),
  buatMataKuliahPresensi({
    id: 'mkwk-402',
    code: 'MKWK.402',
    name: 'Pancasila',
    lecturer: 'Dr. Afif Zaerofi, M.M.',
    sks: 2,
    attended: 8,
    evaluated: 8,
    color: 'var(--presensi-warna-rose)',
  }),
  buatMataKuliahPresensi({
    id: 'miti-502',
    code: 'MITI.502',
    name: 'Arsitektur Enterprise',
    lecturer: 'Ricky Setiadi S.Kom., M.Kom',
    sks: 3,
    attended: 7,
    evaluated: 7,
    color: 'var(--presensi-warna-violet)',
  }),
  buatMataKuliahPresensi({
    id: 'miti-501',
    code: 'MITI.501',
    name: 'Manajemen Proyek',
    lecturer: 'Agus Sulaiman, S.Kom., MT.',
    sks: 3,
    attended: 8,
    evaluated: 8,
    color: 'var(--presensi-warna-lime)',
  }),
  buatMataKuliahPresensi({
    id: 'miti-503',
    code: 'MITI.503',
    name: 'Interaksi Manusia dan Komputer',
    lecturer: 'Galih Kurniawan Sidik M.Kom',
    sks: 3,
    attended: 7,
    evaluated: 7,
    color: 'var(--presensi-warna-cyan)',
  }),
  buatMataKuliahPresensi({
    id: 'miti-505',
    code: 'MITI.505',
    name: 'Data Lake dan Integrasi',
    lecturer: 'Hendri Karisma S.Kom., MT.',
    sks: 3,
    attended: 6,
    evaluated: 6,
    color: 'var(--presensi-warna-fuchsia)',
  }),
];

// ============================================================================
// HELPER LINTAS FITUR
// ============================================================================

export function cariMataKuliah(kode) {
  return KRS_CATALOG.find((item) => item.kode === kode) ?? null;
}

/**
 * Deteksi jadwal bentrok antara kandidat KRS dan jadwal mingguan mahasiswa.
 * Kelas yang kodenya sama diabaikan (mis. mata kuliah vs praktikumnya sendiri),
 * dan kelas pengganti tetap dihitung sebagai sesi aktif.
 * Mengembalikan daftar sesi jadwal yang beririsan (kosong bila aman).
 */
export function cekBentrokJadwal(kandidat) {
  if (!kandidat || kandidat.sudahDiambil) return [];

  const mulai = jamKeMenit(kandidat.jamMulai);
  const selesai = jamKeMenit(kandidat.jamSelesai);
  const hariId = String(kandidat.hari).toLowerCase();
  const bentrok = [];

  WEEKLY_SCHEDULE.forEach((hari) => {
    if (hari.id !== hariId) return;

    hari.kelasList.forEach((kelas) => {
      if (kelas.kode === kandidat.kode) return;

      const kelasMulai = jamKeMenit(kelas.jamMulai);
      const kelasSelesai = jamKeMenit(kelas.jamSelesai);

      if (mulai < kelasSelesai && selesai > kelasMulai) {
        bentrok.push({
          hari: hari.hari,
          kode: kelas.kode,
          mataKuliah: kelas.mataKuliah,
          jenis: kelas.jenis,
          jamMulai: kelas.jamMulai,
          jamSelesai: kelas.jamSelesai,
          ruang: kelas.ruang,
          isKelasPengganti: kelas.isKelasPengganti,
        });
      }
    });
  });

  return bentrok;
}
