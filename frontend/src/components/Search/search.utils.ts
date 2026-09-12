import type { Song } from '../../infra/song.api';
import type { Playlist } from '../../infra/playlist.api';

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
