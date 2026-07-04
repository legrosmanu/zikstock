import React from 'react';
import { Music, ChevronRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Song } from '../../infra/song.api';
import { useTranslation } from '../../hooks/useTranslation';

interface SongListProps {
  songs: Song[];
}

export const SongList: React.FC<SongListProps> = ({ songs }) => {
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
    <div className="playlists-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {songs.map((song) => {

        return (
          <div
            key={song._id}
            className="playlist-row-card glass-panel"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
            onClick={() => navigate({ to: '/songs/$id', params: { id: song._id } })}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="playlist-icon-wrapper" style={{ background: '#8b5cf6', color: '#fff', padding: '0.5rem', borderRadius: '8px' }}>
                  <Music size={20} />
                </div>
                <div>
                  <h3 className="playlist-row-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{song.title}</h3>
                  <p className="playlist-row-desc" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)' }}>
                    {song.artist || t.common.unknownArtist} • {song.zikresourceIds.length} {song.zikresourceIds.length > 1 ? t.common.resourcesCountPlural : t.common.resourcesCountSingular}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-muted, #9ca3af)', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
