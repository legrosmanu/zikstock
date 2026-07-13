import { getFilterUserId } from './query.utils';
import { describe, it, expect } from '@jest/globals';

describe('Query Utils - getFilterUserId', () => {
    const currentUserId = 'user-123';

    it('should return createdBy value if createdBy is provided', () => {
        const result = getFilterUserId({
            scope: 'mine',
            createdBy: 'other-user',
            currentUserId,
        });
        expect(result).toBe('other-user');
    });

    it('should return undefined if scope is all', () => {
        const result = getFilterUserId({
            scope: 'all',
            currentUserId,
        });
        expect(result).toBeUndefined();
    });

    it('should return currentUserId if scope is not all and createdBy is not provided', () => {
        const result = getFilterUserId({
            scope: 'mine',
            currentUserId,
        });
        expect(result).toBe(currentUserId);
    });

    it('should return currentUserId if no parameters are provided except currentUserId', () => {
        const result = getFilterUserId({
            currentUserId,
        });
        expect(result).toBe(currentUserId);
    });

    it('should handle undefined values gracefully', () => {
        const result = getFilterUserId({});
        expect(result).toBeUndefined();
    });
});
