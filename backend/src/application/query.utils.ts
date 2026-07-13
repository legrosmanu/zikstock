/**
 * Centralized utility to resolve the createdBy filter for resources,
 * based on API scope query parameters.
 */
export interface FilterUserIdParams {
  scope?: string;
  createdBy?: string;
  currentUserId?: string;
}

export const getFilterUserId = (params: FilterUserIdParams): string | undefined => {
  if (params.createdBy) {
    return params.createdBy;
  }
  if (params.scope === 'all') {
    return undefined;
  }
  return params.currentUserId;
};
