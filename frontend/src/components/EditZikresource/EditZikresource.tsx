import React, { useState, useEffect } from 'react';
import { Music, ArrowLeft, X, Link, User, FileText, Tag, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { fetchZikresourceById, updateZikresource, deleteZikresource } from '../../infra/zikresource.api';
import type { ZikresourceTag } from '../../infra/zikresource.api';
import '../CreateZikresource/CreateZikresource.css';
import '../ViewZikresource/ViewZikresource.css';

const RESOURCE_TYPES = [
  { value: 'tablature', label: '🎸 Tab / Sheet Music' },
  { value: 'video', label: '🎬 Video Tutorial' },
  { value: 'backing-track', label: '🎵 Backing Track' },
  { value: 'other', label: '📎 Other' },
];

const PRESET_TAGS = ['beginner', 'intermediate', 'advanced', 'jazz', 'rock', 'blues', 'classical', 'fingerstyle'];

export const EditZikresource: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/zikresources/$id/edit' as any }) as { id: string };

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<{
    url: string;
    artist: string;
    title: string;
    type: string;
    tags: ZikresourceTag[];
  }>({
    url: '',
    artist: '',
    title: '',
    type: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const loadResource = async () => {
      try {
        const data = await fetchZikresourceById(id);
        setForm({
          url: data.url,
          artist: data.artist,
          title: data.title,
          type: data.type,
          tags: data.tags || [],
        });
      } catch (err) {
        console.error('Failed to load resource', err);
        setError('Failed to load resource or unauthorized.');
      } finally {
        setIsLoading(false);
      }
    };
    loadResource();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addTag = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const value = trimmed.toLowerCase().replace(/\s+/g, '-');
    if (form.tags.some((t) => t.value === value)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, { label: trimmed, value }] }));
    setTagInput('');
  };

  const removeTag = (value: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t.value !== value) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const validate = (): string | null => {
    if (!form.url.trim()) return 'A URL is required.';
    try { new URL(form.url); } catch { return 'Please enter a valid URL.'; }
    if (!form.artist.trim()) return 'Artist name is required.';
    if (!form.title.trim()) return 'Title is required.';
    if (!form.type) return 'A resource type is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateZikresource(id, {
        url: form.url.trim(),
        artist: form.artist.trim(),
        title: form.title.trim(),
        type: form.type as any,
        tags: form.tags.length > 0 ? form.tags : undefined,
      });

      setSuccess(true);
      setTimeout(() => navigate({ to: `/zikresources/${id}` as any }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="manage-loading-container">
        <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading resource details...</p>
      </div>
    );
  }

  return (
    <div className="create-container">
      {/* Nav */}
      <nav className="create-nav">
        <button
          className="btn-back"
          onClick={() => navigate({ to: `/zikresources/${id}` as any })}
        >
          <ArrowLeft size={16} />
          <span>Back to View</span>
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
          <h1 className="create-title">Edit Zikresource</h1>
          <p className="create-subtitle">
            Update this reference's properties.
          </p>
        </div>

        {error && <div className="create-error-banner" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div className="create-success-banner" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Zikresource updated successfully! Redirecting...</div>}

        <div className="manage-top-actions">
          <a
            href={form.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-open-reference"
          >
            <span>Open Reference Link</span>
            <ExternalLink size={14} />
          </a>

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

        <form
          className="create-form glass-panel"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="field-url">
              <Link size={15} />
              Resource URL <span className="form-required">*</span>
            </label>
            <input
              id="field-url"
              type="url"
              className="form-input"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Artist */}
          <div className="form-group">
            <label className="form-label" htmlFor="field-artist">
              <User size={15} />
              Artist <span className="form-required">*</span>
            </label>
            <input
              id="field-artist"
              type="text"
              className="form-input"
              value={form.artist}
              onChange={(e) => handleChange('artist', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="field-title">
              <FileText size={15} />
              Title <span className="form-required">*</span>
            </label>
            <input
              id="field-title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="field-type">
              <FileText size={15} />
              Resource Type <span className="form-required">*</span>
            </label>
            <div className="type-grid">
              {RESOURCE_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`type-chip ${form.type === value ? 'selected' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, type: prev.type === value ? '' : value }))}
                  disabled={isSubmitting}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label" htmlFor="field-tag-input">
              <Tag size={15} />
              Tags
            </label>
            <div className="tags-presets">
              {PRESET_TAGS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-tag ${form.tags.some((t) => t.value === preset) ? 'selected' : ''}`}
                  onClick={() =>
                    form.tags.some((t) => t.value === preset)
                      ? removeTag(preset)
                      : addTag(preset)
                  }
                  disabled={isSubmitting}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="tag-input-row">
              <input
                id="field-tag-input"
                type="text"
                className="form-input tag-input"
                placeholder="Custom tag — press Enter or comma to add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn-add-tag"
                onClick={() => addTag(tagInput)}
                disabled={isSubmitting}
              >
                Add
              </button>
            </div>

            {form.tags.length > 0 && (
              <div className="tags-list">
                {form.tags.map((tag) => (
                  <span key={tag.value} className="form-tag-badge">
                    <span>{tag.label}</span>
                    <button
                      type="button"
                      className="btn-remove-tag"
                      onClick={() => removeTag(tag.value)}
                      disabled={isSubmitting}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn-submit"
              style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              onClick={() => navigate({ to: `/zikresources/${id}` as any })}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
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
