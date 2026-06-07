import React, { useEffect, useState } from 'react';
import { 
  Music, 
  LogOut, 
  BookOpen, 
  Video, 
  FolderHeart, 
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
  Loader2
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { fetchZikresourceStats, fetchZikresources, deleteZikresource } from '../../infra/zikresource.api';
import type { ZikresourceStats, Zikresource } from '../../infra/zikresource.api';
import './Dashboard.css';


export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login', replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'active' | 'error'>('checking');
  const [greeting, setGreeting] = useState<string>('Welcome back');
  const [stats, setStats] = useState<ZikresourceStats | null>(null);
  
  // Zikresources state
  const [zikresources, setZikresources] = useState<Zikresource[]>([]);
  const [isLoadingZikresources, setIsLoadingZikresources] = useState<boolean>(true);
  const [errorZikresources, setErrorZikresources] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Delete status state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Compute greeting based on local time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning, time to practice!');
    } else if (hour < 18) {
      setGreeting('Good afternoon, time to practice!');
    } else {
      setGreeting('Good evening, ready for a jam session?');
    }
  }, []);

  const fetchAllData = async () => {
    if (!token) {
      setConnectionStatus('error');
      setIsLoadingZikresources(false);
      return;
    }

    try {
      setConnectionStatus('checking');
      setIsLoadingZikresources(true);
      setErrorZikresources(null);

      const [statsData, resourcesData] = await Promise.all([
        fetchZikresourceStats(),
        fetchZikresources()
      ]);

      setStats(statsData);
      setZikresources(resourcesData);
      setConnectionStatus('active');
    } catch (err) {
      console.error('Error connecting to backend API or fetching stats:', err);
      setConnectionStatus('error');
      setErrorZikresources('Failed to retrieve your practice resources.');
    } finally {
      setIsLoadingZikresources(false);
    }
  };

  // Live integration check: Call stats API to verify auth token and fetch real data
  useEffect(() => {
    fetchAllData();
  }, [token]);

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteZikresource(id);
      setZikresources(prev => prev.filter(r => r._id !== id));
      
      // Refresh stats dynamically
      const statsData = await fetchZikresourceStats();
      setStats(statsData);
      
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting zikresource:', err);
      alert('Failed to delete resource. Please try again.');
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
                    // Fallback if image fails to load
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

      {/* Main Content Dashboard */}
      <main className="dashboard-main animate-fade-in">
        {/* Welcome Banner */}
        <section className="welcome-banner glass-panel">
          <h1 className="welcome-title">
            {greeting}
          </h1>
          <p className="welcome-subtitle">
            Welcome to your music space, {user?.name?.split(' ')[0] || 'Musician'}. Zikstock connects your tutorials, sheets, and backing tracks so you can focus on mastering your instrument.
          </p>
        </section>

        {/* Overview Stats */}
        <section className="overview-grid">
          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper">
              <Music size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {connectionStatus === 'checking' ? (
                  <span className="stat-shimmer" />
                ) : connectionStatus === 'error' || stats === null ? (
                  '—'
                ) : (
                  stats.songs
                )}
              </span>
              <span className="stat-label">Songs saved</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {connectionStatus === 'checking' ? (
                  <span className="stat-shimmer" />
                ) : connectionStatus === 'error' || stats === null ? (
                  '—'
                ) : (
                  stats.tabs
                )}
              </span>
              <span className="stat-label">Tabs & sheets</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper">
              <Video size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {connectionStatus === 'checking' ? (
                  <span className="stat-shimmer" />
                ) : connectionStatus === 'error' || stats === null ? (
                  '—'
                ) : (
                  stats.videos
                )}
              </span>
              <span className="stat-label">Video tutorials</span>
            </div>
          </div>
        </section>


        {/* Dashboard Content & Zikresources List / Empty State */}
        <section className="dashboard-content-area">
          {isLoadingZikresources ? (
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
          ) : errorZikresources ? (
            <div className="error-state-panel glass-panel">
              <p className="error-message">{errorZikresources}</p>
              <button className="btn-secondary animate-hover" onClick={fetchAllData}>Retry</button>
            </div>
          ) : zikresources.length === 0 ? (
            <div className="empty-state-panel glass-panel animate-fade-in">
              <div className="empty-state-icon-wrapper">
                <FolderHeart size={36} />
              </div>
              <h3 className="empty-state-title">Your digital binder is empty</h3>
              <p className="empty-state-subtitle">
                Save links to tabs, video tutorials, or audio tracks to build your practice space. Neatly group them under customizable tags.
              </p>
              <button className="btn-primary-large" onClick={() => navigate({ to: '/zikresources/new' })}>
                <Plus size={18} />
                <span>Add Your First Zikresource</span>
              </button>
            </div>
          ) : (
            <div className="resources-section">
              <div className="resources-header">
                <div>
                  <h2 className="resources-title">Your Zikresources</h2>
                  <p className="resources-subtitle">Access your saved references ({zikresources.length})</p>
                </div>
                <button className="btn-primary-large btn-add-zik" onClick={() => navigate({ to: '/zikresources/new' })}>
                  <Plus size={16} />
                  <span>Add Zikresource</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="filters-container glass-panel">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search title, artist, or tags..."
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
              </div>

              {/* Cards Grid */}
              {filteredResources.length === 0 ? (
                <div className="no-results-panel glass-panel">
                  <p>No resources match your filters or search query.</p>
                </div>
              ) : (
                <div className="resources-grid">
                  {filteredResources.map((resource) => {
                    const isDeleting = isDeletingId === resource._id;
                    const isConfirming = confirmDeleteId === resource._id;

                    return (
                      <div key={resource._id} className="resource-card glass-panel animate-card">
                        <div className="card-header">
                          <div className={`card-icon-wrapper type-${resource.type}`}>
                            {getTypeIcon(resource.type)}
                          </div>
                          <div className="card-titles">
                            <h3 className="card-title" title={resource.title}>
                              {resource.title}
                            </h3>
                            <p className="card-artist" title={resource.artist}>
                              {resource.artist}
                            </p>
                          </div>
                        </div>

                        <div className="card-body">
                          <span className={`card-type-badge type-${resource.type}`}>
                            {getTypeLabel(resource.type)}
                          </span>

                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-link"
                          >
                            <span>Open Reference</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>

                        {resource.tags && resource.tags.length > 0 && (
                          <div className="card-tags">
                            {resource.tags.map((tag, idx) => (
                              <span key={idx} className="card-tag">
                                {tag.label}: {tag.value}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="card-actions">
                          {isConfirming ? (
                            <div className="confirm-delete-actions">
                              <span className="confirm-delete-label">Delete this?</span>
                              <button
                                className="btn-confirm-delete"
                                disabled={isDeleting}
                                onClick={() => handleDelete(resource._id)}
                              >
                                {isDeleting ? <Loader2 size={13} className="spinning" /> : 'Yes'}
                              </button>
                              <button
                                className="btn-cancel-delete"
                                disabled={isDeleting}
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-card-delete"
                              onClick={() => setConfirmDeleteId(resource._id)}
                              aria-label="Delete resource"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
