/**
 * Normalizes a raw user profile object from any source (API response or JWT decode)
 * to ensure `sub` is always defined, regardless of whether the source uses
 * `id` (backend User model) or `sub` (JWT standard claim).
 *
 * This is needed because:
 * - After login/refresh: the backend returns `{ id, email, name, picture }` (no `sub`)
 * - After page reload: the JWT is decoded directly, yielding `{ sub, email, name, picture }` (no `id`)
 *
 * All ownership checks in the app rely on `user.sub === resource.createdBy`,
 * so `sub` must always be set to the canonical user identifier.
 */
export const normalizeUserProfile = (raw: Record<string, unknown>): { sub: string; email: string; name?: string; picture?: string } => ({
    sub: (raw.sub ?? raw.id) as string,
    email: raw.email as string,
    name: raw.name as string | undefined,
    picture: raw.picture as string | undefined,
});
