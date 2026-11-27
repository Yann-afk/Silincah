import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { getCategory } from '../data/navigation.js';

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const category = getCategory(categorySlug);

  if (!category) {
    return (
      <div className="card">
        <h2>Kategori tidak ditemukan</h2>
        <Link to="/app" className="btn btn-primary">Kembali ke Dashboard</Link>
      </div>
    );
  }

  const CatIcon = category.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <CatIcon size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{category.label}</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.92rem' }}>{category.description}</p>
        </div>
      </div>

      <div className="grid-cards">
        {category.features.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={`/app/fitur/${item.slug}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                    <Icon size={20} />
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </div>
                <div className="card-title">{item.title ?? item.label}</div>
                <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{item.description}</p>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Menu lama: <em>{item.legacyLabel}</em>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
