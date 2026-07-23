import { useEffect } from 'react';

const SITE_NAME = 'CameraEye';

/**
 * Set the document title per page. Pass undefined for the site root so the tab
 * shows just the site name; otherwise renders "<title> — CameraEye".
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
