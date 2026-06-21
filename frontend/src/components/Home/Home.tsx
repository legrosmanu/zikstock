import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  X
} from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { fetchZikresources, deleteZikresource } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { fetchSongs, deleteSong } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchPlaylists, deletePlaylist } from '../../infra/playlist.api';
import type { Playlist } from '../../infra/playlist.api';

// Sub-components
import { WelcomeBanner } from './WelcomeBanner';
import { ZikresourceList } from './ZikresourceList';
import { SongList } from './SongList';
import { PlaylistList } from './PlaylistList';
import { IntegrationStatusBar } from './IntegrationStatusBar';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'active' | 'error'>('checking');

  const search = useSearch({ from: '/home' });

  // Tab control
  const [activeTab, setActiveTab] = useState<'zikresources' | 'songs' | 'playlists'>(search.tab || 'zikresources');

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
      setErrorMsg('Failed to retrieve your practice workspace data.');
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteZikresource(id);
      setZikresources(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting zikresource:', err);
      alert('Failed to delete resource. It might be referenced by a song.');
      throw err;
    }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      await deleteSong(id);
      setSongs(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting song:', err);
      alert('Failed to delete song. It might be referenced by a playlist.');
      throw err;
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      await deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting playlist:', err);
      alert('Failed to delete playlist.');
      throw err;
    }
  };

  // Filter zikresources
  const filteredResources = zikresources.filter((resource) => {
    if (selectedType !== 'all') {
      if (selectedType === 'tabs' && resource.type !== 'tablature') return false;
      if (selectedType === 'videos' && resource.type !== 'video') return false;
      if (selectedType === 'backing-tracks' && resource.type !== 'backing-track') return false;
      if (selectedType === 'other' && resource.type !== 'other') return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = resource.title.toLowerCase().includes(q);
      const matchesArtist = resource.artist.toLowerCase().includes(q);
      const matchesTag = resource.tags?.some(
        (t) => t.label.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)
      );
      return matchesTitle || matchesArtist || matchesTag;
    }
    return true;
  });

  // Filter songs
  const filteredSongs = songs.filter((song) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter playlists
  const filteredPlaylists = playlists.filter((pl) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return pl.name.toLowerCase().includes(q) || (pl.description && pl.description.toLowerCase().includes(q));
    }
    return true;
  });

  const hasAddedItems = zikresources.length > 0 || songs.length > 0 || playlists.length > 0;
  const showWelcomeBanner = !isLoadingData && !errorMsg && !hasAddedItems;

  return (
    // Main Content Home
    <main className="dashboard-main animate-fade-in">

        {/* Workspace Intro Section */}
        {showWelcomeBanner && <WelcomeBanner />}

        {/* Dashboard Content & Zikresources List / Empty State */}
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
              <button className="btn-secondary animate-hover" onClick={fetchAllData}>Retry</button>
            </div>
          ) : (
            <div className="resources-section">
              <div className="resources-header">
                <div>
                  <h2 className="resources-title">
                    {activeTab === 'zikresources' && 'Your Zikresources'}
                    {activeTab === 'songs' && 'Your Compiled Songs'}
                    {activeTab === 'playlists' && 'Your Playlists'}
                  </h2>
                  <p className="resources-subtitle">
                    {activeTab === 'zikresources' && `Access your saved references (${zikresources.length})`}
                    {activeTab === 'songs' && `Grouped resources by song title (${songs.length})`}
                    {activeTab === 'playlists' && `Grouped zikresources and songs into playlists (${playlists.length})`}
                  </p>
                </div>

                {activeTab === 'zikresources' && (
                  <button className="btn-primary-large btn-add-zik" onClick={() => navigate({ to: '/zikresources/new' })}>
                    <Plus size={16} />
                    <span>Add Zikresource</span>
                  </button>
                )}
                {activeTab === 'songs' && (
                  <button className="btn-primary-large btn-add-zik" onClick={() => navigate({ to: '/songs/new' })}>
                    <Plus size={16} />
                    <span>Create Song</span>
                  </button>
                )}
                {activeTab === 'playlists' && (
                  <button className="btn-primary-large btn-add-zik" onClick={() => navigate({ to: '/playlists/new' })}>
                    <Plus size={16} />
                    <span>Create Playlist</span>
                  </button>
                )}
              </div>

              {/* Filters & Search */}
              <div className="filters-container glass-panel">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'zikresources'
                        ? "Search title, artist, or tags..."
                        : activeTab === 'playlists'
                          ? "Search by playlist name or description..."
                          : "Search by title or artist..."
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

                {activeTab === 'zikresources' && (
                  <div className="filter-chips">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'tabs', label: '🎼 Tabs' },
                      { id: 'videos', label: '🎬 Videos' },
                      { id: 'backing-tracks', label: '🎵 Tracks' },
                      { id: 'other', label: '❓ Other' }
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        className={`filter-chip ${selectedType === chip.id ? 'active' : ''}`}
                        onClick={() => setSelectedType(chip.id)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources Tab View */}
              {activeTab === 'zikresources' && (
                <ZikresourceList
                  resources={filteredResources}
                  onDelete={handleDeleteResource}
                />
              )}

              {/* Songs Tab View */}
              {activeTab === 'songs' && (
                <SongList
                  songs={filteredSongs}
                  onDelete={handleDeleteSong}
                />
              )}

              {/* Playlists Tab View */}
              {activeTab === 'playlists' && (
                <PlaylistList
                  playlists={filteredPlaylists}
                  onDelete={handleDeletePlaylist}
                />
              )}
            </div>
          )}

          {/* Secure Integration Live Check Status */}
          <IntegrationStatusBar connectionStatus={connectionStatus} />
        </section>
      </main>
  );
};
