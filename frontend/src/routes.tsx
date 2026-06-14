/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, createRoute, createRouter, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Landing } from './components/Landing/Landing';
import { LoginPage } from './components/Auth/LoginPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { CreateZikresource } from './components/CreateZikresource/CreateZikresource';

async function WittAuth<T>(apiCall?: () => Promise<T>): Promise<T | undefined> {
  try {
    const store = useAuthStore.getState();
    const hasToken = !!store.token;
    if (!hasToken) {
      throw new Error('401 - Non authentifié')
    }

    if (apiCall) {
      return await apiCall()
    }

    return undefined
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      throw redirect({ to: '/login' })
    }
    throw error
  }
}

// Root Route Component
const RootComponent = () => {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const isPublicRoute = currentPath === '/' || currentPath === '/login';
    if (!isInitializing && !isAuthenticated && !isPublicRoute) {
      navigate({ to: '/login', replace: true });
    }
  }, [isInitializing, isAuthenticated, currentPath, navigate]);

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

  return <Outlet />;
};

export const rootRoute = createRootRoute({
  component: RootComponent,
});

// Index Route (/)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
});

// Login Route (/login)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Dashboard Route (/dashboard)
const dashboardRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

// Create Zikresource Route (/zikresources/new)
const createZikresourceRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/zikresources/new',
  component: CreateZikresource,
});

// Build the Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  createZikresourceRoute,
]);

// Create the Router
export const router = createRouter({
  routeTree,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
