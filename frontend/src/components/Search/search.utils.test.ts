import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  filterAndSortZikresources,
  filterAndSortSongs,
  filterAndSortPlaylists
} from './search.utils.ts';
import type { Zikresource } from '../../infra/zikresource.api';
import type { Song } from '../../infra/song.api';
import type { Playlist } from '../../infra/playlist.api';

describe('search.utils - filterAndSortZikresources', () => {
  const sampleResources: Zikresource[] = [
    {
      _id: 'res-1',
      title: 'Hotel California Tab',
      artist: 'Eagles',
      createdBy: 'user-bob',
      creatorName: 'Bob',
      url: 'https://example.com/1',
      type: 'tablature',
      tags: [{ label: 'level', value: 'intermediate' }]
    },
    {
      _id: 'res-2',
      title: 'Hotel California Tab',
      artist: 'Eagles',
      createdBy: 'user-alice',
      creatorName: 'Alice',
      url: 'https://example.com/1',
      type: 'tablature',
      clonedFrom: 'res-1' // Clone of res-1
    },
    {
      _id: 'res-3',
      title: 'Sober Video Lesson',
      artist: 'Tool',
      createdBy: 'user-charlie',
      creatorName: 'Charlie',
      url: 'https://example.com/3',
      type: 'video',
      tags: [{ label: 'genre', value: 'rock' }]
    },
    {
      _id: 'res-4',
      title: 'My Own Tab',
      artist: 'Self Artist',
      createdBy: 'user-me',
      creatorName: 'Me',
      url: 'https://example.com/4',
      type: 'tablature'
    }
  ];

  it('should exclude cloned resources (having clonedFrom)', () => {
    const results = filterAndSortZikresources(sampleResources, { currentUserId: 'user-other' });
    const ids = results.map(r => r._id);
    assert.strictEqual(ids.includes('res-2'), false, 'Cloned resource res-2 should be excluded');
    assert.strictEqual(ids.includes('res-1'), true, 'Original resource res-1 should be included');
    assert.strictEqual(ids.includes('res-3'), true, 'Original resource res-3 should be included');
  });

  it('should exclude own resources (matching currentUserId)', () => {
    const results = filterAndSortZikresources(sampleResources, { currentUserId: 'user-me' });
    const ids = results.map(r => r._id);
    assert.strictEqual(ids.includes('res-4'), false, 'Own resource should be excluded');
  });

  it('should filter by resource type', () => {
    const results = filterAndSortZikresources(sampleResources, {
      currentUserId: 'user-me',
      selectedResourceType: 'videos'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0]._id, 'res-3');
  });

  it('should filter by network when onlyNetwork is true', () => {
    const results = filterAndSortZikresources(sampleResources, {
      currentUserId: 'user-me',
      onlyNetwork: true,
      networkUserIds: new Set(['user-bob'])
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0]._id, 'res-1');
  });

  it('should search by title, artist, creatorName, and tags', () => {
    const byTag = filterAndSortZikresources(sampleResources, {
      currentUserId: 'user-me',
      searchQuery: 'rock'
    });
    assert.strictEqual(byTag.length, 1);
    assert.strictEqual(byTag[0]._id, 'res-3');

    const byArtist = filterAndSortZikresources(sampleResources, {
      currentUserId: 'user-me',
      searchQuery: 'Eagles'
    });
    assert.strictEqual(byArtist.length, 1);
    assert.strictEqual(byArtist[0]._id, 'res-1');
  });

  it('should sort resources by title or artist or newest', () => {
    const sortedByTitle = filterAndSortZikresources(sampleResources, {
      currentUserId: 'user-me',
      sortBy: 'title'
    });
    assert.strictEqual(sortedByTitle[0]._id, 'res-1');
    assert.strictEqual(sortedByTitle[1]._id, 'res-3');
  });
});

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
