import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Loader2, Trash2, Edit, BookOpen, Video, HelpCircle } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchPlaylistById, deletePlaylist } from '../../infra/playlist.api';
import { fetchSongs } from '../../infra/song.api';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Playlist } from '../../infra/playlist.api';
import type { Song } from '../../infra/song.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../store/authStore';
import '../CreateSong/CreateSong.css';
import './ViewPlaylist.css';

export const ViewPlaylist: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/playlists/$id' }) as { id: string };
  const { t } = useTranslation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: '/home' });
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [associatedSongs, setAssociatedSongs] = useState<Song[]>([]);
  const [associatedZikresources, setAssociatedZikresources] = useState<Zikresource[]>([]);

  const user = useAuthStore((state) => state.user);
  const isOwner = user?.sub === playlist?.createdBy;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playlistData, allSongs, allZikresources] = await Promise.all([
          fetchPlaylistById(id),
          fetchSongs({ scope: 'all' }),
          fetchZikresources({ scope: 'all' }),
        ]);
        setPlaylist(playlistData);
        
        const songIds = playlistData.songIds || [];
        const matchedSongs = allSongs.filter(s => songIds.includes(s._id));
        setAssociatedSongs(matchedSongs);

        const zikIds = playlistData.zikresourceIds || [];
        const matchedZiks = allZikresources.filter(z => zikIds.includes(z._id));
        setAssociatedZikresources(matchedZiks);
      } catch (err) {
        console.error('Failed to load playlist data', err);
        setError(t.viewPlaylist.errorLoadFailed);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, t.viewPlaylist.errorLoadFailed]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deletePlaylist(id);
      navigate({ to: '/home', search: { tab: 'playlists' } as never });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.viewPlaylist.errorDeleteFailed);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{t.viewPlaylist.loadingDetails}</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="manage-loading-container">
        <p style={{ color: '#ef4444' }}>{t.viewPlaylist.notFound}</p>
        <button className="btn-back-dashboard" onClick={handleBack} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>{t.common.back}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="create-page-container">
      {/* Nav */}
      <nav className="create-page-nav">
        <button
          className="btn-back-dashboard"
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          <span>{t.common.back}</span>
        </button>
        <div className="create-page-logo">
          <div className="create-page-logo-icon">
            <Music size={20} />
          </div>
          <span className="create-page-logo-text">Zikstock</span>
        </div>
      </nav>

      {/* Page Content */}
      <main className="create-page-main animate-fade-in">
        <div className="create-page-header">
          <h1 className="create-page-title">{playlist.name}</h1>
          {playlist.description && (
            <p className="create-page-subtitle">
              {playlist.description}
            </p>
          )}
        </div>

        {error && <div className="create-page-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        {isOwner && (
          <div className="manage-top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-edit-playlist"
              onClick={() => navigate({ to: `/playlists/${id}/edit` as never })}
            >
              <Edit size={14} />
              <span>{t.viewPlaylist.btnEdit}</span>
            </button>

            {!showDeleteConfirm ? (
              <button
                type="button"
                className="btn-delete-resource"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={14} />
                <span>{t.viewPlaylist.btnDelete}</span>
              </button>
            ) : (
              <div className="delete-confirm-group">
                <span className="delete-confirm-text">{t.viewZikresource.confirmDeleteText}</span>
                <button
                  type="button"
                  className="btn-confirm-delete"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 size={12} className="spinning" /> : t.viewZikresource.btnConfirmDelete}
                </button>
                <button
                  type="button"
                  className="btn-cancel-delete"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  {t.common.cancel}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="playlist-detail-panel glass-panel">
          <h2 className="section-title">{t.viewPlaylist.songsSectionTitle}</h2>
          
          {associatedSongs.length === 0 ? (
            <p className="no-songs-message">{t.viewPlaylist.noSongsText}</p>
          ) : (
            <div className="associated-songs-list">
              {associatedSongs.map((song) => (
                <div
                  key={song._id}
                  className="song-card glass-panel"
                  onClick={() => navigate({ to: `/songs/${song._id}` as never })}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="song-card-left">
                    <span className="song-card-title">{song.title}</span>
                    <span className="song-card-artist">{t.common.by} {song.artist}</span>
                  </div>
                  <div className="song-card-right">
                    <span className="playlist-item-badge">
                      <Music size={12} />
                      <span>{song.zikresourceIds?.length || 0} {song.zikresourceIds?.length === 1 ? t.common.resourcesCountSingular : t.common.resourcesCountPlural}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="playlist-detail-panel glass-panel" style={{ marginTop: '2rem' }}>
          <h2 className="section-title">{t.viewPlaylist.resourcesSectionTitle}</h2>
          
          {associatedZikresources.length === 0 ? (
            <p className="no-songs-message">{t.viewPlaylist.noResourcesText}</p>
          ) : (
            <div className="associated-songs-list">
              {associatedZikresources.map((res) => (
                <div
                  key={res._id}
                  className="song-card glass-panel"
                  onClick={() => navigate({ to: `/zikresources/${res._id}` as never })}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="song-card-left">
                    <span className="song-card-title">{res.title}</span>
                    <span className="song-card-artist">{t.common.by} {res.artist}</span>
                  </div>
                  <div className="song-card-right">
                    <span className="playlist-item-badge">
                      {res.type === 'tablature' && <BookOpen size={12} />}
                      {res.type === 'video' && <Video size={12} />}
                      {res.type === 'backing-track' && <Music size={12} />}
                      {res.type === 'other' && <HelpCircle size={12} />}
                      <span style={{ marginLeft: '4px' }}>
                        {res.type === 'tablature' && t.dashboard.typeTablature}
                        {res.type === 'video' && t.dashboard.typeVideo}
                        {res.type === 'backing-track' && t.dashboard.typeBackingTrack}
                        {res.type === 'other' && t.dashboard.typeOther}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
