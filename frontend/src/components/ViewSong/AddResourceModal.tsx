import React, { useState, useEffect, useRef } from 'react';
import { X, Link, Music, FileText, Video, Mic, HelpCircle, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { extractMetadataFromUrl } from '../CreateZikresource/urlMetadataExtractor';
import { addZikresourceToSong } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import type { Zikresource } from '../../infra/zikresource.api';
import './AddResourceModal.css';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: {
    id: string;
    title: string;
    artist: string;
  };
  onResourceAdded: (result: { song: Song; zikresource: Zikresource }) => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  isOpen,
  onClose,
  song,
  onResourceAdded,
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [type, setType] = useState<string>('other');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setType('other');
      setIsAutoDetected(false);
      setError(null);
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError(t.addResourceModal.errorUrlRequired);
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError(t.addResourceModal.errorUrlInvalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addZikresourceToSong(song.id, {
        url: trimmedUrl,
        type: type || 'other',
      });
      onResourceAdded(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorSomethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourceTypes = [
    { value: 'tablature', label: t.dashboard.typeTablature, icon: <FileText size={16} /> },
    { value: 'video', label: t.dashboard.typeVideo, icon: <Video size={16} /> },
    { value: 'backing-track', label: t.dashboard.typeBackingTrack, icon: <Music size={16} /> },
    { value: 'lyrics', label: t.dashboard.typeLyrics, icon: <Mic size={16} /> },
    { value: 'other', label: t.dashboard.typeOther, icon: <HelpCircle size={16} /> },
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
      aria-labelledby="modal-add-resource-title"
    >
      <div className="add-resource-modal">
        <div className="mobile-handle-bar" />

        <div className="add-resource-header">
          <div>
            <h2 id="modal-add-resource-title" className="add-resource-title">
              {t.addResourceModal.title}
            </h2>
            <p className="add-resource-subtitle">
              {t.addResourceModal.subtitle}
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
          {/* Context Reminder: Title & Artist from Song */}
          <div className="song-context-card">
            <div className="song-context-info">
              <Music size={18} className="song-context-icon" />
              <div className="song-context-text">
                <span className="song-context-title">{song.title}</span>
                <span className="song-context-artist">{song.artist}</span>
              </div>
            </div>
            <span className="song-context-badge" title={t.addResourceModal.inheritedHint}>
              {t.addResourceModal.inheritedHint}
            </span>
          </div>

          {/* URL Field */}
          <div className="form-field-group">
            <div className="field-label-row">
              <label htmlFor="resource-url-input" className="field-label">
                <Link size={14} />
                <span>{t.addResourceModal.fieldUrl}</span>
              </label>
              {isAutoDetected && (
                <span className="autodetect-badge">
                  <Sparkles size={11} />
                  <span>{t.addResourceModal.autoDetectedType}</span>
                </span>
              )}
            </div>
            <input
              ref={urlInputRef}
              id="resource-url-input"
              type="url"
              className="form-text-input"
              placeholder={t.addResourceModal.urlPlaceholder}
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Type Selection */}
          <div className="form-field-group">
            <label className="field-label">
              <FileText size={14} />
              <span>{t.addResourceModal.fieldType}</span>
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
              {t.addResourceModal.btnCancel}
            </button>
            <button
              type="submit"
              className="btn-submit-modal"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.addResourceModal.submitting}</span>
                </>
              ) : (
                <span>{t.addResourceModal.btnSubmit}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
