import { useAuthStore } from '../store/authStore';

const getApiUrl = (): string => import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  isRetry?: boolean;
}

const fetchWithAuth = async (endpoint: string, options: RequestOptions = {}): Promise<Response> => {
  const store = useAuthStore.getState();
  const token = store.token;

  const { isRetry, headers: customHeaders, ...restOptions } = options;

  if (!token && !isRetry) {
    throw new Error('AUTHENTICATION_ERROR: Token is null or undefined.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...restOptions,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !isRetry) {
    // Attempt automatic token refresh
    const refreshed = await useAuthStore.getState().refreshSession();
    if (refreshed) {
      // Retry request once with new token
      const newToken = useAuthStore.getState().token;
      const retryHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        ...(customHeaders as Record<string, string>),
      };
      return fetch(`${getApiUrl()}${endpoint}`, {
        ...restOptions,
        headers: retryHeaders,
        credentials: 'include',
      });
    } else {
      useAuthStore.getState().logout();
    }
  }

  return response;
};

export const authenticatedPost = async <T = unknown>(
  endpoint: string,
  body: unknown = {}
): Promise<T> => {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new Error(`HTTP Error: ${response.status} ${response.statusText || ''}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('Could not parse response as JSON. Returning raw text.', e);
    return text as unknown as T;
  }
};

export const authenticatedGet = async <T = unknown>(
  endpoint: string
): Promise<T> => {
  const response = await fetchWithAuth(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new Error(`HTTP Error: ${response.status} ${response.statusText || ''}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('Could not parse response as JSON. Returning raw text.', e);
    return text as unknown as T;
  }
};

export const authenticatedDelete = async <T = unknown>(
  endpoint: string
): Promise<T> => {
  const response = await fetchWithAuth(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new Error(`HTTP Error: ${response.status} ${response.statusText || ''}`);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('Could not parse response as JSON. Returning raw text.', e);
    return text as unknown as T;
  }
};

export const authenticatedPut = async <T = unknown>(
  endpoint: string,
  body: unknown = {}
): Promise<T> => {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new Error(`HTTP Error: ${response.status} ${response.statusText || ''}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('Could not parse response as JSON. Returning raw text.', e);
    return text as unknown as T;
  }
};
