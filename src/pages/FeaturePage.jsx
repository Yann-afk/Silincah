import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';

import JadwalFeature from '../components/features/JadwalFeature.jsx';
import KrsFeature from '../components/features/KrsFeature.jsx';
import NilaiFeature from '../components/features/NilaiFeature.jsx';
import PresensiFeature from '../components/features/PresensiFeature.jsx';
import TugasFeature from '../components/features/TugasFeature.jsx';
import { getFeature } from '../data/navigation.js';

// Fitur yang sudah diimplementasikan sebagai halaman interaktif.
// Fitur lain masih menampilkan blueprint rencana perbaikan UI/UX.
const FEATURE_COMPONENTS = {
  jadwal: JadwalFeature,
  krs: KrsFeature,
  nilai: NilaiFeature,
  presensi: PresensiFeature,
  tugas: TugasFeature,
};

export default function FeaturePage() {
  const { featureSlug } = useParams();
  const feature = getFeature(featureSlug);

  if (!feature) {
    return (
      <div className="card">
        <h2>Fitur tidak ditemukan</h2>
        <Link to="/app" className="btn btn-primary">Kembali ke Dashboard</Link>
      </div>
    );
  }

  const Icon = feature.icon;
  const FeatureComponent = FEATURE_COMPONENTS[feature.id];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon size={24} />
            </div>
            <div>
              <span className="badge" style={{ marginBottom: 6 }}>
                <Layers size={14} />
                <span>{feature.categoryLabel} · Menu Lama: {feature.legacyLabel}</span>
              </span>
              <h2 style={{ margin: '4px 0', fontSize: '1.3rem' }}>{feature.title}</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.94rem' }}>{feature.description}</p>
            </div>
          </div>

          <Link to={`/app/kategori/${feature.categorySlug}`} className="btn btn-ghost">
            <ArrowLeft size={16} />
            <span>Kembali ke {feature.categoryLabel}</span>
          </Link>
        </div>
      </div>

      {FeatureComponent ? (
        <FeatureComponent />
      ) : (
        <div className="card">
          <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem' }}>Rencana Perbaikan UI/UX pada Halaman Ini</h3>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feature.blueprint.map((point) => (
              <li key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
