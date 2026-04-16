import { Music, Search, ArrowRight, BookOpen, Users, ListMusic } from 'lucide-react';
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
          <a href="#songbooks">Songbooks</a>
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
            <span>Your Musical Companion</span>
          </div>
          
          <h1 className="hero-title">
            Organize Your <br/>
            <span className="text-gradient">Musical Journey</span>
          </h1>
          
          <p className="hero-subtitle">
            Store and organize the resources you need to learn new songs. The perfect companion to practice alone or build setlists to play with your friends.
          </p>

          <div className="search-container glass-panel">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for songs, tabs, or artists..."
            />
            <button className="btn-primary">
              Get Started <ArrowRight size={18} />
            </button>
          </div>
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
