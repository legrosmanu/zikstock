import React from 'react';
import { BookOpen, Video, Music, HelpCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Zikresource } from '../../infra/zikresource.api';
import { useTranslation } from '../../hooks/useTranslation';

interface ZikresourceListProps {
  resources: Zikresource[];
}

export const ZikresourceList: React.FC<ZikresourceListProps> = ({ resources }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tablature': return <BookOpen size={18} />;
      case 'video': return <Video size={18} />;
      case 'backing-track': return <Music size={18} />;
      default: return <HelpCircle size={18} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tablature': return t.dashboard.typeTablature;
      case 'video': return t.dashboard.typeVideo;
      case 'backing-track': return t.dashboard.typeBackingTrack;
      default: return t.dashboard.typeOther;
    }
  };

  if (resources.length === 0) {
    return (
      <div className="no-results-panel glass-panel">
        <p>{t.dashboard.noResourcesFound}</p>
      </div>
    );
  }

  return (
    <div className="playlists-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {resources.map((resource) => {

        return (
          <div
            key={resource._id}
            className="playlist-row-card glass-panel"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
            onClick={() => navigate({ to: '/zikresources/$id', params: { id: resource._id } })}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={`card-icon-wrapper type-${resource.type}`} style={{ padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 className="playlist-row-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{resource.title}</h3>
                    <span className={`card-type-badge type-${resource.type}`} style={{ fontSize: '0.75rem' }}>
                      {getTypeLabel(resource.type)}
                    </span>
                  </div>
                  <p className="playlist-row-desc" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)' }}>
                    {resource.artist || t.common.unknownArtist}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted, #9ca3af)', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="card-tags" style={{ paddingLeft: '3.25rem', margin: 0, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {resource.tags.map((tag, idx) => (
                  <span key={idx} className="card-tag" style={{ margin: 0 }}>
                    {tag.label}: {tag.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
