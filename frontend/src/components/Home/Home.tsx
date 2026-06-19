import React, { useEffect, useState } from 'react';
import { 
  Music, 
  LogOut, 
  BookOpen, 
  Video, 
  Plus, 
  Activity, 
  User,
  Sun,
  Moon,
  Search,
  Trash2,
  ExternalLink,
  FileText,
  X,
  Loader2,
  Folder,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { fetchZikresources, deleteZikresource } from '../../infra/zikresource.api';
import type { Zikresource } from '../../infra/zikresource.api';
import { fetchSongs, deleteSong } from '../../infra/song.api';
import type { Song } from '../../infra/song.api';
import { fetchPlaylists, deletePlaylist } from '../../infra/playlist.api';
import type { Playlist } from '../../infra/playlist.api';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const { theme, toggleTheme } = useTheme();

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'active' | 'error'>('checking');
  
  const search = useSearch({ from: '/home' as any });

  // Tab control
  const [activeTab, setActiveTab] = useState<'resources' | 'songs' | 'playlists'>(search.tab || 'resources');

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

  // Delete status state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchAllData = async () => {
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
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const handleDeleteResource = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteZikresource(id);
      setZikresources(prev => prev.filter(r => r._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting zikresource:', err);
      alert('Failed to delete resource. It might be referenced by a song.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDeleteSong = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteSong(id);
      setSongs(prev => prev.filter(s => s._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting song:', err);
      alert('Failed to delete song. It might be referenced by a playlist.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting playlist:', err);
      alert('Failed to delete playlist.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tablature': return <BookOpen size={18} />;
      case 'video': return <Video size={18} />;
      case 'backing-track': return <Music size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tablature': return 'Tab / Sheet';
      case 'video': return 'Video Tutorial';
      case 'backing-track': return 'Backing Track';
      default: return 'Other';
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
  return (
    <div className="dashboard-container">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <Music size={20} />
          </div>
          <span className="dashboard-logo-text">Zikstock</span>
        </div>

        <div className="dashboard-profile-section">
          {user && (
            <div className="user-profile-card">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User avatar'} 
                  className="user-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'rgba(255,255,255,0.1)' }}>
                  <User size={16} style={{ margin: 'auto' }} />
                </div>
              )}
              <div className="user-info">
                <span className="user-name">{user.name || 'Musician'}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
          )}
          <button
            className="btn-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="btn-signout" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Home */}
      <main className="dashboard-main animate-fade-in">
        
        {/* Workspace Intro Section */}
        <section className="welcome-banner glass-panel">
          <h1 className="welcome-title">
            Manage your repertoire
          </h1>
          <p className="welcome-subtitle">
            Welcome to your musical workspace. Use this space to organize your practice material at three levels of hierarchy:
          </p>
          
          <div className="concept-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-primary, #8b5cf6)' }}>
                <FileText size={18} />
                <h4 style={{ margin: 0, fontWeight: 700 }}>1. Zikresources</h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
                Save links to tabs, sheet music, video tutorials, or backing tracks.
              </p>
            </div>
            
            <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-secondary, #d946ef)' }}>
                <Music size={18} />
                <h4 style={{ margin: 0, fontWeight: 700 }}>2. Songs</h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
                Group your saved resources under unified song titles.
              </p>
            </div>
            
            <div className="concept-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981' }}>
                <Folder size={18} />
                <h4 style={{ margin: 0, fontWeight: 700 }}>3. Playlists</h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)' }}>
                Organize songs into custom playlists for gigs or focused practice sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Tab Selection */}
        <div className="dashboard-tabs-container">
          <button 
            className={`dashboard-tab ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => { setActiveTab('resources'); setSearchQuery(''); }}
          >
            <FileText size={16} />
            <span>Zikresources ({zikresources.length})</span>
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'songs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('songs'); setSearchQuery(''); }}
          >
            <Music size={16} />
            <span>Songs ({songs.length})</span>
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => { setActiveTab('playlists'); setSearchQuery(''); }}
          >
            <Folder size={16} />
            <span>Playlists ({playlists.length})</span>
          </button>
        </div>

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
                    {activeTab === 'resources' && 'Your Zikresources'}
                    {activeTab === 'songs' && 'Your Compiled Songs'}
                    {activeTab === 'playlists' && 'Your Playlists'}
                  </h2>
                  <p className="resources-subtitle">
                    {activeTab === 'resources' && `Access your saved references (${zikresources.length})`}
                    {activeTab === 'songs' && `Grouped resources by song title (${songs.length})`}
                    {activeTab === 'playlists' && `Grouped songs into playlists (${playlists.length})`}
                  </p>
                </div>
                
                {activeTab === 'resources' && (
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
                      activeTab === 'resources' 
                        ? "Search title, artist, or tags..." 
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

                {activeTab === 'resources' && (
                  <div className="filter-chips">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'tabs', label: '🎸 Tabs' },
                      { id: 'videos', label: '🎬 Videos' },
                      { id: 'backing-tracks', label: '🎵 Tracks' },
                      { id: 'other', label: '📎 Other' }
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
              {activeTab === 'resources' && (
                filteredResources.length === 0 ? (
                  <div className="no-results-panel glass-panel">
                    <p>No resources match your filters or search query.</p>
                  </div>
                ) : (
                  <div className="playlists-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredResources.map((resource) => {
                      const isDeleting = isDeletingId === resource._id;
                      const isConfirming = confirmDeleteId === resource._id;

                      return (
                        <div 
                          key={resource._id} 
                          className="playlist-row-card glass-panel" 
                          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
                          onClick={() => navigate({ to: `/zikresources/${resource._id}` as any })}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className={`card-icon-wrapper type-${resource.type}`} style={{ padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {getTypeIcon(resource.type)}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <h3 className="playlist-row-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{resource.title}</h3>
                                  <span className={`card-type-badge type-${resource.type}`} style={{ fontSize: '0.75rem' }}>
                                    {getTypeLabel(resource.type)}
                                  </span>
                                </div>
                                <p className="playlist-row-desc" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)' }}>
                                  {resource.artist || 'Unknown Artist'}
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-link"
                                onClick={(e) => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                              >
                                <span>Open Reference</span>
                                <ExternalLink size={13} />
                              </a>

                              <div className="playlist-actions" onClick={(e) => e.stopPropagation()}>
                                {isConfirming ? (
                                  <div className="confirm-delete-actions" style={{ position: 'static' }}>
                                    <button
                                      className="btn-confirm-delete"
                                      disabled={isDeleting}
                                      onClick={() => handleDeleteResource(resource._id)}
                                    >
                                      {isDeleting ? <Loader2 size={13} className="spinning" /> : 'Confirm'}
                                    </button>
                                    <button
                                      className="btn-cancel-delete"
                                      disabled={isDeleting}
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn-card-delete"
                                    onClick={() => setConfirmDeleteId(resource._id)}
                                    aria-label="Delete resource"
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #9ca3af)', cursor: 'pointer' }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>

                              <div style={{ color: 'var(--text-muted, #9ca3af)', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                                <ChevronRight size={20} />
                              </div>
                            </div>
                          </div>

                          {resource.tags && resource.tags.length > 0 && (
                            <div className="card-tags" style={{ paddingLeft: '3.25rem', margin: 0, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {resource.tags.map((tag, idx) => (
                                <span key={idx} className="card-tag" style={{ margin: 0 }}>
                                  {tag.label}: {tag.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Songs Tab View */}
              {activeTab === 'songs' && (
                filteredSongs.length === 0 ? (
                  <div className="no-results-panel glass-panel">
                    <p>No songs found. Create a Song to group Zikresources together.</p>
                  </div>
                ) : (
                  <div className="playlists-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredSongs.map((song) => {
                      const isDeleting = isDeletingId === song._id;
                      const isConfirming = confirmDeleteId === song._id;

                      return (
                        <div 
                          key={song._id} 
                          className="playlist-row-card glass-panel" 
                          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
                          onClick={() => navigate({ to: `/songs/${song._id}` as any })}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="playlist-icon-wrapper" style={{ background: '#8b5cf6', color: '#fff', padding: '0.5rem', borderRadius: '8px' }}>
                                <Music size={20} />
                              </div>
                              <div>
                                <h3 className="playlist-row-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{song.title}</h3>
                                <p className="playlist-row-desc" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)' }}>
                                  {song.artist || 'Unknown Artist'} • {song.zikresourceIds.length} Resources
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div className="playlist-actions" onClick={(e) => e.stopPropagation()}>
                                {isConfirming ? (
                                  <div className="confirm-delete-actions" style={{ position: 'static' }}>
                                    <button
                                      className="btn-confirm-delete"
                                      disabled={isDeleting}
                                      onClick={() => handleDeleteSong(song._id)}
                                    >
                                      {isDeleting ? <Loader2 size={13} className="spinning" /> : 'Confirm'}
                                    </button>
                                    <button
                                      className="btn-cancel-delete"
                                      disabled={isDeleting}
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn-card-delete"
                                    onClick={() => setConfirmDeleteId(song._id)}
                                    aria-label="Delete song"
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #9ca3af)', cursor: 'pointer' }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>

                              <div style={{ color: 'var(--text-muted, #9ca3af)', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                                <ChevronRight size={20} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Playlists Tab View */}
              {activeTab === 'playlists' && (
                filteredPlaylists.length === 0 ? (
                  <div className="no-results-panel glass-panel">
                    <p>No playlists found. Create a Playlist to organize your repertoire.</p>
                  </div>
                ) : (
                  <div className="playlists-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredPlaylists.map((playlist) => {
                      const isDeleting = isDeletingId === playlist._id;
                      const isConfirming = confirmDeleteId === playlist._id;

                      return (
                        <div 
                          key={playlist._id} 
                          className="playlist-row-card glass-panel" 
                          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
                          onClick={() => navigate({ to: `/playlists/${playlist._id}` as any })}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="playlist-icon-wrapper" style={{ background: '#8b5cf6', color: '#fff', padding: '0.5rem', borderRadius: '8px' }}>
                                <Folder size={20} />
                              </div>
                              <div>
                                <h3 className="playlist-row-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{playlist.name}</h3>
                                <p className="playlist-row-desc" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #9ca3af)' }}>
                                  {playlist.description || 'No description'} • {playlist.songIds.length} Songs
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div className="playlist-actions" onClick={(e) => e.stopPropagation()}>
                                {isConfirming ? (
                                  <div className="confirm-delete-actions" style={{ position: 'static' }}>
                                    <button
                                      className="btn-confirm-delete"
                                      disabled={isDeleting}
                                      onClick={() => handleDeletePlaylist(playlist._id)}
                                    >
                                      {isDeleting ? <Loader2 size={13} className="spinning" /> : 'Confirm'}
                                    </button>
                                    <button
                                      className="btn-cancel-delete"
                                      disabled={isDeleting}
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn-card-delete"
                                    onClick={() => setConfirmDeleteId(playlist._id)}
                                    aria-label="Delete playlist"
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #9ca3af)', cursor: 'pointer' }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>

                              <div style={{ color: 'var(--text-muted, #9ca3af)', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                                <ChevronRight size={20} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}

          {/* Secure Integration Live Check Status */}
          <div className="integration-status-bar glass-panel">
            <span className="integration-label">
              <Activity size={16} />
              Secure API Gateway Local Synchronization
            </span>
            <div className="status-indicator">
              {connectionStatus === 'checking' && (
                <>
                  <span className="status-dot checking"></span>
                  <span style={{ color: '#f59e0b' }}>CHECKING GATEWAY...</span>
                </>
              )}
              {connectionStatus === 'active' && (
                <>
                  <span className="status-dot active"></span>
                  <span style={{ color: '#10b981' }}>CONNECTED & VALIDATED</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <span className="status-dot error"></span>
                  <span style={{ color: '#ef4444' }}>OFFLINE / VERIFICATION ERROR</span>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};
