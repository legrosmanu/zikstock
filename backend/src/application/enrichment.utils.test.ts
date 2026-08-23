import { withCreators, withCreator } from './enrichment.utils';
import type { User } from '../users/domain/user.domain';

describe('enrichment.utils', () => {
  const mockUsers: User[] = [
    {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      picture: 'https://example.com/john.jpg',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'user-2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      picture: 'https://example.com/jane.jpg',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockFindUsersByIds = async (ids: string[]): Promise<User[]> => {
    return mockUsers.filter((u) => ids.includes(u.id));
  };

  describe('withCreators', () => {
    it('returns an empty array when given an empty list without querying users', async () => {
      let called = false;
      const customFinder = async () => {
        called = true;
        return [];
      };

      const result = await withCreators([], customFinder);
      expect(result).toEqual([]);
      expect(called).toBe(false);
    });

    it('enriches multiple items and deduplicates creator query IDs', async () => {
      const queriedIds: string[][] = [];
      const trackingFinder = async (ids: string[]) => {
        queriedIds.push(ids);
        return mockFindUsersByIds(ids);
      };

      const items = [
        { id: 'song-1', title: 'Song 1', createdBy: 'user-1' },
        { id: 'song-2', title: 'Song 2', createdBy: 'user-2' },
        { id: 'song-3', title: 'Song 3', createdBy: 'user-1' }, // duplicate creator
      ];

      const result = await withCreators(items, trackingFinder);

      expect(queriedIds).toEqual([['user-1', 'user-2']]);
      expect(result).toEqual([
        {
          id: 'song-1',
          title: 'Song 1',
          createdBy: 'user-1',
          creatorName: 'John Doe',
          creatorPicture: 'https://example.com/john.jpg',
        },
        {
          id: 'song-2',
          title: 'Song 2',
          createdBy: 'user-2',
          creatorName: 'Jane Smith',
          creatorPicture: 'https://example.com/jane.jpg',
        },
        {
          id: 'song-3',
          title: 'Song 3',
          createdBy: 'user-1',
          creatorName: 'John Doe',
          creatorPicture: 'https://example.com/john.jpg',
        },
      ]);
    });

    it('gracefully handles missing creators (unknown creator ID)', async () => {
      const items = [{ id: 'song-unknown', title: 'Unknown', createdBy: 'user-unknown' }];

      const result = await withCreators(items, mockFindUsersByIds);

      expect(result).toEqual([
        {
          id: 'song-unknown',
          title: 'Unknown',
          createdBy: 'user-unknown',
          creatorName: undefined,
          creatorPicture: undefined,
        },
      ]);
    });
  });

  describe('withCreator', () => {
    it('enriches a single entity', async () => {
      const item = { id: 'song-1', title: 'Solo', createdBy: 'user-1' };
      const result = await withCreator(item, mockFindUsersByIds);

      expect(result).toEqual({
        id: 'song-1',
        title: 'Solo',
        createdBy: 'user-1',
        creatorName: 'John Doe',
        creatorPicture: 'https://example.com/john.jpg',
      });
    });
  });
});
