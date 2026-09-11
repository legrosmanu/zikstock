import React, { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchSongById, updateSong, deleteSong } from '../../infra/song.api';
import { useTranslation } from '../../hooks/useTranslation';
import '../CreateSong/CreateSong.css';
import '../ViewSong/ViewSong.css';

export const EditSong: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/songs/$id/edit' }) as { id: string };
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [existingZikresourceIds, setExistingZikresourceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const songData = await fetchSongById(id);
        if (isMounted) {
          setTitle(songData.title);
          setArtist(songData.artist);
          setExistingZikresourceIds(songData.zikresourceIds || []);
        }
      } catch (err) {
        console.error('Failed to load song data', err);
        if (isMounted) {
          setError(t.editSong.errorLoadFailed);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, t.editSong.errorLoadFailed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedArtist = artist.trim();

    if (!trimmedTitle) {
      setError(t.editSong.errorTitleRequired);
      return;
    }
    if (!trimmedArtist) {
      setError(t.editSong.errorArtistRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSong(id, {
        title: trimmedTitle,
        artist: trimmedArtist,
        zikresourceIds: existingZikresourceIds,
      });
      setSuccess(true);
      setTimeout(() => navigate({ to: `/songs/${id}` as never, replace: true }), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.editSong.errorUpdateFailed);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSong(id);
      navigate({ to: '/home', search: { tab: 'songs' } as never });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.editSong.deleteError);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          {t.editSong.errorLoadFailed === 'Failed to load song details.' ? 'Loading song details...' : 'Chargement du morceau...'}
        </p>
      </div>
    );
  }

  return (
    <div className="create-page-container">
      {/* Page Content */}
      <main className="create-page-main animate-fade-in">
        <div className="create-page-header">
          <h1 className="create-page-title">{t.editSong.title}</h1>
          <p className="create-page-subtitle">
            {t.editSong.subtitle}
          </p>
        </div>

        {error && (
          <div
            className="create-page-error"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}
          >
            {t.editSong.successSaving}
          </div>
        )}

        <div
          className="manage-top-actions"
          style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}
        >
          {!showDeleteConfirm ? (
            <button
              type="button"
              className="btn-delete-resource"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} />
              <span>{t.editSong.btnDelete}</span>
            </button>
          ) : (
            <div className="delete-confirm-group">
              <span className="delete-confirm-text">{t.editSong.deleteConfirm}</span>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={12} className="spinning" /> : t.common.confirm || 'OK'}
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

        <form onSubmit={handleSubmit} className="create-page-form glass-panel">
          <div className="form-row">
            <div className="form-group-flex">
              <label className="form-label" htmlFor="song-title">
                {t.editSong.fieldTitle}
              </label>
              <input
                type="text"
                id="song-title"
                className="form-input-field"
                placeholder={t.editSong.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="form-group-flex">
              <label className="form-label" htmlFor="song-artist">
                {t.editSong.fieldArtist}
              </label>
              <input
                type="text"
                id="song-artist"
                className="form-input-field"
                placeholder={t.editSong.artistPlaceholder}
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
              onClick={() => navigate({ to: `/songs/${id}` as never, replace: true })}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </button>
            <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>{t.editSong.saving}</span>
                </>
              ) : (
                <span>{t.editSong.saveButton}</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
