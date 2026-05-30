import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Music, ShieldAlert, Terminal } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [isAuthenticated, navigate]);
  const login = useAuthStore((state) => state.login);
  const devLogin = useAuthStore((state) => state.devLogin);
  
  const [gisLoaded, setGisLoaded] = useState<boolean>(false);
  const [hasClientId, setHasClientId] = useState<boolean>(true);
  const buttonRendered = useRef<boolean>(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Check if client ID is configured
  useEffect(() => {
    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      setHasClientId(false);
    } else {
      setHasClientId(true);
    }
  }, [clientId]);

  // Check and initialize Google Identity Services
  useEffect(() => {
    if (!hasClientId) return;

    let checkInterval: NodeJS.Timeout;
    let attempts = 0;

    const initGoogleGis = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              const success = login(response.credential);
              if (success) {
                // Auth store state change automatically redirects via App.tsx
              }
            },
            auto_select: false,
          });

          // Wait a tick to ensure the DOM element with ID 'login-google-signin-button' is mounted
          setTimeout(() => {
            const btnContainer = document.getElementById('login-google-signin-button');
            if (btnContainer && !buttonRendered.current) {
              window.google?.accounts.id.renderButton(btnContainer, {
                theme: 'outline',
                size: 'large',
                width: '320',
                shape: 'pill',
                text: 'signin_with',
              });
              buttonRendered.current = true;
            }
          }, 150);
        } catch (err) {
          console.error('Failed to initialize Google Identity Services:', err);
        }
        return true;
      }
      return false;
    };

    // Try immediately
    const success = initGoogleGis();
    if (!success) {
      // Poll every 300ms if GIS script is not yet loaded
      checkInterval = setInterval(() => {
        attempts++;
        const initialized = initGoogleGis();
        if (initialized || attempts > 15) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      buttonRendered.current = false;
    };
  }, [hasClientId, clientId, login]);

  const handleDevLogin = () => {
    devLogin();
  };

  return (
    <div className="login-page-container animate-fade-in">
      {/* Desktop Left Branding Panel */}
      <div className="login-left-pane">
        <div className="login-brand" onClick={() => navigate({ to: '/' })}>
          <div className="login-brand-icon">
            <Music size={22} />
          </div>
          <span className="login-brand-text">Zikstock</span>
        </div>

        <div className="login-left-content">
          <h1 className="login-hero-title">
            Organize Your <br />
            <span style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Musical Journey
            </span>
          </h1>
          <p className="login-hero-subtitle">
            Store and organize the resources you need to learn new songs. The perfect companion to practice alone or build setlists to play with your friends.
          </p>
        </div>

        <div className="login-left-footer">
          &copy; {new Date().getFullYear()} Zikstock. Designed for musicians.
        </div>
      </div>

      {/* Desktop Right / Mobile Card Login Panel */}
      <div className="login-right-pane">
        <div className="login-card glass-panel">
          <button className="btn-back-landing" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </button>

          {/* Dedicated mobile logo (hidden on desktop) */}
          <div className="mobile-login-icon">
            <Music size={26} />
          </div>

          <div className="login-card-header">
            <h2 className="login-card-title">Sign In</h2>
            <p className="login-card-subtitle">Connect to your musical repository</p>
          </div>

          <div className="login-card-body">
            {hasClientId ? (
              <div className="google-button-container-wrapper">
                <div className="login-google-container" id="login-google-signin-button">
                  {!gisLoaded && (
                    <p className="login-card-subtitle animate-pulse">Establishing secure connection...</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="login-warning-box">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', fontWeight: 600, alignItems: 'center' }}>
                  <ShieldAlert size={16} />
                  <span>Google Client ID Unconfigured</span>
                </div>
                <p>
                  To enable Google Authentication, add your client ID to <code>VITE_GOOGLE_CLIENT_ID</code> in the frontend <code>.env</code> file.
                </p>
              </div>
            )}

            <div className="login-divider">or use dev sandbox</div>

            <button className="btn-login-dev" onClick={handleDevLogin}>
              <Terminal size={18} />
              <span>Developer Mode Login</span>
              <span className="login-dev-badge">Bypass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
