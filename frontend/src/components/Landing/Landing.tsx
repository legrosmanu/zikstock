import { Music, Search, ArrowRight, Activity, Disc, Users } from 'lucide-react';
import './Landing.css';

export const Landing = () => {
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
        <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#catalog">Catalog</a>
          <a href="#about">About</a>
        </div>
        <button className="btn-primary-outline">Sign In</button>
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
            <span>The New Era of Musical Assets</span>
          </div>
          
          <h1 className="hero-title">
            Discover Quality <br/>
            <span className="text-gradient">Musical Resources</span>
          </h1>
          
          <p className="hero-subtitle">
            A curated, high-quality collection of beats, samples, and scores for modern creators. Build your next masterpiece with Zikstock.
          </p>

          <div className="search-container glass-panel">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for stems, samples, or scores..."
            />
            <button className="btn-primary">
              Discover <ArrowRight size={18} />
            </button>
          </div>
          
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">10k+</span>
              <span className="stat-label">Tracks</span>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
              <span className="stat-value">HD</span>
              <span className="stat-label">Audio Quality</span>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
              <span className="stat-value">Daily</span>
              <span className="stat-label">Updates</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Showcase */}
      <section className="features-section" id="features">
        <div className="feature-grid">
          <div className="feature-card glass-panel" style={{ animationDelay: '0.4s' }}>
            <div className="feature-icon-wrapper">
              <Activity size={24} className="feature-icon" />
            </div>
            <h3>Pristine Quality</h3>
            <p>Every sample and track is mastered to perfection, guaranteeing studio-grade sound.</p>
          </div>
          <div className="feature-card glass-panel" style={{ animationDelay: '0.5s' }}>
            <div className="feature-icon-wrapper">
              <Disc size={24} className="feature-icon" />
            </div>
            <h3>Vast Library</h3>
            <p>From vintage vinyl rips to modern synth waves, find exactly what fits your vibe.</p>
          </div>
          <div className="feature-card glass-panel" style={{ animationDelay: '0.6s' }}>
            <div className="feature-icon-wrapper">
              <Users size={24} className="feature-icon" />
            </div>
            <h3>Creator Focused</h3>
            <p>Built for artists, by artists. Clear licensing and seamless downloads.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
