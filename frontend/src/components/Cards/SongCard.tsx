import React from 'react';
import { Music, Users, User, ChevronRight } from 'lucide-react';
import type { Song } from '../../infra/song.api';
import { useTranslation } from '../../hooks/useTranslation';
import './Card.css';

interface SongCardProps {
  song: Song;
  viewMode?: 'grid' | 'list';
  isNetworkMember?: boolean;
  isSelf?: boolean;
  onClick?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  viewMode = 'grid',
  isNetworkMember = false,
  isSelf = false,
  onClick
}) => {
  const { t } = useTranslation();
  const resourceCount = song.zikresourceIds?.length || 0;

  if (viewMode === 'list') {
    return (
      <div
        className={`reverb-card list-mode ${isNetworkMember ? 'network-highlight' : ''}`}
        onClick={onClick}
      >
        <div className="reverb-card-header type-song">
          <div className="reverb-header-icon-badge">
            <Music size={18} />
          </div>
        </div>

        <div className="reverb-card-body">
          <h3 className="reverb-card-title">{song.title}</h3>
          <p className="reverb-card-subtitle">
            {song.artist || t.common.unknownArtist} • {resourceCount} {resourceCount === 1 ? t.common.resourcesCountSingular : t.common.resourcesCountPlural}
          </p>
        </div>

        {song.creatorName && (
          <div className="reverb-card-footer">
            <div className="reverb-creator-info">
              {song.creatorPicture ? (
                <img src={song.creatorPicture} alt={song.creatorName} className="reverb-creator-avatar" />
              ) : (
                <div className="reverb-creator-avatar-fallback">
                  <User size={12} />
                </div>
              )}
              <span className="reverb-creator-name">
                {isSelf ? 'Vous' : song.creatorName}
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
      <div className="reverb-card-header type-song">
        <div className="reverb-header-icon-badge">
          <Music size={18} />
        </div>
        <span className="reverb-header-badge-text">
          {t.sidebar.songs}
        </span>
      </div>

      <div className="reverb-card-body">
        <h3 className="reverb-card-title">{song.title}</h3>
        <p className="reverb-card-subtitle">{song.artist || t.common.unknownArtist}</p>

        <div className="reverb-card-tags">
          <span className="reverb-tag-pill">
            🎵 {resourceCount} {resourceCount === 1 ? t.common.resourcesCountSingular : t.common.resourcesCountPlural}
          </span>
        </div>
      </div>

      {song.creatorName && (
        <div className="reverb-card-footer">
          <div className="reverb-creator-info">
            {song.creatorPicture ? (
              <img src={song.creatorPicture} alt={song.creatorName} className="reverb-creator-avatar" />
            ) : (
              <div className="reverb-creator-avatar-fallback">
                <User size={12} />
              </div>
            )}
            <span className="reverb-creator-name">
              {t.search.addedBy} {isSelf ? 'Vous' : song.creatorName}
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
