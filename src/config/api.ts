export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// If VITE_API_URL is not set (local dev), it defaults to '' which means '/api/...' works via proxy.
// If VITE_API_URL is set (prod), it becomes 'https://backend.vercel.app/api/...'
