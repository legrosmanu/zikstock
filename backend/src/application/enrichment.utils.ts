import { User } from '../users/domain/user.domain';
import { findUsersByIds } from '../users/repositories/firestore-user.repository';

export interface HasCreatedBy {
  createdBy: string;
}

export type WithCreator<T> = T & {
  creatorName?: string;
  creatorPicture?: string;
};

/**
 * Enriches a list of items with their creators' public profile details (name, picture).
 * Deduplicates user IDs and executes a single batch lookup.
 */
export const withCreators = async <T extends HasCreatedBy>(
  items: T[],
  findUsers: (ids: string[]) => Promise<User[]> = findUsersByIds
): Promise<WithCreator<T>[]> => {
  if (items.length === 0) {
    return [];
  }

  const creatorIds = Array.from(new Set(items.map((item) => item.createdBy)));
  const creators = await findUsers(creatorIds);
  const creatorMap = new Map<string, User>(creators.map((u) => [u.id, u]));

  return items.map((item) => {
    const creator = creatorMap.get(item.createdBy);
    return {
      ...item,
      creatorName: creator?.name,
      creatorPicture: creator?.picture,
    };
  });
};

/**
 * Enriches a single item with its creator's public profile details (name, picture).
 */
export const withCreator = async <T extends HasCreatedBy>(
  item: T,
  findUsers: (ids: string[]) => Promise<User[]> = findUsersByIds
): Promise<WithCreator<T>> => {
  const [enriched] = await withCreators([item], findUsers);
  return enriched;
};
