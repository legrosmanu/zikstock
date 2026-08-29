import type { Zikresource } from '../../infra/zikresource.api';
import type { Song } from '../../infra/song.api';
import type { Playlist } from '../../infra/playlist.api';

export interface FilterZikresourceOptions {
  currentUserId?: string;
  selectedResourceType?: string;
  onlyNetwork?: boolean;
  networkUserIds?: Set<string>;
  searchQuery?: string;
  sortBy?: 'newest' | 'title' | 'artist';
}

export interface FilterSongOptions {
  currentUserId?: string;
  onlyNetwork?: boolean;
  networkUserIds?: Set<string>;
  searchQuery?: string;
  sortBy?: 'newest' | 'title' | 'artist';
}

export interface FilterPlaylistOptions {
  currentUserId?: string;
  onlyNetwork?: boolean;
  networkUserIds?: Set<string>;
  searchQuery?: string;
  sortBy?: 'newest' | 'title' | 'artist';
}

export const filterAndSortZikresources = (
  resources: Zikresource[],
  options: FilterZikresourceOptions = {}
): Zikresource[] => {
  const {
    currentUserId,
    selectedResourceType = 'all',
    onlyNetwork = false,
    networkUserIds = new Set(),
    searchQuery = '',
    sortBy = 'newest'
  } = options;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  return resources
    .filter((resource) => {
      // Exclude user's own resources from search
      if (currentUserId && resource.createdBy === currentUserId) return false;

      // Exclude cloned resources to avoid duplicates
      if (resource.clonedFrom) return false;

      // Type filter
      if (selectedResourceType !== 'all') {
        if (selectedResourceType === 'tabs' && resource.type !== 'tablature') return false;
        if (selectedResourceType === 'videos' && resource.type !== 'video') return false;
        if (selectedResourceType === 'backing-tracks' && resource.type !== 'backing-track') return false;
        if (selectedResourceType === 'lyrics' && resource.type !== 'lyrics') return false;
        if (selectedResourceType === 'other' && resource.type !== 'other') return false;
      }

      // Network filter
      if (onlyNetwork && !networkUserIds.has(resource.createdBy)) return false;

      // Search query filter
      if (normalizedQuery !== '') {
        const matchesTitle = resource.title.toLowerCase().includes(normalizedQuery);
        const matchesArtist = (resource.artist || '').toLowerCase().includes(normalizedQuery);
        const matchesCreator = (resource.creatorName || '').toLowerCase().includes(normalizedQuery);
        const matchesTag = resource.tags?.some(
          (tag) =>
            tag.label.toLowerCase().includes(normalizedQuery) ||
            tag.value.toLowerCase().includes(normalizedQuery)
        );
        return matchesTitle || matchesArtist || matchesCreator || matchesTag;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      return b._id.localeCompare(a._id);
    });
};

export const filterAndSortSongs = (
  songs: Song[],
  options: FilterSongOptions = {}
): Song[] => {
  const {
    currentUserId,
    onlyNetwork = false,
    networkUserIds = new Set(),
    searchQuery = '',
    sortBy = 'newest'
  } = options;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  return songs
    .filter((song) => {
      // Exclude user's own songs from search
      if (currentUserId && song.createdBy === currentUserId) return false;

      // Exclude cloned songs to avoid duplicates
      if (song.clonedFrom) return false;

      // Network filter
      if (onlyNetwork && !networkUserIds.has(song.createdBy)) return false;

      // Search query filter
      if (normalizedQuery !== '') {
        const matchesTitle = song.title.toLowerCase().includes(normalizedQuery);
        const matchesArtist = (song.artist || '').toLowerCase().includes(normalizedQuery);
        const matchesCreator = (song.creatorName || '').toLowerCase().includes(normalizedQuery);
        return matchesTitle || matchesArtist || matchesCreator;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      return b._id.localeCompare(a._id);
    });
};

export const filterAndSortPlaylists = (
  playlists: Playlist[],
  options: FilterPlaylistOptions = {}
): Playlist[] => {
  const {
    currentUserId,
    onlyNetwork = false,
    networkUserIds = new Set(),
    searchQuery = '',
    sortBy = 'newest'
  } = options;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  return playlists
    .filter((pl) => {
      // Exclude user's own playlists from search
      if (currentUserId && pl.createdBy === currentUserId) return false;

      // Network filter
      if (onlyNetwork && !networkUserIds.has(pl.createdBy)) return false;

      // Search query filter
      if (normalizedQuery !== '') {
        const matchesName = pl.name.toLowerCase().includes(normalizedQuery);
        const matchesDesc = (pl.description || '').toLowerCase().includes(normalizedQuery);
        const matchesCreator = (pl.creatorName || '').toLowerCase().includes(normalizedQuery);
        return matchesName || matchesDesc || matchesCreator;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.name.localeCompare(b.name);
      return b._id.localeCompare(a._id);
    });
};
