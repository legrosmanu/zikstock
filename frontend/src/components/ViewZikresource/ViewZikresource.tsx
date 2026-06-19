import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Link, User, FileText, Tag, Loader2, Trash2, ExternalLink, Edit } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchZikresourceById, deleteZikresource } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import '../CreateZikresource/CreateZikresource.css';
import './ViewZikresource.css';

export const ViewZikresource: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/zikresources/$id' as any }) as { id: string };

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
        setError('Failed to load resource or unauthorized.');
      } finally {
        setIsLoading(false);
      }
    };
    loadResource();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteZikresource(id);
      navigate({ to: '/home', search: { tab: 'zikresources' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'tablature': return '🎸 Tab / Sheet Music';
      case 'video': return '🎬 Video Tutorial';
      case 'backing-track': return '🎵 Backing Track';
      default: return '📎 Other';
    }
  };

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading resource details...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="manage-loading-container">
        <p style={{ color: '#ef4444' }}>Resource not found.</p>
        <button className="btn-back" onClick={() => navigate({ to: '/home' as any })} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="create-container">
      {/* Nav */}
      <nav className="create-nav">
        <div className="create-logo">
          <div className="create-logo-icon">
            <Music size={20} />
          </div>
          <span className="create-logo-text">Zikstock</span>
        </div>
        <button
          className="btn-back"
          onClick={() => navigate({ to: '/home' as any })}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </nav>

      {/* Page */}
      <main className="create-main">
        <div className="create-header">
          <h1 className="create-title">{resource.title}</h1>
          <p className="create-subtitle">
            by {resource.artist}
          </p>
        </div>

        {error && <div className="create-error-banner" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        <div className="manage-top-actions">
          <div className="action-buttons-left">
            <button
              type="button"
              className="btn-edit-resource"
              onClick={() => navigate({ to: `/zikresources/${id}/edit` as any })}
            >
              <Edit size={14} />
              <span>Edit Details</span>
            </button>
          </div>

          {!showDeleteConfirm ? (
            <button
              type="button"
              className="btn-delete-resource"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} />
              <span>Delete Resource</span>
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

        <div className="detail-panel glass-panel">
          <div className="detail-item">
            <div className="detail-label">
              <User size={16} />
              <span>Artist</span>
            </div>
            <div className="detail-value">{resource.artist}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <FileText size={16} />
              <span>Title</span>
            </div>
            <div className="detail-value">{resource.title}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <Music size={16} />
              <span>Resource Type</span>
            </div>
            <div className="detail-value">
              <span className={`type-badge type-${resource.type}`}>
                {getResourceLabel(resource.type)}
              </span>
            </div>
          </div>

          <div className="detail-item url-highlight-card">
            <div className="detail-label">
              <Link size={16} />
              <span>Resource Link</span>
            </div>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="url-card-anchor">
              <span className="url-card-url">{resource.url}</span>
              <span className="url-card-action">
                <span>Go to Zikresource</span>
                <ExternalLink size={14} />
              </span>
            </a>
          </div>

          {resource.tags && resource.tags.length > 0 && (
            <div className="detail-item">
              <div className="detail-label">
                <Tag size={16} />
                <span>Tags</span>
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
