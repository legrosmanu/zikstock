import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Playlist } from '../../infra/playlist.api';
import { useTranslation } from '../../hooks/useTranslation';
import { PlaylistCard } from '../Cards/PlaylistCard';

interface PlaylistListProps {
  playlists: Playlist[];
  viewMode?: 'grid' | 'list';
}

export const PlaylistList: React.FC<PlaylistListProps> = ({ playlists, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (playlists.length === 0) {
    return (
      <div className="no-results-panel glass-panel">
        <p>{t.dashboard.noPlaylistsFound}</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'reverb-cards-grid' : 'reverb-cards-list'}>
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist._id}
          playlist={playlist}
          viewMode={viewMode}
          onClick={() => navigate({ to: `/playlists/${playlist._id}` })}
        />
      ))}
    </div>
  );
};
