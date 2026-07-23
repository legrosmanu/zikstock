import React, { useState, useEffect } from 'react';
import { Music, Search, Check, Loader2, BookOpen, Video, HelpCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { fetchSongs } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { createPlaylist } from '../../infra/playlist.api';
import { useTranslation } from '../../hooks/useTranslation';
import '../CreateSong/CreateSong.css';
import './CreatePlaylist.css';

export const CreatePlaylist: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        setError(t.createPlaylist.errorLoadData);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [t.createPlaylist.errorLoadData]);

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
      setError(t.createPlaylist.errorNameRequired);
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
      navigate({ to: '/home', search: { tab: 'playlists' } as never, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.createPlaylist.errorCreateFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-page-container">
      {/* Page Content */}
      <main className="create-page-main animate-fade-in">
        <div className="create-page-header">
          <h1 className="create-page-title">{t.createPlaylist.title}</h1>
          <p className="create-page-subtitle">
            {t.createPlaylist.subtitle}
          </p>
        </div>

        {error && <div className="create-page-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-page-form glass-panel">
          <div className="form-group-flex">
            <label className="form-label" htmlFor="playlist-name">{t.createPlaylist.fieldName}</label>
            <input
              type="text"
              id="playlist-name"
              className="form-input-field"
              placeholder={t.createPlaylist.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group-flex">
            <label className="form-label" htmlFor="playlist-desc">{t.createPlaylist.fieldDescription}</label>
            <textarea
              id="playlist-desc"
              className="form-input-field form-textarea-field"
              placeholder={t.createPlaylist.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="form-group-flex">
            <label className="form-label">{t.createPlaylist.fieldAddResources}</label>
            <div className="search-filter-box">
              <Search size={14} className="search-filter-icon" />
              <input
                type="text"
                className="search-filter-input"
                placeholder={t.createPlaylist.searchResourcesPlaceholder}
                value={zikSearchQuery}
                onChange={(e) => setZikSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="resources-loading-msg">{t.createPlaylist.loadingResources}</div>
            ) : filteredZikresources.length === 0 ? (
              <div className="no-resources-msg">{t.createPlaylist.noResourcesFound}</div>
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
                        <span className="item-artist">{t.common.by} {res.artist}</span>
                      </div>
                      <div className="playlist-item-badge">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group-flex" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">{t.createPlaylist.fieldAddSongs}</label>
            <div className="search-filter-box">
              <Search size={14} className="search-filter-icon" />
              <input
                type="text"
                className="search-filter-input"
                placeholder={t.createPlaylist.searchSongsPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="resources-loading-msg">{t.createPlaylist.loadingSongs}</div>
            ) : filteredSongs.length === 0 ? (
              <div className="no-resources-msg">{t.createPlaylist.noSongsFound}</div>
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
                        <span className="item-artist">{t.common.by} {song.artist}</span>
                      </div>
                      <div className="playlist-item-badge">
                        <Music size={12} />
                        <span>{song.zikresourceIds.length} {song.zikresourceIds.length > 1 ? t.common.resourcesCountPlural : t.common.resourcesCountSingular}</span>
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
              onClick={() => navigate({ to: '/home', search: { tab: 'playlists' } as never, replace: true })}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </button>
            <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.createPlaylist.saving}</span>
                </>
              ) : (
                <span>{t.createPlaylist.saveButton}</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
