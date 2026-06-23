import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Search, FileText, Video, Check, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { createSong } from '../../infra/song.api';
import './CreateSong.css';

export const CreateSong: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [selectedZikresourceIds, setSelectedZikresourceIds] = useState<string[]>([]);
  const [zikresources, setZikresources] = useState<Zikresource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await fetchZikresources();
        setZikresources(data);
      } catch (err) {
        console.error('Failed to load resources', err);
        setError('Failed to load Zikresources.');
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, []);

  const toggleResource = (id: string) => {
    setSelectedZikresourceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'tablature': return <FileText size={14} />;
      case 'video': return <Video size={14} />;
      default: return <Music size={14} />;
    }
  };

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'tablature': return 'Tab';
      case 'video': return 'Video';
      default: return 'Track';
    }
  };

  const filteredResources = zikresources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Song title is required.');
      return;
    }
    if (!artist.trim()) {
      setError('Artist is required.');
      return;
    }
    if (selectedZikresourceIds.length === 0) {
      setError('Please select at least one Zikresource.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSong({
        title: title.trim(),
        artist: artist.trim(),
        zikresourceIds: selectedZikresourceIds,
      });
      navigate({ to: '/home', search: { tab: 'songs' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create song.');
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
          <h1 className="create-page-title">Create a Song</h1>
          <p className="create-page-subtitle">
            Group multiple Zikresources (tutorials, tabs, tracks) under a single song title for easier practice.
          </p>
        </div>

        {error && <div className="create-page-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-page-form glass-panel">
          <div className="form-row">
            <div className="form-group-flex">
              <label className="form-label" htmlFor="song-title">Song Title</label>
              <input
                type="text"
                id="song-title"
                className="form-input-field"
                placeholder="e.g. Come As You Are"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group-flex">
              <label className="form-label" htmlFor="song-artist">Artist</label>
              <input
                type="text"
                id="song-artist"
                className="form-input-field"
                placeholder="e.g. Nirvana"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group-flex">
            <label className="form-label">Select Associated Zikresources</label>
            <div className="search-filter-box">
              <Search size={14} className="search-filter-icon" />
              <input
                type="text"
                className="search-filter-input"
                placeholder="Search resources by title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="resources-loading-msg">Loading resources...</div>
            ) : filteredResources.length === 0 ? (
              <div className="no-resources-msg">No Zikresources found. Add some resources first!</div>
            ) : (
              <div className="selection-list-container">
                {filteredResources.map((res) => {
                  const isChecked = selectedZikresourceIds.includes(res._id);
                  return (
                    <div
                      key={res._id}
                      className={`selection-list-item ${isChecked ? 'selected' : ''}`}
                      onClick={() => toggleResource(res._id)}
                    >
                      <div className="checkbox-indicator">
                        {isChecked && <Check size={12} />}
                      </div>
                      <div className="item-meta">
                        <span className="item-title">{res.title}</span>
                        <span className="item-artist">{res.artist}</span>
                      </div>
                      <div className={`item-badge type-${res.type}`}>
                        {getResourceIcon(res.type)}
                        <span>{getResourceLabel(res.type)}</span>
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
                  <span>Saving Song...</span>
                </>
              ) : (
                <span>Save Song</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
