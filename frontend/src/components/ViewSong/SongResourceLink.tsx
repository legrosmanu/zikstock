import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  Music,
  Mic,
  HelpCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Loader2,
  Play,
  ChevronUp,
} from 'lucide-react';
import type { Zikresource } from '../../infra/zikresource.api';
import { useTranslation } from '../../hooks/useTranslation';
import { getDomainName, getEmbedUrl, isMediaEmbeddable } from './resourceUtils';

interface SongResourceLinkProps {
  resource: Zikresource;
  songTitle?: string;
  isOwner?: boolean;
  onEdit?: (resource: Zikresource) => void;
  onDelete?: (resourceId: string) => Promise<void>;
}

export const SongResourceLink: React.FC<SongResourceLinkProps> = ({
  resource,
  songTitle,
  isOwner = false,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const domain = getDomainName(resource.url);
  const embedUrl = getEmbedUrl(resource.url);
  const canEmbed = isMediaEmbeddable(resource.url);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'tablature':
        return <BookOpen size={18} />;
      case 'video':
        return <Video size={18} />;
      case 'backing-track':
        return <Music size={18} />;
      case 'lyrics':
        return <Mic size={18} />;
      default:
        return <HelpCircle size={18} />;
    }
  };

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'tablature':
        return t.viewSong.typePartitions;
      case 'video':
        return t.viewSong.typeVideo;
      case 'backing-track':
        return t.viewSong.typeBackingTrack;
      case 'lyrics':
        return t.viewSong.typeLyrics;
      default:
        return t.viewSong.typeOther;
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(resource._id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t.viewSong.deleteResourceError);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Check if resource title has unique extra info compared to song title
  const hasDistinctTitle =
    Boolean(resource.title) &&
    Boolean(songTitle) &&
    resource.title.trim().toLowerCase() !== songTitle?.trim().toLowerCase();

  return (
    <div className={`song-resource-item type-${resource.type}`}>
      <div className="song-resource-main-row">
        {/* Type Icon Badge */}
        <div className={`resource-icon-badge badge-${resource.type}`}>
          {getResourceIcon(resource.type)}
        </div>

        {/* Info / Title / Domain / Tags */}
        <div className="resource-info-col">
          <div className="resource-primary-line">
            <span className="resource-type-name">
              {getResourceLabel(resource.type)}
            </span>
            {hasDistinctTitle && (
              <span className="resource-distinct-title">
                — {resource.title}
              </span>
            )}
            <span className="resource-domain-tag">
              {domain}
            </span>
          </div>

          {resource.tags && resource.tags.length > 0 && (
            <div className="resource-tags-row">
              {resource.tags.map((tag, idx) => (
                <span key={idx} className="resource-tag-chip">
                  {tag.label}: {tag.value}
                </span>
              ))}
            </div>
          )}

          {deleteError && (
            <div className="resource-item-error">
              {deleteError}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="resource-actions-col">
          {/* Media Preview Toggle */}
          {canEmbed && (
            <button
              type="button"
              className={`btn-resource-preview ${showPreview ? 'active' : ''}`}
              onClick={() => setShowPreview((prev) => !prev)}
              title={showPreview ? t.viewSong.btnHidePreview : t.viewSong.btnPreviewMedia}
              aria-expanded={showPreview}
            >
              {showPreview ? <ChevronUp size={14} /> : <Play size={14} />}
              <span>{showPreview ? t.viewSong.btnHidePreview : t.viewSong.btnPreviewMedia}</span>
            </button>
          )}

          {/* Direct Link */}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-resource-open"
            title={t.viewSong.btnOpenLink}
          >
            <span>{t.viewSong.btnOpenResource}</span>
            <ExternalLink size={14} />
          </a>

          {/* Owner Actions */}
          {isOwner && (
            <div className="resource-owner-actions">
              {!showDeleteConfirm ? (
                <>
                  {onEdit && (
                    <button
                      type="button"
                      className="btn-resource-icon-action"
                      onClick={() => onEdit(resource)}
                      title={t.viewSong.btnEditResource}
                      aria-label={t.viewSong.btnEditResource}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="btn-resource-icon-action danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      title={t.viewSong.btnDeleteResource}
                      aria-label={t.viewSong.btnDeleteResource}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </>
              ) : (
                <div className="resource-inline-delete-confirm">
                  <span className="confirm-prompt">{t.viewSong.confirmDeleteResource}</span>
                  <button
                    type="button"
                    className="btn-inline-delete-yes"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 size={12} className="spinning" /> : t.viewSong.btnDeleteResource}
                  </button>
                  <button
                    type="button"
                    className="btn-inline-delete-cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    {t.common.cancel}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Media Preview Player */}
      {showPreview && embedUrl && (
        <div className="resource-embed-wrapper animate-fade-in">
          <iframe
            src={embedUrl}
            title={resource.title || getResourceLabel(resource.type)}
            className="resource-embed-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
