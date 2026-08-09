import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Song } from '../../infra/song.api';
import { useTranslation } from '../../hooks/useTranslation';
import { SongCard } from '../Cards/SongCard';

interface SongListProps {
  songs: Song[];
  viewMode?: 'grid' | 'list';
}

export const SongList: React.FC<SongListProps> = ({ songs, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (songs.length === 0) {
    return (
      <div className="no-results-panel glass-panel">
        <p>{t.dashboard.noSongsFound}</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'reverb-cards-grid' : 'reverb-cards-list'}>
      {songs.map((song) => (
        <SongCard
          key={song._id}
          song={song}
          viewMode={viewMode}
          onClick={() => navigate({ to: `/songs/${song._id}` })}
        />
      ))}
    </div>
  );
};
