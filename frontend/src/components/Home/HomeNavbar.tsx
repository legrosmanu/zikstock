import React from 'react';
import { Music, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';

export const HomeNavbar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useTheme();

  return (
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
              <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
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
  );
};
