import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { createSong } from '../../infra/song.api';
import { useTranslation } from '../../hooks/useTranslation';
import './CreateSong.css';

export const CreateSong: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setIsSubmitting(true);
    try {
      const newSong = await createSong({
        title: title.trim(),
        artist: artist.trim(),
        zikresourceIds: [],
      });
      navigate({ to: `/songs/${newSong._id}` as never, replace: true });
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
                autoFocus
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
