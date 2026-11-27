import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Search } from 'lucide-react';

import { useAuth } from '../app/AuthProvider.jsx';
import { categories, searchFeatures } from '../data/navigation.js';

export default function DashboardPage() {
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const quickFeatures = searchFeatures(query);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <span className="badge" style={{ marginBottom: 8 }}>
            <CheckCircle2 size={14} />
            <span>Status Akademik: Aktif (Semester Ganjil 2026/2027)</span>
          </span>
          <h2 style={{ margin: '4px 0', fontSize: '1.35rem' }}>Selamat datang, {session?.name}</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Seluruh 32 layanan SILINCAH kini diringkas ke dalam 6 kategori utama agar lebih cepat diakses dari ponsel maupun laptop.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/app/fitur/jadwal" className="btn btn-primary">
            <CalendarDays size={18} />
            <span>Jadwal Hari Ini</span>
          </Link>
          <Link to="/app/fitur/krs" className="btn btn-ghost">
            <span>Cek Status KRS</span>
          </Link>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
            {query.trim() ? `Hasil Pencarian Fitur (${quickFeatures.length})` : 'Akses Cepat Fitur Utama'}
          </h3>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
            <input
              type="search"
              className="search-input"
              placeholder="Cari KRS, tugas, transkrip, tagihan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari fitur kampus"
            />
          </div>
        </div>

        <div className="grid-cards">
          {quickFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={`/app/fitur/${item.slug}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.categoryLabel}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.label}</div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem' }}>Kategori Layanan Kampus (6 Kelompok)</h3>
        <div className="grid-cards">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.id} to={`/app/kategori/${cat.slug}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span className="badge">
                      <Icon size={15} />
                      <span>{cat.features.length} Fitur</span>
                    </span>
                    <ArrowRight size={18} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{cat.label}</div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Clock size={20} color="var(--primary)" />
        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <strong>Catatan Pengingat:</strong> Tampilan jadwal, pengumpulan berkas tugas langsung (PDF/DOCX), dan notifikasi tenggat disiapkan untuk penyempurnaan pada tahap fitur berikutnya.
        </div>
      </section>
    </div>
  );
}
