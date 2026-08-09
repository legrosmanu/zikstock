import React from 'react';
import { BookOpen, Video, Music, Mic, HelpCircle, Users, User, ChevronRight } from 'lucide-react';
import type { Zikresource } from '../../infra/zikresource.api';
import { useTranslation } from '../../hooks/useTranslation';
import './Card.css';

interface ZikresourceCardProps {
  resource: Zikresource;
  viewMode?: 'grid' | 'list';
  isNetworkMember?: boolean;
  isSelf?: boolean;
  onClick?: () => void;
}

export const ZikresourceCard: React.FC<ZikresourceCardProps> = ({
  resource,
  viewMode = 'grid',
  isNetworkMember = false,
  isSelf = false,
  onClick
}) => {
  const { t } = useTranslation();

  const getZikIcon = (type: string) => {
    switch (type) {
      case 'tablature': return <BookOpen size={18} />;
      case 'video': return <Video size={18} />;
      case 'backing-track': return <Music size={18} />;
      case 'lyrics': return <Mic size={18} />;
      default: return <HelpCircle size={18} />;
    }
  };

  const getZikLabel = (type: string) => {
    switch (type) {
      case 'tablature': return t.dashboard.typeTablature;
      case 'video': return t.dashboard.typeVideo;
      case 'backing-track': return t.dashboard.typeBackingTrack;
      case 'lyrics': return t.dashboard.typeLyrics;
      default: return t.dashboard.typeOther;
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`reverb-card list-mode ${isNetworkMember ? 'network-highlight' : ''}`}
        onClick={onClick}
      >
        <div className={`reverb-card-header type-${resource.type}`}>
          <div className="reverb-header-icon-badge">
            {getZikIcon(resource.type)}
          </div>
        </div>

        <div className="reverb-card-body">
          <h3 className="reverb-card-title">{resource.title}</h3>
          <p className="reverb-card-subtitle">
            {resource.artist || t.common.unknownArtist} • <span style={{ opacity: 0.8 }}>{getZikLabel(resource.type)}</span>
          </p>
          {resource.tags && resource.tags.length > 0 && (
            <div className="reverb-card-tags">
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="reverb-tag-pill">
                  {tag.label}: {tag.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {resource.creatorName && (
          <div className="reverb-card-footer">
            <div className="reverb-creator-info">
              {resource.creatorPicture ? (
                <img src={resource.creatorPicture} alt={resource.creatorName} className="reverb-creator-avatar" />
              ) : (
                <div className="reverb-creator-avatar-fallback">
                  <User size={12} />
                </div>
              )}
              <span className="reverb-creator-name">
                {isSelf ? 'Vous' : resource.creatorName}
              </span>
            </div>
            {isNetworkMember && (
              <span className="reverb-network-badge">
                <Users size={12} />
                <span>{t.search.networkMemberBadge}</span>
              </span>
            )}
          </div>
        )}

        <ChevronRight size={18} style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }} />
      </div>
    );
  }

  return (
    <div
      className={`reverb-card ${isNetworkMember ? 'network-highlight' : ''}`}
      onClick={onClick}
    >
      <div className={`reverb-card-header type-${resource.type}`}>
        <div className="reverb-header-icon-badge">
          {getZikIcon(resource.type)}
        </div>
        <span className="reverb-header-badge-text">
          {getZikLabel(resource.type)}
        </span>
      </div>

      <div className="reverb-card-body">
        <h3 className="reverb-card-title">{resource.title}</h3>
        <p className="reverb-card-subtitle">{resource.artist || t.common.unknownArtist}</p>

        {resource.tags && resource.tags.length > 0 && (
          <div className="reverb-card-tags">
            {resource.tags.map((tag, idx) => (
              <span key={idx} className="reverb-tag-pill">
                {tag.label}: {tag.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {resource.creatorName && (
        <div className="reverb-card-footer">
          <div className="reverb-creator-info">
            {resource.creatorPicture ? (
              <img src={resource.creatorPicture} alt={resource.creatorName} className="reverb-creator-avatar" />
            ) : (
              <div className="reverb-creator-avatar-fallback">
                <User size={12} />
              </div>
            )}
            <span className="reverb-creator-name">
              {t.search.addedBy} {isSelf ? 'Vous' : resource.creatorName}
            </span>
          </div>

          {isNetworkMember && (
            <span className="reverb-network-badge">
              <Users size={12} />
              <span>{t.search.networkMemberBadge}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
