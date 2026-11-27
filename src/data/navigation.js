import {
  ArrowLeftRight,
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Compass,
  FileBadge,
  FileText,
  FlaskConical,
  FolderOpen,
  Globe2,
  GraduationCap,
  HeartHandshake,
  History,
  Info,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Mail,
  Megaphone,
  MessageSquare,
  RefreshCw,
  ScrollText,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';

const feature = (data) => ({
  ...data,
  // `title` adalah judul tampilan, sedangkan `label` adalah nama menu.
  // Sebagian fitur hanya mendefinisikan `label`, jadi samakan agar judul
  // kartu/halaman tidak pernah kosong.
  title: data.title ?? data.label,
  slug: data.id,
  phase: 2,
});

export const categories = [
  {
    id: 'akademik',
    slug: 'akademik',
    label: 'Akademik',
    icon: BookOpen,
    tone: 'emerald',
    description: 'KRS, jadwal, presensi, materi, dan nilai dalam satu alur yang jelas.',
    features: [
      feature({
        id: 'krs',
        label: 'KRS',
        title: 'Kartu Rencana Studi',
        legacyLabel: 'KRS',
        aliases: ['Kartu Rencana Studi', 'PRS', 'pengisian kelas', 'rencana studi'],
        description: 'Pilih kelas, pantau batas SKS, dan ajukan KRS dengan status periode yang konsisten.',
        icon: ClipboardList,
        blueprint: [
          'Satu banner status periode: dibuka, PRS, menunggu validasi, atau ditutup.',
          'Tab Tambah dan Dipilih dengan ringkasan SKS serta batas yang jelas.',
          'Riwayat KRS dan cetak KRS dalam satu tempat.',
        ],
      }),
      feature({
        id: 'riwayat-krs',
        label: 'Riwayat KRS',
        legacyLabel: 'Riwayat KRS',
        aliases: ['riwayat kelas', 'semester lalu'],
        description: 'Telusuri kelas yang pernah diambil, statusnya, dan dosen pengampu per semester.',
        icon: History,
        blueprint: [
          'Filter semester dan pencarian mata kuliah.',
          'Kartu ringkas per semester dengan status kelas.',
          'Tautan cepat ke detail nilai dan cetak riwayat.',
        ],
      }),
      feature({
        id: 'jadwal',
        label: 'Jadwal Kuliah',
        legacyLabel: 'Jadwal Kuliah',
        aliases: ['jadwal', 'ruang', 'kelas hari ini'],
        description: 'Lihat jadwal mingguan per hari, lengkap dengan ruang dan mata kuliah.',
        icon: CalendarDays,
        blueprint: [
          'Tampilan agenda per hari yang nyaman di ponsel.',
          'Informasi ruang, waktu, dan dosen pengampu.',
          'Tautan langsung ke presensi dan materi kelas.',
        ],
      }),
      feature({
        id: 'presensi',
        label: 'Presensi',
        legacyLabel: 'Presensi',
        aliases: ['kehadiran', 'self check-in', 'PIN', 'absensi'],
        description: 'Pantau kehadiran per mata kuliah dan lakukan check-in dengan PIN dari dosen.',
        icon: ClipboardCheck,
        blueprint: [
          'Rekap kehadiran per mata kuliah dengan persentase.',
          'Status sesi check-in dan masa berlaku PIN.',
          'Riwayat pertemuan dan cetak rekap.',
        ],
      }),
      feature({
        id: 'materi',
        label: 'Materi Kuliah',
        legacyLabel: 'Materi Kuliah',
        aliases: ['materi', 'bahan ajar', 'unduhan'],
        description: 'Akses bahan kuliah terbaru dari setiap kelas yang Anda ikuti.',
        icon: BookOpen,
        blueprint: [
          'Daftar kelas dan materi terbaru.',
          'Pratinjau serta unduhan berkas yang aman.',
          'Penanda materi yang sudah dibaca.',
        ],
      }),
      feature({
        id: 'nilai',
        label: 'Nilai & Transkrip',
        legacyLabel: 'Nilai & Transkrip',
        aliases: ['KHS', 'transkrip', 'IPK', 'nilai akhir'],
        description: 'Buka KHS per semester, rincian komponen nilai, dan transkrip dalam satu halaman.',
        icon: GraduationCap,
        blueprint: [
          'Tab KHS per Semester dan Transkrip.',
          'Rincian komponen nilai yang transparan.',
          'Penjelasan status KHS terkunci EDOM tanpa jalan buntu.',
        ],
      }),
    ],
  },
  {
    id: 'tugas',
    slug: 'tugas',
    label: 'Tugas & Ujian',
    icon: ClipboardList,
    tone: 'amber',
    description: 'Semua tenggat, tugas, kuis, dan diskusi kelas dalam satu pusat kendali.',
    features: [
      feature({
        id: 'tugas',
        label: 'Tugas',
        legacyLabel: 'Pengumpulan Tugas & Ujian',
        aliases: ['pengumpulan tugas', 'submission', 'deadline', 'ujian'],
        description: 'Lihat tugas aktif, status pengumpulan, nilai, dan catatan dosen.',
        icon: FileText,
        blueprint: [
          'Daftar tugas dengan prioritas dan tenggat.',
          'Detail tugas, unggah berkas, dan status pengumpulan.',
          'Nilai serta catatan dosen yang mudah dibaca.',
        ],
      }),
      feature({
        id: 'tenggat',
        label: 'Tenggat',
        legacyLabel: 'Deliverable & Tenggat',
        aliases: ['deliverable', 'CPMK', 'tenggat', 'deadline'],
        description: 'Linimasa terpadu untuk tugas, kuis, dan komponen penilaian berbasis CPMK.',
        icon: CalendarClock,
        blueprint: [
          'Timeline lintas mata kuliah, bukan halaman terpisah.',
          'Filter kelas dan jenis penilaian.',
          'Pengingat yang menjelaskan istilah teknis.',
        ],
      }),
      feature({
        id: 'kuis',
        label: 'Kuis',
        legacyLabel: 'Kuis',
        aliases: ['kuis online', 'quiz', 'tes'],
        description: 'Kerjakan kuis, lihat durasi, percobaan, dan hasilnya.',
        icon: ListChecks,
        blueprint: [
          'Daftar kuis dengan waktu buka dan durasi.',
          'Informasi jumlah percobaan dan aturan pengerjaan.',
          'Hasil kuis dan umpan balik.',
        ],
      }),
      feature({
        id: 'forum',
        label: 'Forum Diskusi',
        legacyLabel: 'Forum Diskusi',
        aliases: ['forum', 'diskusi', 'thread'],
        description: 'Diskusi kelas yang terorganisasi per topik dan mudah diikuti.',
        icon: MessageSquare,
        blueprint: [
          'Daftar thread per kelas.',
          'Balasan dengan penanda dosen dan rekan.',
          'Notifikasi untuk thread yang Anda ikuti.',
        ],
      }),
    ],
  },
  {
    id: 'layanan',
    slug: 'layanan',
    label: 'Keuangan & Layanan',
    icon: Wallet,
    tone: 'blue',
    description: 'Tagihan, beasiswa, surat, konsultasi, dan administrasi kampus tanpa berpindah-pindah.',
    features: [
      feature({
        id: 'keuangan',
        label: 'Keuangan',
        legacyLabel: 'Keuangan',
        aliases: ['tagihan', 'pembayaran', 'UKT', 'kuitansi', 'upload bukti'],
        description: 'Lihat tagihan, cara membayar, unggah bukti, dan status verifikasinya.',
        icon: Wallet,
        blueprint: [
          'Ringkasan tagihan dan instruksi pembayaran yang jelas.',
          'Unggah bukti langsung dengan pratinjau.',
          'Status verifikasi bertahap dan kuitansi.',
        ],
      }),
      feature({
        id: 'beasiswa',
        label: 'Beasiswa',
        legacyLabel: 'Beasiswa',
        aliases: ['beasiswa', 'bantuan biaya', 'pendaftaran beasiswa'],
        description: 'Temukan beasiswa yang cocok dan lihat syarat yang sudah atau belum terpenuhi.',
        icon: Award,
        blueprint: [
          'Kartu beasiswa dengan tenggat dan manfaat.',
          'Checklist syarat yang transparan.',
          'Riwayat pendaftaran dan status seleksi.',
        ],
      }),
      feature({
        id: 'surat',
        label: 'Surat Keterangan',
        legacyLabel: 'Surat Keterangan',
        aliases: ['surat', 'keterangan', 'legalisir'],
        description: 'Ajukan surat keterangan dan pantau prosesnya tanpa datang ke loket.',
        icon: Mail,
        blueprint: [
          'Jenis surat dengan penjelasan kegunaan.',
          'Form keperluan dan unggahan pendukung.',
          'Status proses serta unduhan surat.',
        ],
      }),
      feature({
        id: 'konsultasi',
        label: 'Konsultasi DPA',
        legacyLabel: 'Konsultasi DPA',
        aliases: ['DPA', 'dosen pembimbing', 'konsultasi'],
        description: 'Ajukan waktu konsultasi dengan dosen pembimbing akademik.',
        icon: MessageSquare,
        blueprint: [
          'Pilihan topik dan agenda konsultasi.',
          'Ketersediaan waktu dosen.',
          'Catatan hasil konsultasi.',
        ],
      }),
      feature({
        id: 'tiket',
        label: 'Tiket Bantuan',
        legacyLabel: 'Tiket Bantuan',
        aliases: ['helpdesk', 'bantuan', 'lapor', 'tiket'],
        description: 'Laporkan kendala akademik dengan bukti screenshot dan ikuti balasannya.',
        icon: LifeBuoy,
        blueprint: [
          'Kategori masalah yang spesifik.',
          'Lampiran screenshot atau berkas.',
          'Thread balasan dan status penyelesaian.',
        ],
      }),
      feature({
        id: 'heregistrasi',
        label: 'Heregistrasi & Cuti',
        legacyLabel: 'Heregistrasi & Cuti',
        aliases: ['heregistrasi', 'registrasi ulang', 'cuti'],
        description: 'Ajukan heregistrasi semester atau cuti dengan status yang jelas.',
        icon: RefreshCw,
        blueprint: [
          'Status semester aktif dan tenggat.',
          'Form heregistrasi atau cuti dengan dokumen.',
          'Riwayat verifikasi dan catatan akademik.',
        ],
      }),
      feature({
        id: 'mutasi',
        label: 'Mutasi',
        legacyLabel: 'Mutasi Mahasiswa',
        aliases: ['mutasi', 'pindah prodi', 'perpindahan'],
        description: 'Ajukan mutasi atau perpindahan program studi dengan informasi konsekuensinya.',
        icon: ArrowLeftRight,
        blueprint: [
          'Jenis mutasi dan prodi tujuan.',
          'Daftar dokumen serta konsekuensi akademik.',
          'Status pengajuan dan catatan verifikator.',
        ],
      }),
    ],
  },
  {
    id: 'kegiatan',
    slug: 'kegiatan',
    label: 'Kegiatan',
    icon: Compass,
    tone: 'violet',
    description: 'KKN, MBKM, penelitian, pengabdian, dan portofolio di luar kelas.',
    features: [
      feature({
        id: 'kkn',
        label: 'KKN',
        legacyLabel: 'KKN',
        aliases: ['kuliah kerja nyata', 'KKN'],
        description: 'Daftar KKN, lihat lokasi, dosen pembimbing lapangan, dan hasil penilaian.',
        icon: HeartHandshake,
        blueprint: [
          'Informasi periode dan lokasi KKN.',
          'Pendaftaran dengan data yang jelas.',
          'Status, DPL, dan nilai akhir.',
        ],
      }),
      feature({
        id: 'mbkm',
        label: 'MBKM',
        legacyLabel: 'MBKM',
        aliases: ['merdeka belajar', 'magang', 'studi independen', 'BKP'],
        description: 'Ajukan program MBKM, unggah dokumen, dan pantau konversi SKS.',
        icon: Globe2,
        blueprint: [
          'Katalog program dan mitra.',
          'Dokumen proposal, laporan, dan sertifikat.',
          'Tabel konversi SKS yang mudah dibaca.',
        ],
      }),
      feature({
        id: 'penelitian',
        label: 'Penelitian',
        legacyLabel: 'Penelitian',
        aliases: ['riset', 'penelitian'],
        description: 'Lihat penelitian yang Anda ikuti dan peran Anda di dalamnya.',
        icon: FlaskConical,
        blueprint: [
          'Daftar penelitian dan ketua peneliti.',
          'Peran serta kontribusi Anda.',
          'Tautan ke dokumen atau laporan.',
        ],
      }),
      feature({
        id: 'pengabdian',
        label: 'Pengabdian',
        legacyLabel: 'Pengabdian',
        aliases: ['pengabdian masyarakat', 'abdimas'],
        description: 'Pantau kegiatan pengabdian masyarakat dan peran Anda.',
        icon: Users,
        blueprint: [
          'Daftar kegiatan pengabdian.',
          'Peran dan jadwal kegiatan.',
          'Dokumen serta hasil kegiatan.',
        ],
      }),
      feature({
        id: 'skpi',
        label: 'SKPI',
        legacyLabel: 'SKPI Portfolio',
        aliases: ['SKPI', 'portofolio', 'sertifikat', 'prestasi'],
        description: 'Kumpulkan sertifikat dan prestasi untuk portofolio kelulusan.',
        icon: BadgeCheck,
        blueprint: [
          'Tab Sertifikat dan Prestasi.',
          'Form yang menjelaskan jenis bukti.',
          'Status verifikasi serta pratinjau SKPI.',
        ],
      }),
      feature({
        id: 'sertifikat',
        label: 'Sertifikat Digital',
        legacyLabel: 'Sertifikat Digital',
        aliases: ['sertifikat', 'digital certificate'],
        description: 'Akses sertifikat digital yang diterbitkan kampus dan verifikasi keasliannya.',
        icon: FileBadge,
        blueprint: [
          'Daftar sertifikat yang sudah terbit.',
          'Unduhan dan pratinjau sertifikat.',
          'Verifikasi melalui kode atau QR.',
        ],
      }),
    ],
  },
  {
    id: 'tahap-akhir',
    slug: 'tahap-akhir',
    label: 'Tahap Akhir',
    icon: GraduationCap,
    tone: 'rose',
    description: 'EDOM, skripsi, dan wisuda dengan checklist yang tidak membingungkan.',
    features: [
      feature({
        id: 'edom',
        label: 'EDOM',
        legacyLabel: 'EDOM',
        aliases: ['evaluasi dosen', 'kuesioner', 'EDOM'],
        description: 'Isi evaluasi dosen dengan penjelasan anonimitas dan tenggat yang jelas.',
        icon: ClipboardCheck,
        blueprint: [
          'Daftar kelas dan status pengisian.',
          'Skala penilaian yang konsisten.',
          'Penjelasan anonimitas dan tenggat.',
        ],
      }),
      feature({
        id: 'skripsi',
        label: 'Skripsi',
        legacyLabel: 'Skripsi',
        aliases: ['skripsi', 'tugas akhir', 'judul'],
        description: 'Ajukan judul, kelola dokumen, dan pantau status bimbingan skripsi.',
        icon: ScrollText,
        blueprint: [
          'Pengajuan judul dengan panduan jelas.',
          'Pembimbing dan status persetujuan.',
          'Dokumen serta catatan akademik.',
        ],
      }),
      feature({
        id: 'wisuda',
        label: 'Wisuda',
        legacyLabel: 'Wisuda (Yudisium)',
        aliases: ['wisuda', 'yudisium', 'SKL', 'kelulusan'],
        description: 'Periksa kelayakan, daftar wisuda, dan unduh SKL.',
        icon: GraduationCap,
        blueprint: [
          'Checklist kelayakan yang spesifik.',
          'Periode dan pendaftaran wisuda.',
          'Riwayat serta unduhan SKL.',
        ],
      }),
    ],
  },
  {
    id: 'informasi',
    slug: 'informasi',
    label: 'Informasi & Akun',
    icon: Info,
    tone: 'cyan',
    description: 'Pengumuman, kalender, dokumen, notifikasi, dan profil dalam satu tempat.',
    features: [
      feature({
        id: 'pengumuman',
        label: 'Pengumuman',
        legacyLabel: 'Pengumuman',
        aliases: ['pengumuman', 'informasi', 'berita'],
        description: 'Baca pengumuman kampus yang relevan untuk Anda.',
        icon: Megaphone,
        blueprint: [
          'Daftar pengumuman dengan kategori.',
          'Penanda penting dan belum dibaca.',
          'Detail yang mudah dibagikan.',
        ],
      }),
      feature({
        id: 'kalender',
        label: 'Kalender Akademik',
        legacyLabel: 'Kalender Akademik',
        aliases: ['kalender', 'agenda', 'jadwal akademik'],
        description: 'Lihat agenda akademik penting dan simpan ke kalender pribadi.',
        icon: CalendarRange,
        blueprint: [
          'Agenda per bulan dengan filter.',
          'Sorotan tenggat terdekat.',
          'Ekspor ke kalender pribadi.',
        ],
      }),
      feature({
        id: 'dokumen',
        label: 'Pusat Dokumen',
        legacyLabel: 'Pusat Dokumen',
        aliases: ['dokumen', 'unduhan', 'berkas'],
        description: 'Cari panduan, formulir, dan dokumen kampus dengan cepat.',
        icon: FolderOpen,
        blueprint: [
          'Pencarian dan filter kategori.',
          'Pratinjau sebelum mengunduh.',
          'Riwayat dokumen yang sering dibuka.',
        ],
      }),
      feature({
        id: 'notifikasi',
        label: 'Notifikasi',
        legacyLabel: 'Notifikasi',
        aliases: ['notifikasi', 'pemberitahuan'],
        description: 'Atur dan baca pemberitahuan akademik tanpa kehilangan hal penting.',
        icon: Bell,
        blueprint: [
          'Tab belum dibaca dan semua.',
          'Tandai semua dibaca.',
          'Preferensi jenis notifikasi.',
        ],
      }),
      feature({
        id: 'profil',
        label: 'Profil',
        legacyLabel: 'Profil',
        aliases: ['profil', 'akun', 'kartu mahasiswa', 'password'],
        description: 'Kelola data kontak, kartu mahasiswa, dan keamanan akun.',
        icon: UserRound,
        blueprint: [
          'Identitas dan data akademik.',
          'Edit kontak dengan batas yang jelas.',
          'Kartu mahasiswa dan keamanan akun.',
        ],
      }),
    ],
  },
];

export const allFeatures = categories.flatMap((category) =>
  category.features.map((item) => ({
    ...item,
    categorySlug: category.slug,
    categoryLabel: category.label,
    categoryIcon: category.icon,
    tone: category.tone,
  })),
);

export const mainNavigation = [
  {
    kind: 'dashboard',
    label: 'Dashboard',
    description: 'Ringkasan hari ini',
    to: '/app',
    icon: LayoutDashboard,
  },
  ...categories.map((category) => ({
    kind: 'category',
    label: category.label,
    description: category.description,
    to: `/app/kategori/${category.slug}`,
    icon: category.icon,
    count: category.features.length,
  })),
];

const popularFeatureIds = ['krs', 'tugas', 'nilai', 'keuangan', 'presensi', 'jadwal'];

export function getCategory(slug) {
  return categories.find((category) => category.slug === slug) ?? null;
}

export function getFeature(slug) {
  return allFeatures.find((item) => item.slug === slug) ?? null;
}

export function searchFeatures(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return allFeatures.filter((item) => popularFeatureIds.includes(item.id));
  }

  return allFeatures.filter((item) => {
    const haystack = [
      item.label,
      item.title,
      item.description,
      item.legacyLabel,
      item.categoryLabel,
      ...(item.aliases ?? []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getPageMeta(pathname) {
  if (pathname === '/app' || pathname === '/app/') {
    return {
      title: 'Dashboard',
      eyebrow: 'Beranda',
    };
  }

  const categoryMatch = pathname.match(/^\/app\/kategori\/([^/]+)/);
  if (categoryMatch) {
    const category = getCategory(categoryMatch[1]);
    if (category) {
      return {
        title: category.label,
        eyebrow: 'Kategori',
      };
    }
  }

  const featureMatch = pathname.match(/^\/app\/fitur\/([^/]+)/);
  if (featureMatch) {
    const item = getFeature(featureMatch[1]);
    if (item) {
      return {
        title: item.label,
        eyebrow: item.categoryLabel,
      };
    }
  }

  return {
    title: 'Portal Akademik',
    eyebrow: 'SILINCAH',
  };
}

export function getBreadcrumbs(pathname) {
  if (pathname === '/app' || pathname === '/app/') {
    return [{ label: 'Dashboard' }];
  }

  const categoryMatch = pathname.match(/^\/app\/kategori\/([^/]+)/);
  if (categoryMatch) {
    const category = getCategory(categoryMatch[1]);
    if (category) {
      return [{ label: 'Beranda', to: '/app' }, { label: category.label }];
    }
  }

  const featureMatch = pathname.match(/^\/app\/fitur\/([^/]+)/);
  if (featureMatch) {
    const item = getFeature(featureMatch[1]);
    if (item) {
      return [
        { label: 'Beranda', to: '/app' },
        { label: item.categoryLabel, to: `/app/kategori/${item.categorySlug}` },
        { label: item.label },
      ];
    }
  }

  return [{ label: 'Beranda', to: '/app' }];
}
