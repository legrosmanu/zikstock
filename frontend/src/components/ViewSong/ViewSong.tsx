import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Loader2, Trash2, Edit, FileText, Video, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchSongById, deleteSong } from '../../infra/song.api';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Song } from '../../infra/song.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../store/authStore';
import '../CreateSong/CreateSong.css';
import './ViewSong.css';

export const ViewSong: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/songs/$id' }) as { id: string };
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
  const [song, setSong] = useState<Song | null>(null);
  const [associatedResources, setAssociatedResources] = useState<Zikresource[]>([]);

  const user = useAuthStore((state) => state.user);
  const isOwner = user?.sub === song?.createdBy;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [songData, allResources] = await Promise.all([
          fetchSongById(id),
          fetchZikresources({ scope: 'all' }),
        ]);
        setSong(songData);
        
        const resourceIds = songData.zikresourceIds || [];
        const matched = allResources.filter(r => resourceIds.includes(r._id));
        setAssociatedResources(matched);
      } catch (err) {
        console.error('Failed to load song data', err);
        setError(t.viewSong.errorLoadFailed);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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
          <h1 className="create-page-title">{song.title}</h1>
          <p className="create-page-subtitle">
            {t.common.by} {song.artist}
          </p>
        </div>

        {error && <div className="create-page-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        {isOwner && (
          <div className="manage-top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-edit-song"
              onClick={() => navigate({ to: `/songs/${id}/edit` as never })}
            >
              <Edit size={14} />
              <span>{t.viewSong.btnEdit}</span>
            </button>

            {!showDeleteConfirm ? (
              <button
                type="button"
                className="btn-delete-resource"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={14} />
                <span>{t.viewSong.btnDelete}</span>
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

        <div className="song-detail-panel glass-panel">
          <h2 className="section-title">{t.viewSong.resourcesSectionTitle}</h2>
          
          {associatedResources.length === 0 ? (
            <p className="no-resources-message">{t.viewSong.noResourcesText}</p>
          ) : (
            <div className="associated-resources-list">
              {associatedResources.map((res) => (
                <div key={res._id} className="resource-card glass-panel">
                  <div className="resource-card-left">
                    <span className="resource-card-title">{res.title}</span>
                    <span className="resource-card-artist">{t.common.by} {res.artist}</span>
                    {res.tags && res.tags.length > 0 && (
                      <div className="resource-card-tags">
                        {res.tags.map(tag => (
                          <span key={tag.value} className="resource-tag-badge">
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="resource-card-right">
                    <span className={`item-badge type-${res.type}`}>
                      {getResourceIcon(res.type)}
                      <span>{getResourceLabel(res.type)}</span>
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-link"
                    >
                      <ExternalLink size={14} />
                      <span>{t.viewSong.btnOpenLink}</span>
                    </a>
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
