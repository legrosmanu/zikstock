import React from 'react';
import { FileText, Folder, Music } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const WelcomeBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="welcome-banner glass-panel">
      <h1 className="welcome-title">
        {t.welcomeBanner.title}
      </h1>
      <p className="welcome-subtitle">
        {t.welcomeBanner.subtitle}
      </p>

      <div className="concept-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
        <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary, #8b5cf6)' }}>
            <FileText size={18} />
            <h4 style={{ margin: 0, fontWeight: 700 }}>{t.welcomeBanner.cardZikresourcesTitle}</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
            {t.welcomeBanner.cardZikresourcesDesc}
          </p>
        </div>

        <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981' }}>
            <Folder size={18} />
            <h4 style={{ margin: 0, fontWeight: 700 }}>{t.welcomeBanner.cardPlaylistsTitle}</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
            {t.welcomeBanner.cardPlaylistsDesc}
          </p>
        </div>

        <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-secondary, #d946ef)' }}>
            <Music size={18} />
            <h4 style={{ margin: 0, fontWeight: 700 }}>{t.welcomeBanner.cardSongsTitle}</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
            {t.welcomeBanner.cardSongsDesc}
          </p>
        </div>
      </div>
    </section>
  );
};
