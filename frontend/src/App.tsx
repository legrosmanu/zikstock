import { useEffect, useState } from 'react';
import { Landing } from './components/Landing/Landing';
import { LoginPage } from './components/Auth/LoginPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  
  // Simple state router for unauthenticated paths
  const [currentView, setCurrentView] = useState<'landing' | 'login'>('landing');

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0a0a0b', 
        color: '#8b5cf6',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ 
          fontSize: '1.15rem', 
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          Synchronizing session...
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .4; }
          }
        `}</style>
      </div>
    );
  }

  // If authenticated, always show Dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // Otherwise, render requested unauthenticated view
  return (
    <>
      {currentView === 'landing' ? (
        <Landing onNavigateToLogin={() => setCurrentView('login')} />
      ) : (
        <LoginPage onNavigateToLanding={() => setCurrentView('landing')} />
      )}
    </>
  );
}

export default App;
