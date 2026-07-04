import React, { useEffect } from 'react';
import { Music, ArrowRight, BookOpen, Users, ListMusic, Sun, Moon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import liveConcertImage from '../../assets/live_concert_stage.png';
import './Landing.css';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/home', replace: true });
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
            aria-label={theme === 'light' ? t.common.themeDark : t.common.themeLight}
            title={theme === 'light' ? t.common.themeDark : t.common.themeLight}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn-primary-outline" onClick={() => navigate({ to: '/login' })}>{t.landing.signIn}</button>
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
            <span>{t.landing.companionBadge}</span>
          </div>

          <h1 className="hero-title">
            {t.landing.titleFirst} <br />
            <span className="text-gradient">{t.landing.titleGradient}</span>
          </h1>

          <p className="hero-subtitle">
            {t.landing.subtitle}
          </p>

          <div className="hero-cta-group">
            <button className="btn-primary" onClick={() => navigate({ to: '/login' })}>
              {t.landing.getStarted} <ArrowRight size={18} />
            </button>
            <a href="#features" className="btn-secondary">
              {t.landing.discoverFeatures}
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
            <h3>{t.landing.feature1Title}</h3>
            <p>{t.landing.feature1Desc}</p>
          </div>
          <div className="feature-card glass-panel" style={{ animationDelay: '0.5s' }}>
            <div className="feature-icon-wrapper">
              <Users size={24} className="feature-icon" />
            </div>
            <h3>{t.landing.feature2Title}</h3>
            <p>{t.landing.feature2Desc}</p>
          </div>
          <div className="feature-card glass-panel" style={{ animationDelay: '0.6s' }}>
            <div className="feature-icon-wrapper">
              <ListMusic size={24} className="feature-icon" />
            </div>
            <h3>{t.landing.feature3Title}</h3>
            <p>{t.landing.feature3Desc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
