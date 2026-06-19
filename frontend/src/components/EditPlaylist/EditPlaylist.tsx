import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Search, Check, Loader2, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchSongs } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchPlaylistById, updatePlaylist, deletePlaylist } from '../../infra/playlist.api';
import '../CreateSong/CreateSong.css';
import '../ViewPlaylist/ViewPlaylist.css';

export const EditPlaylist: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/playlists/$id/edit' as any }) as { id: string };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playlistData, songsData] = await Promise.all([
          fetchPlaylistById(id),
          fetchSongs(),
        ]);
        setName(playlistData.name);
        setDescription(playlistData.description || '');
        setSelectedSongIds(playlistData.songIds || []);
        setSongs(songsData);
      } catch (err) {
        console.error('Failed to load playlist details', err);
        setError('Failed to load playlist details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const toggleSong = (songId: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(songId) ? prev.filter((item) => item !== songId) : [...prev, songId]
    );
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Playlist name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePlaylist(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        songIds: selectedSongIds,
      });
      setSuccess(true);
      setTimeout(() => navigate({ to: `/playlists/${id}` as any }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update playlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deletePlaylist(id);
      navigate({ to: '/home', search: { tab: 'playlists' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete playlist.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading playlist details...</p>
      </div>
    );
  }

  return (
    <div className="create-page-container">
      {/* Nav */}
      <nav className="create-page-nav">
        <div className="create-page-logo">
          <div className="create-page-logo-icon">
            <Music size={20} />
          </div>
          <span className="create-page-logo-text">Zikstock</span>
        </div>
        <button
          className="btn-back-dashboard"
          onClick={() => navigate({ to: `/playlists/${id}` as any })}
        >
          <ArrowLeft size={16} />
          <span>Back to View</span>
        </button>
      </nav>

      {/* Page Content */}
      <main className="create-page-main animate-fade-in">
        <div className="create-page-header">
          <h1 className="create-page-title">Edit Playlist</h1>
          <p className="create-page-subtitle">
            Update playlist settings and select songs.
          </p>
        </div>

        {error && <div className="create-page-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Playlist updated successfully! Redirecting...</div>}

        <div className="manage-top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          {!showDeleteConfirm ? (
            <button
              type="button"
              className="btn-delete-resource"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} />
              <span>Delete Playlist</span>
            </button>
          ) : (
            <div className="delete-confirm-group">
              <span className="delete-confirm-text">Are you sure?</span>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={12} className="spinning" /> : 'Yes, Delete'}
              </button>
              <button
                type="button"
                className="btn-cancel-delete"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="create-page-form glass-panel">
          <div className="form-group-flex">
            <label className="form-label" htmlFor="playlist-name">Playlist Name</label>
            <input
              type="text"
              id="playlist-name"
              className="form-input-field"
              placeholder="e.g. Sunday Morning Jam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group-flex">
            <label className="form-label" htmlFor="playlist-desc">Description (Optional)</label>
            <textarea
              id="playlist-desc"
              className="form-input-field form-textarea-field"
              placeholder="e.g. Chill acoustic tunes to practice fingerpicking"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="form-group-flex">
            <label className="form-label">Add Songs</label>
            <div className="search-filter-box">
              <Search size={14} className="search-filter-icon" />
              <input
                type="text"
                className="search-filter-input"
                placeholder="Search songs by title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredSongs.length === 0 ? (
              <div className="no-resources-msg">No songs found matching query.</div>
            ) : (
              <div className="selection-list-container">
                {filteredSongs.map((song) => {
                  const isChecked = selectedSongIds.includes(song._id);
                  return (
                    <div
                      key={song._id}
                      className={`selection-list-item ${isChecked ? 'selected' : ''}`}
                      onClick={() => toggleSong(song._id)}
                    >
                      <div className="checkbox-indicator">
                        {isChecked && <Check size={12} />}
                      </div>
                      <div className="item-meta">
                        <span className="item-title">{song.title}</span>
                        <span className="item-artist">by {song.artist}</span>
                      </div>
                      <div className="playlist-item-badge">
                        <Music size={12} />
                        <span>{song.zikresourceIds.length} resources</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-actions-row">
            <button
              type="button"
              className="btn-secondary-action"
              onClick={() => navigate({ to: `/playlists/${id}` as any })}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>Saving changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
