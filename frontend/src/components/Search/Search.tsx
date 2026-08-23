import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search as SearchIcon,
  X,
  Music,
  Folder,
  FileText,
  Loader2,
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
import { getNetwork } from '../../infra/network.api';
import { useTranslation } from '../../hooks/useTranslation';
import { ZikresourceCard } from '../Cards/ZikresourceCard';
import { SongCard } from '../Cards/SongCard';
import { PlaylistCard } from '../Cards/PlaylistCard';
import './Search.css';
import '../Cards/Card.css';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { t } = useTranslation();

  const searchParams = useSearch({ from: '/search' }) as { tab?: 'zikresources' | 'songs' | 'playlists' };
  
  // Tab Control
  const [activeTab, setActiveTab] = useState<'zikresources' | 'songs' | 'playlists'>(searchParams.tab || 'zikresources');

  // Display mode & sorting
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'artist'>('newest');

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

  const filterOptions = [
    { id: 'all', label: t.dashboard.filterAll },
    { id: 'tabs', label: t.dashboard.filterTabs },
    { id: 'videos', label: t.dashboard.filterVideos },
    { id: 'backing-tracks', label: t.dashboard.filterTracks },
    { id: 'lyrics', label: t.dashboard.filterLyrics },
    { id: 'other', label: t.dashboard.filterOther }
  ];

  const activeResourceOption = filterOptions.find((opt) => opt.id === selectedResourceType);
  const isResourceFiltered = activeTab === 'zikresources' && selectedResourceType !== 'all';
  const hasActiveFilter = isResourceFiltered || onlyNetwork;

  const getFilterButtonLabel = () => {
    if (isResourceFiltered && onlyNetwork) {
      return `${activeResourceOption?.label} • 👥`;
    }
    if (isResourceFiltered && activeResourceOption) {
      return activeResourceOption.label;
    }
    if (onlyNetwork) {
      return `👥 ${t.sidebar.network}`;
    }
    return t.common.filtersTitle;
  };

  const handleClearFilters = () => {
    setOnlyNetwork(false);
    setSelectedResourceType('all');
  };

  const loadAllData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);

      const [resourcesData, songsData, playlistsData, networkData] = await Promise.all([
        fetchZikresources({ scope: 'all' }),
        fetchSongs({ scope: 'all' }),
        fetchPlaylists({ scope: 'all' }),
        getNetwork()
      ]);

      setZikresources(resourcesData);
      setSongs(songsData);
      setPlaylists(playlistsData);

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

  // Filter & Sort Zikresources
  const filteredResources = zikresources
    .filter((resource) => {
      if (isSelf(resource.createdBy)) return false;

      if (selectedResourceType !== 'all') {
        if (selectedResourceType === 'tabs' && resource.type !== 'tablature') return false;
        if (selectedResourceType === 'videos' && resource.type !== 'video') return false;
        if (selectedResourceType === 'backing-tracks' && resource.type !== 'backing-track') return false;
        if (selectedResourceType === 'lyrics' && resource.type !== 'lyrics') return false;
        if (selectedResourceType === 'other' && resource.type !== 'other') return false;
      }

      if (onlyNetwork && !isNetworkMember(resource.createdBy)) return false;

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
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      return b._id.localeCompare(a._id);
    });

  // Filter & Sort Songs
  const filteredSongs = songs
    .filter((song) => {
      if (isSelf(song.createdBy)) return false;
      if (onlyNetwork && !isNetworkMember(song.createdBy)) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = song.title.toLowerCase().includes(q);
        const matchesArtist = song.artist.toLowerCase().includes(q);
        const matchesCreator = song.creatorName?.toLowerCase().includes(q);
        return matchesTitle || matchesArtist || matchesCreator;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      return b._id.localeCompare(a._id);
    });

  // Filter & Sort Playlists
  const filteredPlaylists = playlists
    .filter((pl) => {
      if (isSelf(pl.createdBy)) return false;
      if (onlyNetwork && !isNetworkMember(pl.createdBy)) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = pl.name.toLowerCase().includes(q);
        const matchesDesc = pl.description && pl.description.toLowerCase().includes(q);
        const matchesCreator = pl.creatorName?.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesCreator;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.name.localeCompare(b.name);
      return b._id.localeCompare(a._id);
    });

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
        <div className="search-main-layout">
          {/* Category Tabs Header */}
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

          {/* Filters & Search Toolbar (compact & unified) */}
          <div className="filters-container glass-panel" style={{ marginTop: '1.25rem' }}>
            <div className="search-box">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                placeholder={t.search.searchPlaceholder}
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

            {/* Filter Dropdown */}
            <div className="filter-dropdown-container" ref={filterDropdownRef}>
              <button
                type="button"
                className={`filter-dropdown-btn ${hasActiveFilter ? 'has-active-filter' : ''}`}
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                aria-expanded={isFilterDropdownOpen}
                aria-haspopup="true"
              >
                <Filter size={15} className="filter-btn-icon" />
                <span className="filter-btn-label">{getFilterButtonLabel()}</span>
                <ChevronDown size={14} className={`filter-btn-chevron ${isFilterDropdownOpen ? 'open' : ''}`} />
              </button>

              {hasActiveFilter && (
                <button
                  type="button"
                  className="filter-reset-quick-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilters();
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
                    {hasActiveFilter && (
                      <button
                        type="button"
                        className="filter-dropdown-clear"
                        onClick={() => {
                          handleClearFilters();
                          setIsFilterDropdownOpen(false);
                        }}
                      >
                        {t.common.clearFilters}
                      </button>
                    )}
                  </div>

                  {activeTab === 'zikresources' && (
                    <>
                      <div className="filter-dropdown-section-title">
                        {t.createZikresource.fieldType}
                      </div>
                      <div className="filter-dropdown-list">
                        {filterOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`filter-dropdown-item ${selectedResourceType === opt.id ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedResourceType(opt.id);
                              setIsFilterDropdownOpen(false);
                            }}
                            role="menuitem"
                          >
                            <span className="filter-item-label">{opt.label}</span>
                            {selectedResourceType === opt.id && <Check size={14} className="filter-item-check" />}
                          </button>
                        ))}
                      </div>
                      <hr className="filter-dropdown-divider" />
                    </>
                  )}

                  <div className="filter-dropdown-section-title">
                    {t.sidebar.network}
                  </div>
                  <div className="filter-dropdown-list">
                    <label className="filter-dropdown-checkbox-item">
                      <input
                        type="checkbox"
                        checked={onlyNetwork}
                        onChange={(e) => setOnlyNetwork(e.target.checked)}
                        className="network-filter-checkbox"
                      />
                      <span className="checkbox-text-label">{t.search.showOnlyNetwork}</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reverb Toolbar Bar (View Switcher & Sorting) */}
          <div className="reverb-toolbar-row" style={{ marginTop: '1.25rem' }}>
            <div className="reverb-toolbar-left">
              <span className="reverb-result-count">
                {activeTab === 'zikresources' && `${filteredResources.length} ${filteredResources.length === 1 ? t.common.resourcesCountSingular : t.common.resourcesCountPlural}`}
                {activeTab === 'songs' && `${filteredSongs.length} ${filteredSongs.length === 1 ? t.common.songsCountSingular : t.common.songsCountPlural}`}
                {activeTab === 'playlists' && `${filteredPlaylists.length} ${filteredPlaylists.length === 1 ? 'Playlist' : 'Playlists'}`}
              </span>
            </div>

            <div className="reverb-toolbar-right">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'title' | 'artist')}
                className="reverb-sort-select"
              >
                <option value="newest">{t.common.sortNewest}</option>
                <option value="title">{t.common.sortTitleAsc}</option>
                {activeTab !== 'playlists' && <option value="artist">{t.common.sortArtistAsc}</option>}
              </select>

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

          {/* Results Grid / List Area */}
          <div className="search-results-area" style={{ marginTop: '1.25rem' }}>
            {/* 1. Zikresources */}
            {activeTab === 'zikresources' && (
              filteredResources.length === 0 ? (
                <div className="search-no-results glass-panel">
                  <p>{t.search.noItemsFound}</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'reverb-cards-grid' : 'reverb-cards-list'}>
                  {filteredResources.map((resource) => (
                    <ZikresourceCard
                      key={resource._id}
                      resource={resource}
                      viewMode={viewMode}
                      isNetworkMember={isNetworkMember(resource.createdBy)}
                      isSelf={isSelf(resource.createdBy)}
                      onClick={() => navigate({ to: '/zikresources/$id', params: { id: resource._id } })}
                    />
                  ))}
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
                <div className={viewMode === 'grid' ? 'reverb-cards-grid' : 'reverb-cards-list'}>
                  {filteredSongs.map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      viewMode={viewMode}
                      isNetworkMember={isNetworkMember(song.createdBy)}
                      isSelf={isSelf(song.createdBy)}
                      onClick={() => navigate({ to: '/songs/$id', params: { id: song._id } })}
                    />
                  ))}
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
                <div className={viewMode === 'grid' ? 'reverb-cards-grid' : 'reverb-cards-list'}>
                  {filteredPlaylists.map((playlist) => (
                    <PlaylistCard
                      key={playlist._id}
                      playlist={playlist}
                      viewMode={viewMode}
                      isNetworkMember={isNetworkMember(playlist.createdBy)}
                      isSelf={isSelf(playlist.createdBy)}
                      onClick={() => navigate({ to: '/playlists/$id', params: { id: playlist._id } })}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
