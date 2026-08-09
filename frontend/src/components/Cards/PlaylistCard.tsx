import React from 'react';
import { Folder, Users, User, ChevronRight } from 'lucide-react';
import type { Playlist } from '../../infra/playlist.api';
import { useTranslation } from '../../hooks/useTranslation';
import './Card.css';

interface PlaylistCardProps {
  playlist: Playlist;
  viewMode?: 'grid' | 'list';
  isNetworkMember?: boolean;
  isSelf?: boolean;
  onClick?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  viewMode = 'grid',
  isNetworkMember = false,
  isSelf = false,
  onClick
}) => {
  const { t } = useTranslation();
  const songCount = playlist.songIds?.length || 0;
  const resourceCount = playlist.zikresourceIds?.length || 0;

  if (viewMode === 'list') {
    return (
      <div
        className={`reverb-card list-mode ${isNetworkMember ? 'network-highlight' : ''}`}
        onClick={onClick}
      >
        <div className="reverb-card-header type-playlist">
          <div className="reverb-header-icon-badge">
            <Folder size={18} />
          </div>
        </div>

        <div className="reverb-card-body">
          <h3 className="reverb-card-title">{playlist.name}</h3>
          <p className="reverb-card-subtitle">
            {playlist.description || t.common.noDescription} • {songCount} {songCount === 1 ? t.common.songsCountSingular : t.common.songsCountPlural}
          </p>
        </div>

        {playlist.creatorName && (
          <div className="reverb-card-footer">
            <div className="reverb-creator-info">
              {playlist.creatorPicture ? (
                <img src={playlist.creatorPicture} alt={playlist.creatorName} className="reverb-creator-avatar" />
              ) : (
                <div className="reverb-creator-avatar-fallback">
                  <User size={12} />
                </div>
              )}
              <span className="reverb-creator-name">
                {isSelf ? 'Vous' : playlist.creatorName}
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
      <div className="reverb-card-header type-playlist">
        <div className="reverb-header-icon-badge">
          <Folder size={18} />
        </div>
        <span className="reverb-header-badge-text">
          {t.sidebar.playlists}
        </span>
      </div>

      <div className="reverb-card-body">
        <h3 className="reverb-card-title">{playlist.name}</h3>
        <p className="reverb-card-subtitle">{playlist.description || t.common.noDescription}</p>

        <div className="reverb-card-tags">
          <span className="reverb-tag-pill">
            🎼 {songCount} {songCount === 1 ? t.common.songsCountSingular : t.common.songsCountPlural}
          </span>
          {resourceCount > 0 && (
            <span className="reverb-tag-pill">
              📎 {resourceCount} {resourceCount === 1 ? t.common.resourcesCountSingular : t.common.resourcesCountPlural}
            </span>
          )}
        </div>
      </div>

      {playlist.creatorName && (
        <div className="reverb-card-footer">
          <div className="reverb-creator-info">
            {playlist.creatorPicture ? (
              <img src={playlist.creatorPicture} alt={playlist.creatorName} className="reverb-creator-avatar" />
            ) : (
              <div className="reverb-creator-avatar-fallback">
                <User size={12} />
              </div>
            )}
            <span className="reverb-creator-name">
              {t.search.addedBy} {isSelf ? 'Vous' : playlist.creatorName}
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
