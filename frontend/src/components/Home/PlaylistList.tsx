import React, { useState } from 'react';
import { Folder, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Playlist } from '../../infra/playlist.api';
import { useTranslation } from '../../hooks/useTranslation';

interface PlaylistListProps {
  playlists: Playlist[];
  onDelete: (id: string) => Promise<void>;
}

export const PlaylistList: React.FC<PlaylistListProps> = ({ playlists, onDelete }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting playlist in list component:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (playlists.length === 0) {
    return (
      <div className="no-results-panel glass-panel">
        <p>{t.dashboard.noPlaylistsFound}</p>
      </div>
    );
  }

  return (
    <div className="playlists-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {playlists.map((playlist) => {
        const isDeleting = deletingId === playlist._id;
        const isConfirming = confirmDeleteId === playlist._id;

        return (
          <div
            key={playlist._id}
            className="playlist-row-card glass-panel"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
            onClick={() => navigate({ to: '/playlists/$id', params: { id: playlist._id } })}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="playlist-icon-wrapper" style={{ background: '#8b5cf6', color: '#fff', padding: '0.5rem', borderRadius: '8px' }}>
                  <Folder size={20} />
                </div>
                <div>
                  <h3 className="playlist-row-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{playlist.name}</h3>
                  <p className="playlist-row-desc" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)' }}>
                    {playlist.description || t.common.noDescription} • {playlist.songIds.length} {playlist.songIds.length > 1 ? t.common.songsCountPlural : t.common.songsCountSingular}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="playlist-actions" onClick={(e) => e.stopPropagation()}>
                  {isConfirming ? (
                    <div className="confirm-delete-actions" style={{ position: 'static' }}>
                      <button
                        className="btn-confirm-delete"
                        disabled={isDeleting}
                        onClick={() => handleDelete(playlist._id)}
                      >
                        {isDeleting ? <Loader2 size={13} className="spinning" /> : t.common.confirm}
                      </button>
                      <button
                        className="btn-cancel-delete"
                        disabled={isDeleting}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        {t.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-card-delete"
                      onClick={() => setConfirmDeleteId(playlist._id)}
                      aria-label="Delete playlist"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #9ca3af)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

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
