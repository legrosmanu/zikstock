/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, createRoute, createRouter, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Landing } from './components/Landing/Landing';
import { LoginPage } from './components/Auth/LoginPage';
import { Home } from './components/Home/Home';
import { CreateZikresource } from './components/CreateZikresource/CreateZikresource';
import { CreateSong } from './components/CreateSong/CreateSong';
import { CreatePlaylist } from './components/CreatePlaylist/CreatePlaylist';
import { ViewZikresource } from './components/ViewZikresource/ViewZikresource';
import { EditZikresource } from './components/EditZikresource/EditZikresource';
import { ViewSong } from './components/ViewSong/ViewSong';
import { EditSong } from './components/EditSong/EditSong';
import { ViewPlaylist } from './components/ViewPlaylist/ViewPlaylist';
import { EditPlaylist } from './components/EditPlaylist/EditPlaylist';
import { AppLayout } from './components/Layout/AppLayout';
import { Network } from './components/Network/Network';
import { Search } from './components/Search/Search';
import { syncUserProfile } from './infra/network.api';

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
  const isPublicRoute = currentPath === '/' || currentPath === '/login';

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      syncUserProfile().catch((err) => {
        console.error('Failed to sync user profile with backend:', err);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated && !isPublicRoute) {
      navigate({ to: '/login', replace: true });
    }
  }, [isInitializing, isAuthenticated, isPublicRoute, navigate]);

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

  if (isAuthenticated && !isPublicRoute) {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
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

// Home Route (/home)
const homeRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/home',
  validateSearch: (search: Record<string, unknown>): { tab?: 'zikresources' | 'songs' | 'playlists' } => {
    const tab = search.tab as string | undefined;
    if (tab === 'zikresources' || tab === 'songs' || tab === 'playlists') {
      return { tab };
    }
    return {};
  },
  component: Home,
});

// Create Zikresource Route (/zikresources/new)
const createZikresourceRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/zikresources/new',
  component: CreateZikresource,
});

// Create Song Route (/songs/new)
const createSongRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/songs/new',
  component: CreateSong,
});

// Create Playlist Route (/playlists/new)
const createPlaylistRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/playlists/new',
  component: CreatePlaylist,
});

// View Zikresource Route (/zikresources/$id)
const viewZikresourceRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/zikresources/$id',
  component: ViewZikresource,
});

// Edit Zikresource Route (/zikresources/$id/edit)
const editZikresourceRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/zikresources/$id/edit',
  component: EditZikresource,
});

// View Song Route (/songs/$id)
const viewSongRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/songs/$id',
  component: ViewSong,
});

// Edit Song Route (/songs/$id/edit)
const editSongRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/songs/$id/edit',
  component: EditSong,
});

// View Playlist Route (/playlists/$id)
const viewPlaylistRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/playlists/$id',
  component: ViewPlaylist,
});

// Edit Playlist Route (/playlists/$id/edit)
const editPlaylistRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/playlists/$id/edit',
  component: EditPlaylist,
});

// Network Route (/network)
const networkRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/network',
  component: Network,
});

// Search Route (/search)
const searchRoute = createRoute({
  loader: () => WittAuth(),
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: (search: Record<string, unknown>): { tab?: 'zikresources' | 'songs' | 'playlists' } => {
    const tab = search.tab as string | undefined;
    if (tab === 'zikresources' || tab === 'songs' || tab === 'playlists') {
      return { tab };
    }
    return {};
  },
  component: Search,
});

// Build the Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  homeRoute,
  createZikresourceRoute,
  createSongRoute,
  createPlaylistRoute,
  viewZikresourceRoute,
  editZikresourceRoute,
  viewSongRoute,
  editSongRoute,
  viewPlaylistRoute,
  editPlaylistRoute,
  networkRoute,
  searchRoute,
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
