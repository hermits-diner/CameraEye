import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  ogImage?: string;
}

export function useSEO({ title, description, ogImage }: SEOOptions) {
  useEffect(() => {
    // Title
    const defaultTitle = 'CamerEye — Fine Art & Editorial Photography';
    document.title = title ? `${title} | CamerEye` : defaultTitle;

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    const descContent = description || 'Cinematic photography portfolio exploring light, atmosphere, and human absence.';
    if (metaDesc) {
      metaDesc.setAttribute('content', descContent);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descContent;
      document.head.appendChild(meta);
    }

    // OpenGraph Title
    let ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (!ogTitleTag) {
      ogTitleTag = document.createElement('meta');
      ogTitleTag.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleTag);
    }
    ogTitleTag.setAttribute('content', title || defaultTitle);

    // OpenGraph Image
    if (ogImage) {
      let ogImgTag = document.querySelector('meta[property="og:image"]');
      if (!ogImgTag) {
        ogImgTag = document.createElement('meta');
        ogImgTag.setAttribute('property', 'og:image');
        document.head.appendChild(ogImgTag);
      }
      ogImgTag.setAttribute('content', ogImage);
    }
  }, [title, description, ogImage]);
}
