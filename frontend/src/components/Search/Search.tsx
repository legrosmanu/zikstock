import React, { useEffect, useState, useCallback } from 'react';
import {
  Search as SearchIcon,
  X,
  Music,
  Folder,
  FileText,
  BookOpen,
  Video,
  Mic,
  HelpCircle,
  Users,
  ChevronRight,
  User,
  Loader2
} from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { fetchSongs } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchPlaylists } from '../../infra/playlist.api';
import type { Playlist } from '../../infra/playlist.api';
import { getNetwork } from '../../infra/network.api';
import { useTranslation } from '../../hooks/useTranslation';
import './Search.css';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { t } = useTranslation();

  const searchParams = useSearch({ from: '/search' }) as { tab?: 'zikresources' | 'songs' | 'playlists' };
  
  // Tab Control
  const [activeTab, setActiveTab] = useState<'zikresources' | 'songs' | 'playlists'>(searchParams.tab || 'zikresources');

  // Sync tab from search parameter
  useEffect(() => {
    if (searchParams.tab) {
      setActiveTab(searchParams.tab);
    }
  }, [searchParams.tab]);

  // Lists States
  const [zikresources, setZikresources] = useState<Zikresource[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [networkUserIds, setNetworkUserIds] = useState<Set<string>>(new Set());

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyNetwork, setOnlyNetwork] = useState<boolean>(false);
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');

  const loadAllData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);

      // Concurrent fetching: Zikresources (all), Songs (all), Playlists (all), Network (connections)
      const [resourcesData, songsData, playlistsData, networkData] = await Promise.all([
        fetchZikresources({ scope: 'all' }),
        fetchSongs({ scope: 'all' }),
        fetchPlaylists({ scope: 'all' }),
        getNetwork()
      ]);

      setZikresources(resourcesData);
      setSongs(songsData);
      setPlaylists(playlistsData);

      // Store accepted network connection user IDs for highlighting
      const acceptedIds = new Set<string>();
      if (networkData && networkData.accepted) {
        networkData.accepted.forEach((conn) => {
          acceptedIds.add(conn.user.id);
        });
      }
      setNetworkUserIds(acceptedIds);
    } catch (err) {
      console.error('Error fetching global discovery data:', err);
      setErrorMsg(t.common.errorSomethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  }, [token, t.common.errorSomethingWentWrong]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Helpers to check relationship
  const isSelf = (creatorId: string) => currentUser?.sub === creatorId;
  const isNetworkMember = (creatorId: string) => networkUserIds.has(creatorId);

  // Filter lists based on Search Query & Network Toggle
  const filteredResources = zikresources.filter((resource) => {
    // Exclude own items
    if (isSelf(resource.createdBy)) return false;

    // Type Filter
    if (selectedResourceType !== 'all') {
      if (selectedResourceType === 'tabs' && resource.type !== 'tablature') return false;
      if (selectedResourceType === 'videos' && resource.type !== 'video') return false;
      if (selectedResourceType === 'backing-tracks' && resource.type !== 'backing-track') return false;
      if (selectedResourceType === 'lyrics' && resource.type !== 'lyrics') return false;
      if (selectedResourceType === 'other' && resource.type !== 'other') return false;
    }

    // Network Toggle
    if (onlyNetwork && !isNetworkMember(resource.createdBy)) return false;

    // Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = resource.title.toLowerCase().includes(q);
      const matchesArtist = resource.artist.toLowerCase().includes(q);
      const matchesCreator = resource.creatorName?.toLowerCase().includes(q);
      const matchesTag = resource.tags?.some(
        (tag) => tag.label.toLowerCase().includes(q) || tag.value.toLowerCase().includes(q)
      );
      return matchesTitle || matchesArtist || matchesCreator || matchesTag;
    }

    return true;
  });

  const filteredSongs = songs.filter((song) => {
    // Exclude own items
    if (isSelf(song.createdBy)) return false;

    // Network Toggle
    if (onlyNetwork && !isNetworkMember(song.createdBy)) return false;

    // Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = song.title.toLowerCase().includes(q);
      const matchesArtist = song.artist.toLowerCase().includes(q);
      const matchesCreator = song.creatorName?.toLowerCase().includes(q);
      return matchesTitle || matchesArtist || matchesCreator;
    }
    return true;
  });

  const filteredPlaylists = playlists.filter((pl) => {
    // Exclude own items
    if (isSelf(pl.createdBy)) return false;

    // Network Toggle
    if (onlyNetwork && !isNetworkMember(pl.createdBy)) return false;

    // Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesName = pl.name.toLowerCase().includes(q);
      const matchesDesc = pl.description && pl.description.toLowerCase().includes(q);
      const matchesCreator = pl.creatorName?.toLowerCase().includes(q);
      return matchesName || matchesDesc || matchesCreator;
    }
    return true;
  });

  // Card icons
  const getZikIcon = (type: string) => {
    switch (type) {
      case 'tablature': return <BookOpen size={18} />;
      case 'video': return <Video size={18} />;
      case 'backing-track': return <Music size={18} />;
      case 'lyrics': return <Mic size={18} />;
      default: return <HelpCircle size={18} />;
    }
  };

  const getZikLabel = (type: string) => {
    switch (type) {
      case 'tablature': return t.dashboard.typeTablature;
      case 'video': return t.dashboard.typeVideo;
      case 'backing-track': return t.dashboard.typeBackingTrack;
      case 'lyrics': return t.dashboard.typeLyrics;
      default: return t.dashboard.typeOther;
    }
  };

  const handleTabChange = (tab: 'zikresources' | 'songs' | 'playlists') => {
    setActiveTab(tab);
    navigate({ to: '/search', search: { tab } });
  };

  return (
    <div className="search-page-container animate-fade-in">
      {/* Header */}
      <div className="search-header-section">
        <h1 className="search-page-title">{t.search.title}</h1>
        <p className="search-page-subtitle">{t.search.subtitle}</p>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="search-loading-wrapper">
          <Loader2 size={36} className="spinning" style={{ color: 'var(--accent-primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{t.common.loading}</p>
        </div>
      ) : errorMsg ? (
        <div className="search-error-wrapper glass-panel">
          <p>{errorMsg}</p>
          <button className="btn-secondary" onClick={loadAllData}>{t.common.retry}</button>
        </div>
      ) : (
        <div className="search-content-grid">
          {/* Controls Bar: Search Input, Filters, Network Toggle */}
          <div className="search-controls-bar glass-panel">
            <div className="search-input-wrapper">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                placeholder={t.search.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="search-clear-btn" aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="search-options-group">
              {/* Network Filter Checkbox */}
              <label className="network-filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={onlyNetwork}
                  onChange={(e) => setOnlyNetwork(e.target.checked)}
                  className="network-filter-checkbox"
                />
                <span className="checkbox-text-label">{t.search.showOnlyNetwork}</span>
              </label>

              {/* Resource Type Filter for Zikresources */}
              {activeTab === 'zikresources' && (
                <div className="search-filter-chips">
                  {[
                    { id: 'all', label: t.dashboard.filterAll },
                    { id: 'tabs', label: t.dashboard.filterTabs },
                    { id: 'videos', label: t.dashboard.filterVideos },
                    { id: 'backing-tracks', label: t.dashboard.filterTracks },
                    { id: 'lyrics', label: t.dashboard.filterLyrics },
                    { id: 'other', label: t.dashboard.filterOther }
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      className={`search-filter-chip ${selectedResourceType === chip.id ? 'active' : ''}`}
                      onClick={() => setSelectedResourceType(chip.id)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="search-tabs-container">
            <button
              className={`search-tab-button ${activeTab === 'zikresources' ? 'active' : ''}`}
              onClick={() => handleTabChange('zikresources')}
            >
              <FileText size={16} />
              <span>{t.sidebar.zikresources} ({filteredResources.length})</span>
            </button>
            <button
              className={`search-tab-button ${activeTab === 'songs' ? 'active' : ''}`}
              onClick={() => handleTabChange('songs')}
            >
              <Music size={16} />
              <span>{t.sidebar.songs} ({filteredSongs.length})</span>
            </button>
            <button
              className={`search-tab-button ${activeTab === 'playlists' ? 'active' : ''}`}
              onClick={() => handleTabChange('playlists')}
            >
              <Folder size={16} />
              <span>{t.sidebar.playlists} ({filteredPlaylists.length})</span>
            </button>
          </div>

          {/* Results Lists */}
          <div className="search-results-list">
            
            {/* 1. Zikresources */}
            {activeTab === 'zikresources' && (
              filteredResources.length === 0 ? (
                <div className="search-no-results glass-panel">
                  <p>{t.search.noItemsFound}</p>
                </div>
              ) : (
                <div className="search-cards-stack">
                  {filteredResources.map((resource) => {
                    const creatorIsFriend = isNetworkMember(resource.createdBy);
                    const creatorIsSelf = isSelf(resource.createdBy);
                    
                    return (
                      <div
                        key={resource._id}
                        className={`search-row-card glass-panel ${creatorIsFriend ? 'network-highlight' : ''}`}
                        onClick={() => navigate({ to: '/zikresources/$id', params: { id: resource._id } })}
                      >
                        <div className="card-top-content">
                          <div className="card-left-info">
                            <div className={`search-card-icon type-${resource.type}`}>
                              {getZikIcon(resource.type)}
                            </div>
                            <div>
                              <div className="title-row">
                                <h3 className="resource-title">{resource.title}</h3>
                                <span className={`card-badge-type type-${resource.type}`}>
                                  {getZikLabel(resource.type)}
                                </span>
                              </div>
                              <p className="resource-artist">{resource.artist || t.common.unknownArtist}</p>
                            </div>
                          </div>
                          
                          <div className="card-right-actions">
                            <ChevronRight size={18} className="chevron-icon" />
                          </div>
                        </div>

                        {/* Tags */}
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="card-tags-row">
                            {resource.tags.map((tag, idx) => (
                              <span key={idx} className="search-tag-pill">
                                {tag.label}: {tag.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Creator Footer / Credit */}
                        <div className="card-creator-footer">
                          <div className="creator-profile">
                            {resource.creatorPicture ? (
                              <img src={resource.creatorPicture} alt={resource.creatorName} className="creator-avatar" />
                            ) : (
                              <div className="creator-avatar-fallback">
                                <User size={12} />
                              </div>
                            )}
                            <span className="creator-name">
                              {t.search.addedBy} {creatorIsSelf ? 'You' : (resource.creatorName || t.common.profileFallbackName)}
                            </span>
                          </div>

                          {creatorIsFriend && (
                            <span className="network-friend-badge">
                              <Users size={12} />
                              <span>{t.search.networkMemberBadge}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* 2. Songs */}
            {activeTab === 'songs' && (
              filteredSongs.length === 0 ? (
                <div className="search-no-results glass-panel">
                  <p>{t.search.noItemsFound}</p>
                </div>
              ) : (
                <div className="search-cards-stack">
                  {filteredSongs.map((song) => {
                    const creatorIsFriend = isNetworkMember(song.createdBy);
                    const creatorIsSelf = isSelf(song.createdBy);

                    return (
                      <div
                        key={song._id}
                        className={`search-row-card glass-panel ${creatorIsFriend ? 'network-highlight' : ''}`}
                        onClick={() => navigate({ to: '/songs/$id', params: { id: song._id } })}
                      >
                        <div className="card-top-content">
                          <div className="card-left-info">
                            <div className="search-card-icon song-icon">
                              <Music size={18} />
                            </div>
                            <div>
                              <h3 className="resource-title">{song.title}</h3>
                              <p className="resource-artist">
                                {song.artist || t.common.unknownArtist} • {song.zikresourceIds?.length || 0} {song.zikresourceIds?.length === 1 ? t.common.resourcesCountSingular : t.common.resourcesCountPlural}
                              </p>
                            </div>
                          </div>
                          
                          <div className="card-right-actions">
                            <ChevronRight size={18} className="chevron-icon" />
                          </div>
                        </div>

                        {/* Creator Footer / Credit */}
                        <div className="card-creator-footer">
                          <div className="creator-profile">
                            {song.creatorPicture ? (
                              <img src={song.creatorPicture} alt={song.creatorName} className="creator-avatar" />
                            ) : (
                              <div className="creator-avatar-fallback">
                                <User size={12} />
                              </div>
                            )}
                            <span className="creator-name">
                              {t.search.addedBy} {creatorIsSelf ? 'You' : (song.creatorName || t.common.profileFallbackName)}
                            </span>
                          </div>

                          {creatorIsFriend && (
                            <span className="network-friend-badge">
                              <Users size={12} />
                              <span>{t.search.networkMemberBadge}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* 3. Playlists */}
            {activeTab === 'playlists' && (
              filteredPlaylists.length === 0 ? (
                <div className="search-no-results glass-panel">
                  <p>{t.search.noItemsFound}</p>
                </div>
              ) : (
                <div className="search-cards-stack">
                  {filteredPlaylists.map((playlist) => {
                    const creatorIsFriend = isNetworkMember(playlist.createdBy);
                    const creatorIsSelf = isSelf(playlist.createdBy);

                    return (
                      <div
                        key={playlist._id}
                        className={`search-row-card glass-panel ${creatorIsFriend ? 'network-highlight' : ''}`}
                        onClick={() => navigate({ to: '/playlists/$id', params: { id: playlist._id } })}
                      >
                        <div className="card-top-content">
                          <div className="card-left-info">
                            <div className="search-card-icon playlist-icon">
                              <Folder size={18} />
                            </div>
                            <div>
                              <h3 className="resource-title">{playlist.name}</h3>
                              <p className="resource-artist">
                                {playlist.description || t.common.noDescription} • {playlist.songIds?.length || 0} {playlist.songIds?.length === 1 ? t.common.songsCountSingular : t.common.songsCountPlural}
                              </p>
                            </div>
                          </div>
                          
                          <div className="card-right-actions">
                            <ChevronRight size={18} className="chevron-icon" />
                          </div>
                        </div>

                        {/* Creator Footer / Credit */}
                        <div className="card-creator-footer">
                          <div className="creator-profile">
                            {playlist.creatorPicture ? (
                              <img src={playlist.creatorPicture} alt={playlist.creatorName} className="creator-avatar" />
                            ) : (
                              <div className="creator-avatar-fallback">
                                <User size={12} />
                              </div>
                            )}
                            <span className="creator-name">
                              {t.search.addedBy} {creatorIsSelf ? 'You' : (playlist.creatorName || t.common.profileFallbackName)}
                            </span>
                          </div>

                          {creatorIsFriend && (
                            <span className="network-friend-badge">
                              <Users size={12} />
                              <span>{t.search.networkMemberBadge}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

          </div>
        </div>
      )}
    </div>
  );
};
