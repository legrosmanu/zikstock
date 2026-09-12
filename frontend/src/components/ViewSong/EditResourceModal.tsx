import React, { useState, useEffect, useRef } from 'react';
import { X, Link, FileText, Video, Music, Mic, HelpCircle, Sparkles, Loader2, Tag as TagIcon, Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { extractMetadataFromUrl } from './urlMetadataExtractor';
import { updateZikresource } from '../../infra/zikresource.api';
import type { Zikresource, ZikresourceTag, ZikresourceType } from '../../infra/zikresource.api';
import './AddResourceModal.css';

interface EditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Zikresource;
  onResourceUpdated: (updated: Zikresource) => void;
}

export const EditResourceModal: React.FC<EditResourceModalProps> = ({
  isOpen,
  onClose,
  resource,
  onResourceUpdated,
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState(resource.url);
  const [type, setType] = useState<string>(resource.type);
  const [tags, setTags] = useState<ZikresourceTag[]>(resource.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(resource.url);
      setType(resource.type);
      setTags(resource.tags || []);
      setTagInput('');
      setIsAutoDetected(false);
      setError(null);
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, resource]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);

    const meta = extractMetadataFromUrl(value);
    if (meta.type) {
      setType(meta.type);
      setIsAutoDetected(true);
    } else if (isAutoDetected) {
      setIsAutoDetected(false);
    }
  };

  const handleTypeSelect = (selectedType: string) => {
    setType(selectedType);
    setIsAutoDetected(false);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const value = trimmed.toLowerCase().replace(/\s+/g, '-');
    if (!tags.some((t) => t.value === value)) {
      setTags((prev) => [...prev, { label: trimmed, value }]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagValue: string) => {
    setTags((prev) => prev.filter((t) => t.value !== tagValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError(t.editResourceModal.errorUrlRequired);
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError(t.editResourceModal.errorUrlInvalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateZikresource(resource._id, {
        url: trimmedUrl,
        type: (type as ZikresourceType) || 'other',
        tags,
        title: resource.title,
        artist: resource.artist,
      });
      onResourceUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorSomethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourceTypes = [
    { value: 'tablature', label: t.viewSong.typePartitions, icon: <FileText size={16} /> },
    { value: 'video', label: t.viewSong.typeVideo, icon: <Video size={16} /> },
    { value: 'backing-track', label: t.viewSong.typeBackingTrack, icon: <Music size={16} /> },
    { value: 'lyrics', label: t.viewSong.typeLyrics, icon: <Mic size={16} /> },
    { value: 'other', label: t.viewSong.typeOther, icon: <HelpCircle size={16} /> },
  ];

  return (
    <div
      className="add-resource-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-resource-title"
    >
      <div className="add-resource-modal">
        <div className="mobile-handle-bar" />

        <div className="add-resource-header">
          <div>
            <h2 id="modal-edit-resource-title" className="add-resource-title">
              {t.editResourceModal.title}
            </h2>
            <p className="add-resource-subtitle">
              {t.editResourceModal.subtitle}
            </p>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-resource-form" noValidate>
          {/* URL Field */}
          <div className="form-field-group">
            <div className="field-label-row">
              <label htmlFor="edit-resource-url-input" className="field-label">
                <Link size={14} />
                <span>{t.editResourceModal.fieldUrl}</span>
              </label>
              {isAutoDetected && (
                <span className="autodetect-badge">
                  <Sparkles size={11} />
                  <span>{t.editResourceModal.autoDetectedType}</span>
                </span>
              )}
            </div>
            <input
              ref={urlInputRef}
              id="edit-resource-url-input"
              type="url"
              className="form-text-input"
              placeholder={t.editResourceModal.urlPlaceholder}
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Type Selection */}
          <div className="form-field-group">
            <label className="field-label">
              <FileText size={14} />
              <span>{t.editResourceModal.fieldType}</span>
            </label>
            <div className="resource-type-chips">
              {resourceTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`type-select-chip ${type === item.value ? 'active' : ''}`}
                  onClick={() => handleTypeSelect(item.value)}
                  disabled={isSubmitting}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Field */}
          <div className="form-field-group">
            <label className="field-label">
              <TagIcon size={14} />
              <span>{t.editResourceModal.fieldTags}</span>
            </label>
            <div className="tags-input-container">
              <input
                type="text"
                className="form-text-input"
                placeholder={t.editResourceModal.tagsPlaceholder}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="btn-add-tag-inline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || isSubmitting}
              >
                <Plus size={14} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="modal-tags-list">
                {tags.map((tag) => (
                  <span key={tag.value} className="modal-tag-chip">
                    <span>{tag.label}</span>
                    <button
                      type="button"
                      className="btn-remove-tag"
                      onClick={() => handleRemoveTag(tag.value)}
                      disabled={isSubmitting}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="modal-error-banner" role="alert">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="add-resource-actions">
            <button
              type="button"
              className="btn-cancel-modal"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t.editResourceModal.btnCancel}
            </button>
            <button
              type="submit"
              className="btn-submit-modal"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.editResourceModal.submitting}</span>
                </>
              ) : (
                <span>{t.editResourceModal.btnSubmit}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
