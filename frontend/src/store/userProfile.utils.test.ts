import { describe, it } from 'node:test';
import assert from 'node:assert';
import { normalizeUserProfile } from './userProfile.utils.ts';

describe('normalizeUserProfile', () => {
    it('should use `sub` when present', () => {
        const raw = { sub: 'google-sub-123', email: 'user@example.com', name: 'User' };
        const result = normalizeUserProfile(raw);
        assert.strictEqual(result.sub, 'google-sub-123');
        assert.strictEqual(result.email, 'user@example.com');
        assert.strictEqual(result.name, 'User');
    });

    it('should fall back to `id` when `sub` is absent (backend User model response)', () => {
        const raw = { id: 'firestore-id-456', email: 'user@example.com', name: 'User' };
        const result = normalizeUserProfile(raw);
        assert.strictEqual(result.sub, 'firestore-id-456');
        assert.strictEqual(result.email, 'user@example.com');
    });

    it('should prefer `sub` over `id` when both are present', () => {
        const raw = { sub: 'google-sub-123', id: 'firestore-id-456', email: 'user@example.com' };
        const result = normalizeUserProfile(raw);
        assert.strictEqual(result.sub, 'google-sub-123');
    });

    it('should preserve optional fields `name` and `picture`', () => {
        const raw = {
            sub: 'google-sub-123',
            email: 'user@example.com',
            name: 'User Name',
            picture: 'https://example.com/avatar.jpg',
        };
        const result = normalizeUserProfile(raw);
        assert.strictEqual(result.name, 'User Name');
        assert.strictEqual(result.picture, 'https://example.com/avatar.jpg');
    });

    it('should return undefined for optional fields when not provided', () => {
        const raw = { sub: 'google-sub-123', email: 'user@example.com' };
        const result = normalizeUserProfile(raw);
        assert.strictEqual(result.name, undefined);
        assert.strictEqual(result.picture, undefined);
    });
});
