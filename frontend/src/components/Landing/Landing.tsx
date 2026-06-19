import React, { useEffect } from 'react';
import { Music, ArrowRight, BookOpen, Users, ListMusic, Sun, Moon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import liveConcertImage from '../../assets/live_concert_stage.png';
import './Landing.css';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/home' as any, replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="navbar animate-fade-in">
        <div className="navbar-logo">
          <div className="logo-icon">
            <Music size={24} />
          </div>
          <span className="logo-text">Zikstock</span>
        </div>
        <div className="navbar-actions">
          <button
            className="btn-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn-primary-outline" onClick={() => navigate({ to: '/login' })}>Sign In</button>
        </div>
      </nav>


      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-background">
          <div className="glow-orb primary"></div>
          <div className="glow-orb secondary"></div>
        </div>
        
        <div className="hero-content animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="badge">
            <span className="badge-dot"></span>
            <span>Your Musical Companion</span>
          </div>
          
          <h1 className="hero-title">
            Organize Your <br/>
            <span className="text-gradient">Musical Journey</span>
          </h1>
          
          <p className="hero-subtitle">
            Store and organize the resources you need to learn new songs. The perfect companion to practice alone or build setlists to play with your friends.
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary" onClick={() => navigate({ to: '/login' })}>
              Get Started <ArrowRight size={18} />
            </button>
            <a href="#features" className="btn-secondary">
              Discover Features
            </a>
          </div>
        </div>

        <div className="hero-image-container animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <img src={liveConcertImage} alt="Live Music Concert" className="hero-live-img" />
        </div>
      </main>

      {/* Features Showcase */}
      <section className="features-section" id="features">
        <div className="feature-grid">
          <div className="feature-card glass-panel" style={{ animationDelay: '0.4s' }}>
            <div className="feature-icon-wrapper">
              <BookOpen size={24} className="feature-icon" />
            </div>
            <h3>Learn New Songs</h3>
            <p>Save links to tabs, video tutorials, and backing tracks all in one place. Never lose a resource again.</p>
          </div>
          <div className="feature-card glass-panel" style={{ animationDelay: '0.5s' }}>
            <div className="feature-icon-wrapper">
              <Users size={24} className="feature-icon" />
            </div>
            <h3>Play With Friends</h3>
            <p>Group your songs into shared songbooks. Easily decide which tracks to learn and play in your next jam session.</p>
          </div>
          <div className="feature-card glass-panel" style={{ animationDelay: '0.6s' }}>
            <div className="feature-icon-wrapper">
              <ListMusic size={24} className="feature-icon" />
            </div>
            <h3>Organized Practice</h3>
            <p>Focus on playing. Zikstock acts as your digital binder, keeping all your musical references neatly structured.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
