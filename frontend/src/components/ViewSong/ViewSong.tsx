import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Trash2, Edit, Copy, Check } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchSongById, deleteSong, cloneSong } from '../../infra/song.api';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Song } from '../../infra/song.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { HttpError } from '../../infra/httpClient';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../store/authStore';
import { ZikresourceCard } from '../Cards/ZikresourceCard';
import '../CreateSong/CreateSong.css';
import './ViewSong.css';
import '../Cards/Card.css';

export const ViewSong: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/songs/$id' }) as { id: string };
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccessId, setCloneSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [associatedResources, setAssociatedResources] = useState<Zikresource[]>([]);

  const user = useAuthStore((state) => state.user);
  const isOwner = user?.sub === song?.createdBy;

  const handleClone = async () => {
    setIsCloning(true);
    setError(null);
    setCloneSuccessId(null);
    try {
      const result = await cloneSong(id);
      setCloneSuccessId(result.song._id);
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        setError(t.viewSong.alreadyCloned);
      } else {
        setError(err instanceof Error ? err.message : t.viewSong.cloneError);
      }
    } finally {
      setIsCloning(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setCloneSuccessId(null);
    setShowDeleteConfirm(false);

    const loadData = async () => {
      try {
        const [songData, allResources] = await Promise.all([
          fetchSongById(id),
          fetchZikresources({ scope: 'all' }),
        ]);
        if (isMounted) {
          setSong(songData);
          const resourceIds = songData.zikresourceIds || [];
          const matched = allResources.filter(r => resourceIds.includes(r._id));
          setAssociatedResources(matched);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load song data', err);
          setError(t.viewSong.errorLoadFailed);
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
  }, [id, t.viewSong.errorLoadFailed]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSong(id);
      navigate({ to: '/home', search: { tab: 'songs' } as never });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.viewSong.errorDeleteFailed);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{t.viewSong.loadingDetails}</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="manage-loading-container">
        <p style={{ color: '#ef4444' }}>{t.viewSong.notFound}</p>
        <button className="btn-back-dashboard" onClick={() => navigate({ to: '/home', search: { tab: 'songs' } as never })} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>{t.common.backToHome || 'Home'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="create-page-container">

      {/* Page Content */}
      <main className="create-page-main animate-fade-in">
        <div className="create-page-header">
          <h1 className="create-page-title">{song.title}</h1>
          <p className="create-page-subtitle">
            {t.common.by} {song.artist}
          </p>
        </div>

        {error && <div className="create-page-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        {isOwner && (
          <div key="owner-actions" className="manage-top-actions">
            <div className="action-buttons-left">
              <button
                key="btn-edit-song"
                type="button"
                className="btn-edit-song"
                onClick={() => navigate({ to: `/songs/${id}/edit` as never })}
              >
                <Edit size={14} />
                <span>{t.viewSong.btnEdit}</span>
              </button>
            </div>

            {!showDeleteConfirm ? (
              <button
                key="btn-delete-song"
                type="button"
                className="btn-delete-resource"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={14} />
                <span>{t.viewSong.btnDelete}</span>
              </button>
            ) : (
              <div key="delete-confirm-group" className="delete-confirm-group">
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

        {!isOwner && user && (
          <div key="non-owner-actions" className="manage-top-actions">
            <div className="action-buttons-left">
              {cloneSuccessId ? (
                <button
                  key="btn-clone-success"
                  type="button"
                  className="btn-clone-song success"
                  onClick={() => navigate({ to: `/songs/${cloneSuccessId}` as never })}
                >
                  <Check size={14} />
                  <span>{t.viewSong.cloneSuccess}</span>
                </button>
              ) : (
                <button
                  key="btn-clone-song"
                  type="button"
                  className="btn-clone-song"
                  onClick={handleClone}
                  disabled={isCloning}
                >
                  {isCloning ? <Loader2 size={14} className="spinning" /> : <Copy size={14} />}
                  <span>{isCloning ? t.viewSong.cloning : t.viewSong.btnClone}</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="song-detail-panel glass-panel">
          <h2 className="section-title">{t.viewSong.resourcesSectionTitle}</h2>
          
          {associatedResources.length === 0 ? (
            <p className="no-resources-message">{t.viewSong.noResourcesText}</p>
          ) : (
            <div className="reverb-cards-grid" style={{ marginTop: '1rem' }}>
              {associatedResources.map((res) => (
                <ZikresourceCard
                  key={res._id}
                  resource={res}
                  viewMode="grid"
                  onClick={() => navigate({ to: `/zikresources/${res._id}` as never })}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
