import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { fetchZikresources } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { fetchSongs } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchPlaylists } from '../../infra/playlist.api';
import type { Playlist } from '../../infra/playlist.api';
import { useTranslation } from '../../hooks/useTranslation';

// Sub-components
import { WelcomeBanner } from './WelcomeBanner';
import { ZikresourceList } from './ZikresourceList';
import { SongList } from './SongList';
import { PlaylistList } from './PlaylistList';
import { IntegrationStatusBar } from './IntegrationStatusBar';
import './Home.css';
import '../Cards/Card.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { t } = useTranslation();

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'active' | 'error'>('checking');

  const search = useSearch({ from: '/home' });

  // Tab control
  const [activeTab, setActiveTab] = useState<'zikresources' | 'songs' | 'playlists'>(search.tab || 'zikresources');

  // Display mode & sorting
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'artist'>('newest');

  // Sync tab from search parameter
  useEffect(() => {
    if (search.tab) {
      setActiveTab(search.tab);
    }
  }, [search.tab]);

  // Lists states
  const [zikresources, setZikresources] = useState<Zikresource[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterDropdownOpen]);

  const fetchAllData = useCallback(async () => {
    if (!token) {
      setConnectionStatus('error');
      setIsLoadingData(false);
      return;
    }

    try {
      setConnectionStatus('checking');
      setIsLoadingData(true);
      setErrorMsg(null);

      const [resourcesData, songsData, playlistsData] = await Promise.all([
        fetchZikresources(),
        fetchSongs(),
        fetchPlaylists()
      ]);

      setZikresources(resourcesData);
      setSongs(songsData);
      setPlaylists(playlistsData);
      setConnectionStatus('active');
    } catch (err) {
      console.error('Error fetching data from backend API:', err);
      setConnectionStatus('error');
      setErrorMsg(t.dashboard.errorFetchData);
    } finally {
      setIsLoadingData(false);
    }
  }, [token, t.dashboard.errorFetchData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filter & Sort zikresources
  const filteredResources = zikresources
    .filter((resource) => {
      if (selectedType !== 'all') {
        if (selectedType === 'tabs' && resource.type !== 'tablature') return false;
        if (selectedType === 'videos' && resource.type !== 'video') return false;
        if (selectedType === 'backing-tracks' && resource.type !== 'backing-track') return false;
        if (selectedType === 'lyrics' && resource.type !== 'lyrics') return false;
        if (selectedType === 'other' && resource.type !== 'other') return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = resource.title.toLowerCase().includes(q);
        const matchesArtist = resource.artist.toLowerCase().includes(q);
        const matchesTag = resource.tags?.some(
          (tag) => tag.label.toLowerCase().includes(q) || tag.value.toLowerCase().includes(q)
        );
        return matchesTitle || matchesArtist || matchesTag;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      return b._id.localeCompare(a._id);
    });

  // Filter & Sort songs
  const filteredSongs = songs
    .filter((song) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      return b._id.localeCompare(a._id);
    });

  // Filter & Sort playlists
  const filteredPlaylists = playlists
    .filter((pl) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return pl.name.toLowerCase().includes(q) || (pl.description && pl.description.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.name.localeCompare(b.name);
      return b._id.localeCompare(a._id);
    });

  const hasAddedItems = zikresources.length > 0 || songs.length > 0 || playlists.length > 0;
  const showWelcomeBanner = !isLoadingData && !errorMsg && !hasAddedItems;

  return (
    <main className="dashboard-main animate-fade-in">
      {/* Workspace Intro Section */}
      {showWelcomeBanner && <WelcomeBanner />}

      {/* Dashboard Content */}
      <section className="dashboard-content-area">
        {isLoadingData ? (
          <div className="resources-loading-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="resource-card-skeleton glass-panel">
                <div className="skeleton-icon-title">
                  <div className="skeleton-circle shimmer" />
                  <div className="skeleton-text-group">
                    <div className="skeleton-line title shimmer" />
                    <div className="skeleton-line subtitle shimmer" />
                  </div>
                </div>
                <div className="skeleton-line url shimmer" />
                <div className="skeleton-tags">
                  <div className="skeleton-pill shimmer" />
                  <div className="skeleton-pill shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="error-state-panel glass-panel">
            <p className="error-message">{errorMsg}</p>
            <button className="btn-secondary animate-hover" onClick={fetchAllData}>{t.common.retry}</button>
          </div>
        ) : (
          <div className="resources-section">
            <div className="resources-header">
              <div>
                <h2 className="resources-title">
                  {activeTab === 'zikresources' && t.dashboard.titleZikresources}
                  {activeTab === 'songs' && t.dashboard.titleSongs}
                  {activeTab === 'playlists' && t.dashboard.titlePlaylists}
                </h2>
                <p className="resources-subtitle">
                  {activeTab === 'zikresources' && `${t.dashboard.subtitleZikresources} (${filteredResources.length})`}
                  {activeTab === 'songs' && `${t.dashboard.subtitleSongs} (${filteredSongs.length})`}
                  {activeTab === 'playlists' && `${t.dashboard.subtitlePlaylists} (${filteredPlaylists.length})`}
                </p>
              </div>

              {activeTab === 'zikresources' && (
                <button className="btn-primary-large btn-add-zik" onClick={() => navigate({ to: '/zikresources/new' })}>
                  <Plus size={16} />
                  <span className="btn-label-full">{t.dashboard.addZikresource}</span>
                  <span className="btn-label-short">{t.dashboard.addZikresourceShort}</span>
                </button>
              )}
              {activeTab === 'songs' && (
                <button className="btn-primary-large btn-add-zik" onClick={() => navigate({ to: '/songs/new' })}>
                  <Plus size={16} />
                  <span className="btn-label-full">{t.dashboard.createSong}</span>
                  <span className="btn-label-short">{t.dashboard.createSongShort}</span>
                </button>
              )}
              {activeTab === 'playlists' && (
                <button className="btn-primary-large btn-add-zik" onClick={() => navigate({ to: '/playlists/new' })}>
                  <Plus size={16} />
                  <span className="btn-label-full">{t.dashboard.createPlaylist}</span>
                  <span className="btn-label-short">{t.dashboard.createPlaylistShort}</span>
                </button>
              )}
            </div>

            {/* Filters & Toolbar Controls */}
            <div className="filters-container glass-panel">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'zikresources'
                      ? t.dashboard.searchResourcesPlaceholder
                      : activeTab === 'playlists'
                        ? t.dashboard.searchPlaylistsPlaceholder
                        : t.dashboard.searchSongsPlaceholder
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear-btn" aria-label="Clear search">
                    <X size={14} />
                  </button>
                )}
              </div>

              {activeTab === 'zikresources' && (() => {
                const filterOptions = [
                  { id: 'all', label: t.dashboard.filterAll },
                  { id: 'tabs', label: t.dashboard.filterTabs },
                  { id: 'videos', label: t.dashboard.filterVideos },
                  { id: 'backing-tracks', label: t.dashboard.filterTracks },
                  { id: 'lyrics', label: t.dashboard.filterLyrics },
                  { id: 'other', label: t.dashboard.filterOther }
                ];
                const activeOption = filterOptions.find((opt) => opt.id === selectedType);

                return (
                  <div className="filter-dropdown-container" ref={filterDropdownRef}>
                    <button
                      type="button"
                      className={`filter-dropdown-btn ${selectedType !== 'all' ? 'has-active-filter' : ''}`}
                      onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                      aria-expanded={isFilterDropdownOpen}
                      aria-haspopup="true"
                    >
                      <Filter size={15} className="filter-btn-icon" />
                      <span className="filter-btn-label">
                        {selectedType !== 'all' && activeOption
                          ? activeOption.label
                          : t.common.filtersTitle}
                      </span>
                      <ChevronDown size={14} className={`filter-btn-chevron ${isFilterDropdownOpen ? 'open' : ''}`} />
                    </button>

                    {selectedType !== 'all' && (
                      <button
                        type="button"
                        className="filter-reset-quick-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedType('all');
                        }}
                        title={t.common.clearFilters}
                        aria-label={t.common.clearFilters}
                      >
                        <X size={13} />
                      </button>
                    )}

                    {isFilterDropdownOpen && (
                      <div className="filter-dropdown-menu glass-panel" role="menu">
                        <div className="filter-dropdown-header">
                          <span className="filter-dropdown-title">{t.common.filtersTitle}</span>
                          {selectedType !== 'all' && (
                            <button
                              type="button"
                              className="filter-dropdown-clear"
                              onClick={() => {
                                setSelectedType('all');
                                setIsFilterDropdownOpen(false);
                              }}
                            >
                              {t.common.clearFilters}
                            </button>
                          )}
                        </div>
                        <div className="filter-dropdown-list">
                          {filterOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              className={`filter-dropdown-item ${selectedType === opt.id ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedType(opt.id);
                                setIsFilterDropdownOpen(false);
                              }}
                              role="menuitem"
                            >
                              <span className="filter-item-label">{opt.label}</span>
                              {selectedType === opt.id && <Check size={14} className="filter-item-check" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Reverb Toolbar Bar (View Switcher & Sorting) */}
            <div className="reverb-toolbar-row">
              <div className="reverb-toolbar-left">
                <span className="reverb-result-count">
                  {activeTab === 'zikresources' && `${filteredResources.length} ${filteredResources.length === 1 ? t.common.resourcesCountSingular : t.common.resourcesCountPlural}`}
                  {activeTab === 'songs' && `${filteredSongs.length} ${filteredSongs.length === 1 ? t.common.songsCountSingular : t.common.songsCountPlural}`}
                  {activeTab === 'playlists' && `${filteredPlaylists.length} ${filteredPlaylists.length === 1 ? 'Playlist' : 'Playlists'}`}
                </span>
              </div>

              <div className="reverb-toolbar-right">
                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'title' | 'artist')}
                  className="reverb-sort-select"
                >
                  <option value="newest">{t.common.sortNewest}</option>
                  <option value="title">{t.common.sortTitleAsc}</option>
                  {activeTab !== 'playlists' && <option value="artist">{t.common.sortArtistAsc}</option>}
                </select>

                {/* View Mode Toggle */}
                <div className="reverb-view-toggle">
                  <button
                    className={`reverb-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title={t.common.viewModeGrid}
                  >
                    <LayoutGrid size={16} />
                    <span>{t.common.viewModeGrid}</span>
                  </button>
                  <button
                    className={`reverb-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title={t.common.viewModeList}
                  >
                    <ListIcon size={16} />
                    <span>{t.common.viewModeList}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resources Tab View */}
            {activeTab === 'zikresources' && (
              <ZikresourceList resources={filteredResources} viewMode={viewMode} />
            )}

            {/* Songs Tab View */}
            {activeTab === 'songs' && (
              <SongList songs={filteredSongs} viewMode={viewMode} />
            )}

            {/* Playlists Tab View */}
            {activeTab === 'playlists' && (
              <PlaylistList playlists={filteredPlaylists} viewMode={viewMode} />
            )}
          </div>
        )}

        {/* Integration Status */}
        <IntegrationStatusBar connectionStatus={connectionStatus} />
      </section>
    </main>
  );
};
