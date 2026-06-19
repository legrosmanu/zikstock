import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, Search, FileText, Video, Check, Loader2, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { fetchSongById, updateSong, deleteSong } from '../../infra/song.api';
import '../CreateSong/CreateSong.css';
import './ManageSong.css';

export const ManageSong: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/songs/$id' as any }) as { id: string };

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [selectedZikresourceIds, setSelectedZikresourceIds] = useState<string[]>([]);
  const [zikresources, setZikresources] = useState<Zikresource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [songData, resourcesData] = await Promise.all([
          fetchSongById(id),
          fetchZikresources(),
        ]);
        setTitle(songData.title);
        setArtist(songData.artist);
        setSelectedZikresourceIds(songData.zikresourceIds || []);
        setZikresources(resourcesData);
      } catch (err) {
        console.error('Failed to load song data', err);
        setError('Failed to load song details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const toggleResource = (resourceId: string) => {
    setSelectedZikresourceIds((prev) =>
      prev.includes(resourceId) ? prev.filter((item) => item !== resourceId) : [...prev, resourceId]
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
      await updateSong(id, {
        title: title.trim(),
        artist: artist.trim(),
        zikresourceIds: selectedZikresourceIds,
      });
      setSuccess(true);
      setTimeout(() => navigate({ to: '/home', search: { tab: 'songs' } }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update song.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSong(id);
      navigate({ to: '/home', search: { tab: 'songs' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete song.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading song details...</p>
      </div>
    );
  }

  return (
    <div className="create-page-container">
      {/* Nav */}
      <nav className="create-page-nav">
        <div className="create-page-logo">
          <div className="create-page-logo-icon">
            <Music size={20} />
          </div>
          <span className="create-page-logo-text">Zikstock</span>
        </div>
        <button
          className="btn-back-dashboard"
          onClick={() => navigate({ to: '/home' as any })}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </nav>

      {/* Page Content */}
      <main className="create-page-main animate-fade-in">
        <div className="create-page-header">
          <h1 className="create-page-title">Manage Song</h1>
          <p className="create-page-subtitle">
            Update song details and resource associations.
          </p>
        </div>

        {error && <div className="create-page-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Song updated successfully! Redirecting...</div>}

        <div className="manage-top-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          {!showDeleteConfirm ? (
            <button
              type="button"
              className="btn-delete-resource"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} />
              <span>Delete Song</span>
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

            {filteredResources.length === 0 ? (
              <div className="no-resources-msg">No Zikresources found matching query.</div>
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
              onClick={() => navigate({ to: '/home' as any })}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary-action" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>Saving changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
