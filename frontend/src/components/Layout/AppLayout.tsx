import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  LogOut,
  User,
  Sun,
  Moon,
  FileText,
  Folder,
  Users
} from 'lucide-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useTheme();

  // Mobile dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine active section based on path & search query
  const searchParams = new URLSearchParams(routerState.location.search);
  const tabParam = searchParams.get('tab');

  let activeSection: 'zikresources' | 'playlists' | 'songs' | 'network' = 'zikresources';
  if (currentPath === '/home') {
    if (tabParam === 'playlists') activeSection = 'playlists';
    else if (tabParam === 'songs') activeSection = 'songs';
  } else if (currentPath.startsWith('/playlists')) {
    activeSection = 'playlists';
  } else if (currentPath.startsWith('/songs')) {
    activeSection = 'songs';
  } else if (currentPath.startsWith('/network')) {
    activeSection = 'network';
  }

  const navigateToSection = (section: 'zikresources' | 'playlists' | 'songs' | 'network') => {
    if (section === 'network') {
      navigate({ to: '/network' });
    } else {
      navigate({ to: '/home', search: { tab: section } });
    }
    setIsDropdownOpen(false);
  };

  const handleSignOut = () => {
    logout();
    navigate({ to: '/login', replace: true });
  };

  // Determine if we are on a main tab view or subpage
  const isMainView = currentPath === '/home' || currentPath === '/network';

  return (
    <div className="app-shell-layout">
      {/* ── Desktop Left Sidebar ── */}
      <aside className="app-sidebar">
        <div className="sidebar-brand" onClick={() => navigateToSection('zikresources')}>
          <div className="brand-logo-icon">
            <Music size={22} />
          </div>
          <span className="brand-logo-text">Zikstock</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeSection === 'zikresources' ? 'active' : ''}`}
            onClick={() => navigateToSection('zikresources')}
          >
            <FileText size={18} />
            <span>Zikresources</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeSection === 'playlists' ? 'active' : ''}`}
            onClick={() => navigateToSection('playlists')}
          >
            <Folder size={18} />
            <span>Playlists</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeSection === 'songs' ? 'active' : ''}`}
            onClick={() => navigateToSection('songs')}
          >
            <Music size={18} />
            <span>Songs</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeSection === 'network' ? 'active' : ''}`}
            onClick={() => navigateToSection('network')}
          >
            <Users size={18} />
            <span>Network</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-profile-card">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="profile-avatar" />
              ) : (
                <div className="profile-avatar fallback">
                  <User size={16} />
                </div>
              )}
              <div className="profile-info">
                <span className="profile-name">{user.name || 'Musician'}</span>
                <span className="profile-email">{user.email}</span>
              </div>
            </div>
          )}

          <div className="sidebar-actions">
            <button
              className="action-btn theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <button className="action-btn signout-btn" onClick={handleSignOut}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Viewports ── */}
      {/* Mobile Top Header (only on main views) */}
      {isMainView && (
        <header className="mobile-header">
          <div className="mobile-header-brand">
            <div className="brand-logo-icon">
              <Music size={18} />
            </div>
            <span className="brand-logo-text">Zikstock</span>
          </div>

          <div className="mobile-header-actions" ref={dropdownRef}>
            <button
              className="mobile-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button
              className="mobile-avatar-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="User menu"
            >
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="mobile-avatar" />
              ) : (
                <div className="mobile-avatar fallback">
                  <User size={16} />
                </div>
              )}
            </button>

            {/* Glassmorphic Dropdown Menu */}
            {isDropdownOpen && (
              <div className="mobile-dropdown glass-panel animate-slide-down">
                {user && (
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{user.name || 'Musician'}</span>
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                )}
                <hr className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={handleSignOut}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* ── Content Container ── */}
      <div className={`app-main-viewport ${isMainView ? 'with-mobile-bars' : 'subpage-viewport'}`}>
        <main className="app-content">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (only on main views) */}
      {isMainView && (
        <nav className="mobile-bottom-nav">
          <button
            className={`mobile-tab-item ${activeSection === 'zikresources' ? 'active' : ''}`}
            onClick={() => navigateToSection('zikresources')}
          >
            <FileText size={20} />
            <span className="tab-label">Resources</span>
          </button>

          <button
            className={`mobile-tab-item ${activeSection === 'playlists' ? 'active' : ''}`}
            onClick={() => navigateToSection('playlists')}
          >
            <Folder size={20} />
            <span className="tab-label">Playlists</span>
          </button>

          <button
            className={`mobile-tab-item ${activeSection === 'songs' ? 'active' : ''}`}
            onClick={() => navigateToSection('songs')}
          >
            <Music size={20} />
            <span className="tab-label">Songs</span>
          </button>

          <button
            className={`mobile-tab-item ${activeSection === 'network' ? 'active' : ''}`}
            onClick={() => navigateToSection('network')}
          >
            <Users size={20} />
            <span className="tab-label">Network</span>
          </button>
        </nav>
      )}
    </div>
  );
};
