// frontend/src/apiService.ts
import { useAuthStore } from '../store/authStore';
// Note: In a full implementation, you might need to import useNavigate or use a context 
// to get the router's navigate function, which is complex in a standalone service.
// We will handle navigation in the component calling this service.

/**
 * Wraps the native fetch API to centralize network error handling, 
 * particularly for expired JWTs (401).
 * 
 * @param url The endpoint URL.
 * @param options Fetch options (method, headers, body).
 * @returns A Promise that resolves with the response JSON data.
 * @throws {Error} Throws a custom error if the token is invalid or expired.
 */
export const authenticatedPost = async (
  endpoint: string, 
  body: unknown = {}
): Promise<any> => {
  const store = useAuthStore.getState();
  const token = store.token;
  
  if (!token) {
    throw new Error('AUTHENTICATION_ERROR: Token is null or undefined.');
  }

  let fetchOptions = { 
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(body),
  };

  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText || ''}`);
    }

    // Attempt to parse JSON response
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        // If parsing fails, return the raw text but alert the consumer
        console.warn("Could not parse response as JSON. Returning raw text.", e);
        return text;
    }

  } catch (error) {
    // Re-throw specific connection or network errors
    throw error;
  }
};

// ---
// NOTE TO SELF: The calling component MUST catch the error and trigger the logout/refresh flow
// if the error message contains 'Unauthorized' or 'expired'.
// ---
