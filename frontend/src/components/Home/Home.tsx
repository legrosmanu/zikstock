import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  X,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { fetchSongs } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchPlaylists } from '../../infra/playlist.api';
import type { Playlist } from '../../infra/playlist.api';
import { useTranslation } from '../../hooks/useTranslation';

// Sub-components
import { WelcomeBanner } from './WelcomeBanner';
import { SongList } from './SongList';
import { PlaylistList } from './PlaylistList';
import { SortDropdown } from '../Cards/SortDropdown';
import './Home.css';
import '../Cards/Card.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { t } = useTranslation();

  const search = useSearch({ from: '/home' }) as { tab?: 'songs' | 'playlists' };

  // Tab control
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>(
    search.tab === 'playlists' ? 'playlists' : 'songs'
  );

  // Display mode & sorting
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'artist'>('newest');

  // Sync tab from search parameter
  useEffect(() => {
    if (search.tab === 'playlists' || search.tab === 'songs') {
      setActiveTab(search.tab);
    }
  }, [search.tab]);

  // Lists states
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAllData = useCallback(async () => {
    if (!token) {
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      setErrorMsg(null);

      const [songsData, playlistsData] = await Promise.all([
        fetchSongs(),
        fetchPlaylists()
      ]);

      setSongs(songsData);
      setPlaylists(playlistsData);
    } catch (err) {
      console.error('Error fetching data from backend API:', err);
      setErrorMsg(t.dashboard.errorFetchData);
    } finally {
      setIsLoadingData(false);
    }
  }, [token, t.dashboard.errorFetchData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  const hasAddedItems = songs.length > 0 || playlists.length > 0;
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
                  {activeTab === 'songs' && t.dashboard.titleSongs}
                  {activeTab === 'playlists' && t.dashboard.titlePlaylists}
                </h2>
                <p className="resources-subtitle">
                  {activeTab === 'songs' && `${t.dashboard.subtitleSongs} (${filteredSongs.length})`}
                  {activeTab === 'playlists' && `${t.dashboard.subtitlePlaylists} (${filteredPlaylists.length})`}
                </p>
              </div>

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

            {/* Search Input */}
            <div className="filters-container glass-panel">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'playlists'
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
            </div>

            {/* Reverb Toolbar Bar (View Switcher & Sorting) */}
            <div className="reverb-toolbar-row">
              <div className="reverb-toolbar-left">
                <span className="reverb-result-count">
                  {activeTab === 'songs' && `${filteredSongs.length} ${filteredSongs.length === 1 ? t.common.songsCountSingular : t.common.songsCountPlural}`}
                  {activeTab === 'playlists' && `${filteredPlaylists.length} ${filteredPlaylists.length === 1 ? 'Playlist' : 'Playlists'}`}
                </span>
              </div>

              <div className="reverb-toolbar-right">
                {/* Sort dropdown */}
                <SortDropdown<'newest' | 'title' | 'artist'>
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { id: 'newest', label: t.common.sortNewest },
                    { id: 'title', label: t.common.sortTitleAsc },
                    ...(activeTab !== 'playlists' ? [{ id: 'artist' as const, label: t.common.sortArtistAsc }] : [])
                  ]}
                  ariaLabel={t.common.sortBy}
                />

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
      </section>
    </main>
  );
};
