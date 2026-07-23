import React, { useState } from 'react';
import { Plus, X, Link, User, FileText, Tag, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { authenticatedPost } from '../../infra/httpClient';
import { useTranslation } from '../../hooks/useTranslation';
import { extractMetadataFromUrl } from './urlMetadataExtractor';
import './CreateZikresource.css';

interface TagItem {
  label: string;
  value: string;
}

interface FormState {
  url: string;
  artist: string;
  title: string;
  type: string;
  tags: TagItem[];
}

const PRESET_TAGS = ['beginner', 'intermediate', 'advanced', 'jazz', 'rock', 'blues', 'classical', 'fingerstyle'];

export const CreateZikresource: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const RESOURCE_TYPES = [
    { value: 'tablature', label: `🎼 ${t.dashboard.typeTablature}` },
    { value: 'video', label: `🎬 ${t.dashboard.typeVideo}` },
    { value: 'backing-track', label: `🎵 ${t.dashboard.typeBackingTrack}` },
  ];

  const [form, setForm] = useState<FormState>({
    url: '',
    artist: '',
    title: '',
    type: '',
    tags: [],
  });

  const [autoFilled, setAutoFilled] = useState<{ artist: boolean; title: boolean; type: boolean }>({
    artist: false,
    title: false,
    type: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const applyUrlMetadata = (url: string) => {
    const metadata = extractMetadataFromUrl(url);

    const nextAutoFilled = { ...autoFilled };

    setForm((prevForm) => {
      const nextForm = { ...prevForm };

      (['artist', 'title', 'type'] as const).forEach((field) => {
        const metaValue = metadata[field];
        const isCurrentlyAutoFilled = autoFilled[field];
        const isCurrentlyEmpty = !prevForm[field]?.trim();

        if (metaValue) {
          if (isCurrentlyAutoFilled || isCurrentlyEmpty) {
            nextForm[field] = metaValue;
            nextAutoFilled[field] = true;
          }
        } else if (isCurrentlyAutoFilled) {
          nextForm[field] = '';
          nextAutoFilled[field] = false;
        }
      });

      return nextForm;
    });

    setAutoFilled(nextAutoFilled);
  };

  const handleChange = (field: keyof Omit<FormState, 'tags'>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setAutoFilled((prev) => ({ ...prev, [field]: false }));
    setError(null);

    if (field === 'url') {
      applyUrlMetadata(value);
    }
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
    if (!form.url.trim()) return t.createZikresource.errorUrlRequired;
    try { new URL(form.url); } catch { return t.createZikresource.errorUrlInvalid; }
    if (!form.artist.trim()) return t.createZikresource.errorArtistRequired;
    if (!form.title.trim()) return t.createZikresource.errorTitleRequired;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        url: form.url.trim(),
        artist: form.artist.trim(),
        title: form.title.trim(),
        type: form.type || 'other',
      };
      if (form.tags.length > 0) body.tags = form.tags;

      const endpoint = '/zikresources';
      await authenticatedPost(endpoint, body);

      setSuccess(true);
      setTimeout(() => navigate({ to: '/home', search: { tab: 'zikresources' } as never, replace: true }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorSomethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-container">
      {/* Page */}
      <main className="create-main">
        <div className="create-header">
          <h1 className="create-title">{t.createZikresource.title}</h1>
          <p className="create-subtitle">
            {t.createZikresource.subtitle}
          </p>
        </div>

        <form
          id="create-zikresource-form"
          className="create-form glass-panel"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="field-url">
              <Link size={15} />
              {t.createZikresource.fieldUrl} <span className="form-required">*</span>
            </label>
            <input
              id="field-url"
              type="url"
              className="form-input"
              placeholder="https://www.ultimate-guitar.com/…"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

           {/* Artist */}
          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="field-artist">
                <User size={15} />
                {t.createZikresource.fieldArtist} <span className="form-required">*</span>
              </label>
              {autoFilled.artist && (
                <span className="autofill-badge" title={t.createZikresource.autoFilledHint}>
                  <Sparkles size={12} />
                  <span>{t.createZikresource.autoFilledHint}</span>
                </span>
              )}
            </div>
            <input
              id="field-artist"
              type="text"
              className={`form-input ${autoFilled.artist ? 'autofilled-glow' : ''}`}
              placeholder="e.g. Pink Floyd"
              value={form.artist}
              onChange={(e) => handleChange('artist', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Title */}
          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="field-title">
                <FileText size={15} />
                {t.createZikresource.fieldTitle} <span className="form-required">*</span>
              </label>
              {autoFilled.title && (
                <span className="autofill-badge" title={t.createZikresource.autoFilledHint}>
                  <Sparkles size={12} />
                  <span>{t.createZikresource.autoFilledHint}</span>
                </span>
              )}
            </div>
            <input
              id="field-title"
              type="text"
              className={`form-input ${autoFilled.title ? 'autofilled-glow' : ''}`}
              placeholder="e.g. Wish You Were Here"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="field-type">
                <FileText size={15} />
                {t.createZikresource.fieldType}
              </label>
              {autoFilled.type && (
                <span className="autofill-badge" title={t.createZikresource.autoFilledHint}>
                  <Sparkles size={12} />
                  <span>{t.createZikresource.autoFilledHint}</span>
                </span>
              )}
            </div>
            <div className="type-grid">
              {RESOURCE_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  id={`type-${value}`}
                  className={`type-chip ${form.type === value ? 'selected' : ''} ${autoFilled.type && form.type === value ? 'autofilled-glow' : ''}`}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, type: prev.type === value ? '' : value }));
                    setAutoFilled((prev) => ({ ...prev, type: false }));
                  }}
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
              {t.createZikresource.fieldTags}
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
                placeholder={t.createZikresource.tagInputPlaceholder}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isSubmitting}
              />
              <button
                type="button"
                id="btn-add-tag"
                className="btn-add-tag"
                onClick={() => addTag(tagInput)}
                disabled={isSubmitting || !tagInput.trim()}
              >
                <Plus size={16} />
              </button>
            </div>

            {form.tags.length > 0 && (
              <div className="tags-list">
                {form.tags.map((tag) => (
                  <span key={tag.value} className="tag-pill">
                    {tag.label}
                    <button
                      type="button"
                      aria-label={`Remove tag ${tag.label}`}
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

          {/* Error */}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="form-success" role="status">
              {t.createZikresource.successSaving}
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              id="btn-cancel"
              className="btn-cancel"
              onClick={() => navigate({ to: '/home', search: { tab: 'zikresources' } as never, replace: true })}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              id="btn-submit-zikresource"
              className="btn-submit"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={17} className="spinning" />
                  <span>{t.common.saving}</span>
                </>
              ) : (
                <>
                  <Plus size={17} />
                  <span>{t.createZikresource.saveButton}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
