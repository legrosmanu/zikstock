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
  Moon
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
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

  // Live integration check: Call protected /zikresources API to verify auth token
  useEffect(() => {
    if (!token) {
      setConnectionStatus('error');
      return;
    }

    const checkBackendConnection = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        setConnectionStatus('checking');
        const response = await fetch(`${apiUrl}/zikresources`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setConnectionStatus('active');
        } else {
          console.warn('Backend returned unauthorized status:', response.status);
          setConnectionStatus('error');
        }
      } catch (err) {
        console.error('Error connecting to backend API:', err);
        setConnectionStatus('error');
      }
    };

    checkBackendConnection();
  }, [token]);

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
              <span className="stat-value">0</span>
              <span className="stat-label">Songs saved</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Tabs & sheets</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper">
              <Video size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">0</span>
              <span className="stat-label">Video tutorials</span>
            </div>
          </div>
        </section>

        {/* Dashboard Content & Empty State */}
        <section className="dashboard-content-area">
          <div className="empty-state-panel glass-panel">
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
