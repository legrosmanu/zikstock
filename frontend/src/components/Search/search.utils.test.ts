import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  filterAndSortSongs,
  filterAndSortPlaylists
} from './search.utils.ts';
import type { Song } from '../../infra/song.api';
import type { Playlist } from '../../infra/playlist.api';

describe('search.utils - filterAndSortSongs', () => {
  const sampleSongs: Song[] = [
    {
      _id: 'song-1',
      title: 'Comfortably Numb',
      artist: 'Pink Floyd',
      createdBy: 'user-bob',
      creatorName: 'Bob',
      zikresourceIds: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      _id: 'song-2',
      title: 'Comfortably Numb',
      artist: 'Pink Floyd',
      createdBy: 'user-alice',
      creatorName: 'Alice',
      zikresourceIds: [],
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      clonedFrom: 'song-1'
    },
    {
      _id: 'song-3',
      title: 'My Own Song',
      artist: 'Me',
      createdBy: 'user-me',
      creatorName: 'Me',
      zikresourceIds: [],
      createdAt: '2026-01-03T00:00:00Z',
      updatedAt: '2026-01-03T00:00:00Z'
    }
  ];

  it('should exclude cloned songs (having clonedFrom)', () => {
    const results = filterAndSortSongs(sampleSongs, { currentUserId: 'user-other' });
    const ids = results.map(s => s._id);
    assert.strictEqual(ids.includes('song-2'), false, 'Cloned song song-2 should be excluded');
    assert.strictEqual(ids.includes('song-1'), true, 'Original song song-1 should be included');
  });

  it('should exclude own songs', () => {
    const results = filterAndSortSongs(sampleSongs, { currentUserId: 'user-me' });
    const ids = results.map(s => s._id);
    assert.strictEqual(ids.includes('song-3'), false, 'Own song should be excluded');
  });
});

describe('search.utils - filterAndSortPlaylists', () => {
  const samplePlaylists: Playlist[] = [
    {
      _id: 'pl-1',
      name: 'Classic Rock',
      description: 'The best rock songs',
      createdBy: 'user-bob',
      creatorName: 'Bob',
      songIds: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      _id: 'pl-2',
      name: 'My Playlist',
      createdBy: 'user-me',
      creatorName: 'Me',
      songIds: [],
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z'
    }
  ];

  it('should exclude own playlists and filter by network / search', () => {
    const results = filterAndSortPlaylists(samplePlaylists, {
      currentUserId: 'user-me',
      searchQuery: 'classic'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0]._id, 'pl-1');
  });
});
