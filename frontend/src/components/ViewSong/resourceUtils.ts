export const getDomainName = (urlStr: string): string => {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
};

export const getEmbedUrl = (urlStr: string): string | null => {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId = '';
      if (hostname.includes('youtu.be')) {
        videoId = url.pathname.slice(1);
      } else if (url.pathname.startsWith('/watch')) {
        videoId = url.searchParams.get('v') || '';
      } else if (url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.replace('/shorts/', '');
      } else if (url.pathname.startsWith('/embed/')) {
        return urlStr;
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (hostname.includes('spotify.com')) {
      if (url.pathname.startsWith('/embed/')) {
        return urlStr;
      }
      return `https://open.spotify.com/embed${url.pathname}`;
    }

    if (hostname.includes('vimeo.com')) {
      const match = url.pathname.match(/\/(\d+)/);
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }

    if (hostname.includes('drive.google.com') && url.pathname.includes('/file/d/')) {
      return urlStr.replace(/\/view.*$/, '/preview');
    }

    if (hostname.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(urlStr)}`;
    }

    return null;
  } catch {
    return null;
  }
};

export const isMediaEmbeddable = (urlStr: string): boolean => {
  return getEmbedUrl(urlStr) !== null;
};
