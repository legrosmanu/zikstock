import React, { useState, useEffect } from 'react';
import { Music, Search, FileText, Video, Check, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { createSong } from '../../infra/song.api';
import { useTranslation } from '../../hooks/useTranslation';
import './CreateSong.css';

export const CreateSong: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        setError(t.createSong.errorLoadResources);
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, [t.createSong.errorLoadResources]);

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
      case 'tablature': return t.dashboard.typeTablature;
      case 'video': return t.dashboard.typeVideo;
      default: return t.dashboard.typeBackingTrack;
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
      setError(t.createSong.errorTitleRequired);
      return;
    }
    if (!artist.trim()) {
      setError(t.createSong.errorArtistRequired);
      return;
    }
    if (selectedZikresourceIds.length === 0) {
      setError(t.createSong.errorSelectResource);
      return;
    }

    setIsSubmitting(true);
    try {
      await createSong({
        title: title.trim(),
        artist: artist.trim(),
        zikresourceIds: selectedZikresourceIds,
      });
      navigate({ to: '/home', search: { tab: 'songs' } as never, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.createSong.errorCreateFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-page-container">
      {/* Page Content */}
      <main className="create-page-main animate-fade-in">
        <div className="create-page-header">
          <h1 className="create-page-title">{t.createSong.title}</h1>
          <p className="create-page-subtitle">
            {t.createSong.subtitle}
          </p>
        </div>

        {error && <div className="create-page-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-page-form glass-panel">
          <div className="form-row">
            <div className="form-group-flex">
              <label className="form-label" htmlFor="song-title">{t.createSong.fieldTitle}</label>
              <input
                type="text"
                id="song-title"
                className="form-input-field"
                placeholder={t.createSong.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group-flex">
              <label className="form-label" htmlFor="song-artist">{t.createSong.fieldArtist}</label>
              <input
                type="text"
                id="song-artist"
                className="form-input-field"
                placeholder={t.createSong.artistPlaceholder}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group-flex">
            <label className="form-label">{t.createSong.fieldSelectResources}</label>
            <div className="search-filter-box">
              <Search size={14} className="search-filter-icon" />
              <input
                type="text"
                className="search-filter-input"
                placeholder={t.createSong.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="resources-loading-msg">{t.createSong.loading}</div>
            ) : filteredResources.length === 0 ? (
              <div className="no-resources-msg">{t.createSong.noResourcesFound}</div>
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
              onClick={() => navigate({ to: '/home', search: { tab: 'songs' } as never, replace: true })}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </button>
            <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.createSong.saving}</span>
                </>
              ) : (
                <span>{t.createSong.saveButton}</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
