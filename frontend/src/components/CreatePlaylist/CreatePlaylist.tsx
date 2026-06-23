import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Search, Check, Loader2, BookOpen, Video, HelpCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { fetchSongs } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { createPlaylist } from '../../infra/playlist.api';
import '../CreateSong/CreateSong.css';
import './CreatePlaylist.css';

export const CreatePlaylist: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [selectedZikresourceIds, setSelectedZikresourceIds] = useState<string[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [zikresources, setZikresources] = useState<Zikresource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [zikSearchQuery, setZikSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [songsData, zikData] = await Promise.all([
          fetchSongs(),
          fetchZikresources(),
        ]);
        setSongs(songsData);
        setZikresources(zikData);
      } catch (err) {
        console.error('Failed to load data', err);
        setError('Failed to load songs and zikresources.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleSong = (id: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleZikresource = (id: string) => {
    setSelectedZikresourceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredZikresources = zikresources.filter(
    (z) =>
      z.title.toLowerCase().includes(zikSearchQuery.toLowerCase()) ||
      z.artist.toLowerCase().includes(zikSearchQuery.toLowerCase())
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
      await createPlaylist({
        name: name.trim(),
        description: description.trim() || undefined,
        songIds: selectedSongIds,
        zikresourceIds: selectedZikresourceIds,
      });
      navigate({ to: '/home', search: { tab: 'playlists' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-page-container">
      {/* Nav */}
      <nav className="create-page-nav">
        <button
          className="btn-back-dashboard"
          onClick={() => navigate({ to: '/home' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
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
          <h1 className="create-page-title">Create a Playlist</h1>
          <p className="create-page-subtitle">
            Group your zikresource or songs together to plan practice sessions or build a performance setlist.
          </p>
        </div>

        {error && <div className="create-page-error">{error}</div>}

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
            <label className="form-label">Add Zikresources</label>
            <div className="search-filter-box">
              <Search size={14} className="search-filter-icon" />
              <input
                type="text"
                className="search-filter-input"
                placeholder="Search zikresources by title or artist..."
                value={zikSearchQuery}
                onChange={(e) => setZikSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="resources-loading-msg">Loading zikresources...</div>
            ) : filteredZikresources.length === 0 ? (
              <div className="no-resources-msg">No zikresources found. Create a Zikresource first!</div>
            ) : (
              <div className="selection-list-container">
                {filteredZikresources.map((res) => {
                  const isChecked = selectedZikresourceIds.includes(res._id);
                  return (
                    <div
                      key={res._id}
                      className={`selection-list-item ${isChecked ? 'selected' : ''}`}
                      onClick={() => toggleZikresource(res._id)}
                    >
                      <div className="checkbox-indicator">
                        {isChecked && <Check size={12} />}
                      </div>
                      <div className="item-meta">
                        <span className="item-title">{res.title}</span>
                        <span className="item-artist">by {res.artist}</span>
                      </div>
                      <div className="playlist-item-badge">
                        {res.type === 'tablature' && <BookOpen size={12} />}
                        {res.type === 'video' && <Video size={12} />}
                        {res.type === 'backing-track' && <Music size={12} />}
                        {res.type === 'other' && <HelpCircle size={12} />}
                        <span style={{ marginLeft: '4px' }}>{res.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group-flex" style={{ marginTop: '1.5rem' }}>
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

            {isLoading ? (
              <div className="resources-loading-msg">Loading songs...</div>
            ) : filteredSongs.length === 0 ? (
              <div className="no-resources-msg">No songs found. Create a Song first!</div>
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
              onClick={() => navigate({ to: '/home' })}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Playlist...</span>
                </>
              ) : (
                <span>Save Playlist</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
