import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

import './index.css';

// Default: same-origin /api/* (Vercel rewrites proxy to the API host, and
// Replit serves both on one origin). VITE_API_URL overrides for setups that
// call the API host directly.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) setBaseUrl(apiUrl.replace(/\/+$/, ''));

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
