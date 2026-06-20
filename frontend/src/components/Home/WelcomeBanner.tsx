import React from 'react';
import { FileText, Folder, Music } from 'lucide-react';

export const WelcomeBanner: React.FC = () => {
  return (
    <section className="welcome-banner glass-panel">
      <h1 className="welcome-title">
        Manage your repertoire
      </h1>
      <p className="welcome-subtitle">
        Welcome to your musical workspace. Use this space to organize your practice material at three levels of hierarchy:
      </p>

      <div className="concept-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
        <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary, #8b5cf6)' }}>
            <FileText size={18} />
            <h4 style={{ margin: 0, fontWeight: 700 }}>Zikresources</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
            Save links to tabs, sheet music, video tutorials, or backing tracks.
          </p>
        </div>

        <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981' }}>
            <Folder size={18} />
            <h4 style={{ margin: 0, fontWeight: 700 }}>Playlists</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
            Organize zikresources or songs into custom playlists for gigs or focused practice sessions.
          </p>
        </div>

        <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-secondary, #d946ef)' }}>
            <Music size={18} />
            <h4 style={{ margin: 0, fontWeight: 700 }}>Songs</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
            Group your saved resources under unified song titles.
          </p>
        </div>
      </div>
    </section>
  );
};
