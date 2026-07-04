import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Tag, Loader2, Trash2, ExternalLink, Edit } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchZikresourceById, deleteZikresource } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { useTranslation } from '../../hooks/useTranslation';
import '../CreateZikresource/CreateZikresource.css';
import './ViewZikresource.css';

export const ViewZikresource: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/zikresources/$id' }) as { id: string };
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resource, setResource] = useState<Zikresource | null>(null);

  useEffect(() => {
    const loadResource = async () => {
      try {
        const data = await fetchZikresourceById(id);
        setResource(data);
      } catch (err) {
        console.error('Failed to load resource', err);
        setError(t.viewZikresource.errorLoadFailed);
      } finally {
        setIsLoading(false);
      }
    };
    loadResource();
  }, [id, t.viewZikresource.errorLoadFailed]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteZikresource(id);
      navigate({ to: '/home', search: { tab: 'zikresources' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.viewZikresource.errorDeleteFailed);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'tablature': return `🎼 ${t.dashboard.typeTablature}`;
      case 'video': return `🎬 ${t.dashboard.typeVideo}`;
      case 'backing-track': return `🎵 ${t.dashboard.typeBackingTrack}`;
      default: return `❓ ${t.dashboard.typeOther}`;
    }
  };

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{t.viewZikresource.loadingDetails}</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="manage-loading-container">
        <p style={{ color: '#ef4444' }}>{t.viewZikresource.notFound}</p>
        <button className="btn-back" onClick={() => navigate({ to: '/home' })} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>{t.common.backToHome}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="create-container">
      {/* Nav */}
      <nav className="create-nav">
        <button
          className="btn-back"
          onClick={() => navigate({ to: '/home' })}
        >
          <ArrowLeft size={16} />
          <span>{t.common.backToHome}</span>
        </button>
        <div className="create-logo">
          <div className="create-logo-icon">
            <Music size={20} />
          </div>
          <span className="create-logo-text">Zikstock</span>
        </div>
      </nav>

      {/* Page */}
      <main className="create-main">
        <div className="create-header">
          <h1 className="create-title">{resource.title}</h1>
          <p className="create-subtitle">
            {t.common.by} {resource.artist}
          </p>
        </div>

        {error && <div className="create-error-banner" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        <div className="primary-cta-container">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn-primary-cta">
            <span>{t.viewZikresource.goToLink}</span>
            <ExternalLink size={18} />
          </a>
        </div>

        <div className="manage-top-actions">
          <div className="action-buttons-left">
            <button
              type="button"
              className="btn-edit-resource"
              onClick={() => navigate({ to: `/zikresources/${id}/edit` as never })}
            >
              <Edit size={14} />
              <span>{t.viewZikresource.btnEdit}</span>
            </button>
          </div>

          {!showDeleteConfirm ? (
            <button
              type="button"
              className="btn-delete-resource"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} />
              <span>{t.viewZikresource.btnDelete}</span>
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

        <div className="detail-panel glass-panel">
          <div className="detail-item">
            <div className="detail-label">
              <Music size={16} />
              <span>{t.viewZikresource.typeLabel}</span>
            </div>
            <div className="detail-value">
              <span className={`type-badge type-${resource.type}`}>
                {getResourceLabel(resource.type)}
              </span>
            </div>
          </div>

          {resource.tags && resource.tags.length > 0 && (
            <div className="detail-item">
              <div className="detail-label">
                <Tag size={16} />
                <span>{t.viewZikresource.tagsLabel}</span>
              </div>
              <div className="detail-tags-list">
                {resource.tags.map((tag) => (
                  <span key={tag.value} className="view-tag-badge">
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
