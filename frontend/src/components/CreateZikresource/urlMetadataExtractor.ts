export type ZikresourceType = 'tablature' | 'video' | 'backing-track' | 'other';

export interface UrlMetadata {
  artist?: string;
  title?: string;
  type?: ZikresourceType;
}

// ── Utility helpers ─────────────────────────────────────────

/** Capitalize each word from a hyphen-separated slug: "red-hot-chili" → "Red Hot Chili" */
const capitalizeHyphenSlug = (slug: string): string =>
  slug
    .split(/-+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

/** Capitalize each word from an underscore-separated slug: "artist_name" → "Artist Name" */
const capitalizeUnderscoreSlug = (slug: string): string =>
  slug
    .split(/_+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

/** Capitalize the first letter only (for concatenated slugs like "blackkeys") */
const capitalizeFirst = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

/**
 * Split a merged artist+title slug roughly at the midpoint.
 * Example: "red-hot-chili-peppers-under-the-bridge" → { artist: "red-hot-chili-peppers", title: "under-the-bridge" }
 */
const splitAtMidpoint = (slug: string, separator = '-'): { artist: string; title: string } => {
  const words = slug.split(separator).filter(Boolean);
  if (words.length <= 1) return { artist: '', title: slug };
  const mid = Math.ceil(words.length / 2);
  return {
    artist: words.slice(0, mid).join(separator),
    title: words.slice(mid).join(separator),
  };
};

// ── Site-specific parsers ───────────────────────────────────

/** Ultimate Guitar — /tab/artist-name/song-title-tabs-1234 */
const parseUltimateGuitar = (segments: string[]): UrlMetadata => {
  const tabIdx = segments.indexOf('tab');
  if (tabIdx === -1 || segments.length <= tabIdx + 2) return { type: 'tablature' };

  const artistSlug = segments[tabIdx + 1];
  const titleSlug = segments[tabIdx + 2]
    .replace(/-(tabs|chords|guitar-pro|bass-tabs|ukulele-chords|power-tabs|drum-tabs|official)-\d+$/, '')
    .replace(/-\d+$/, '');

  return {
    artist: capitalizeHyphenSlug(artistSlug),
    title: capitalizeHyphenSlug(titleSlug),
    type: 'tablature',
  };
};

/** Songsterr — /a/wsa/artist-name-song-title-tab-s123 */
const parseSongsterr = (segments: string[]): UrlMetadata => {
  const slug = segments.find((s) => /-tabs?-/.test(s));
  if (!slug) return { type: 'tablature' };

  const artistAndTitle = slug.split(/-tabs?-/)[0];
  const { artist, title } = splitAtMidpoint(artistAndTitle);

  return {
    artist: artist ? capitalizeHyphenSlug(artist) : undefined,
    title: title ? capitalizeHyphenSlug(title) : undefined,
    type: 'tablature',
  };
};

/** Genius — /Artist-name-song-title-lyrics */
const parseGenius = (segments: string[]): UrlMetadata => {
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment || !lastSegment.endsWith('-lyrics')) return {};

  const withoutSuffix = lastSegment.replace(/-lyrics$/i, '');
  const { artist, title } = splitAtMidpoint(withoutSuffix);

  return {
    artist: artist ? capitalizeHyphenSlug(artist) : undefined,
    title: title ? capitalizeHyphenSlug(title) : undefined,
  };
};

/** AZLyrics — /lyrics/artistname/songtitle.html */
const parseAZLyrics = (segments: string[]): UrlMetadata => {
  const lyricsIdx = segments.indexOf('lyrics');
  if (lyricsIdx === -1 || segments.length <= lyricsIdx + 2) return {};

  const artistSlug = segments[lyricsIdx + 1];
  const titleSlug = segments[lyricsIdx + 2].replace(/\.html?$/, '');

  return {
    artist: capitalizeFirst(artistSlug),
    title: capitalizeFirst(titleSlug),
  };
};

/** 911Tabs — /tabs/a/artist_name/song_title_tab.htm */
const parse911Tabs = (segments: string[]): UrlMetadata => {
  const tabsIdx = segments.indexOf('tabs');
  if (tabsIdx === -1 || segments.length <= tabsIdx + 3) return { type: 'tablature' };

  const artistSlug = segments[tabsIdx + 2]; // skip the initial-letter segment
  const titleSlug = segments[tabsIdx + 3]
    .replace(/\.html?$/, '')
    .replace(/_tabs?$/, '')
    .replace(/_chords?$/, '');

  return {
    artist: capitalizeUnderscoreSlug(artistSlug),
    title: capitalizeUnderscoreSlug(titleSlug),
    type: 'tablature',
  };
};

/** IMSLP — /wiki/Work_Title_(Composer_Name) */
const parseIMSLP = (segments: string[]): UrlMetadata => {
  const wikiIdx = segments.indexOf('wiki');
  if (wikiIdx === -1 || segments.length <= wikiIdx + 1) return { type: 'tablature' };

  const pageSlug = decodeURIComponent(segments[wikiIdx + 1]);
  const composerMatch = pageSlug.match(/\(([^)]+)\)$/);

  const title = pageSlug
    .replace(/\([^)]+\)$/, '')
    .replace(/_/g, ' ')
    .replace(/,\s*$/, '')
    .trim();

  const artist = composerMatch ? composerMatch[1].replace(/_/g, ' ') : '';

  return {
    artist: artist || undefined,
    title: title || undefined,
    type: 'tablature',
  };
};

/** GProTab — /tabs/artist-name/song-title */
const parseGProTab = (segments: string[]): UrlMetadata => {
  const tabsIdx = segments.indexOf('tabs');
  if (tabsIdx === -1 || segments.length <= tabsIdx + 2) return { type: 'tablature' };

  return {
    artist: capitalizeHyphenSlug(segments[tabsIdx + 1]),
    title: capitalizeHyphenSlug(segments[tabsIdx + 2]),
    type: 'tablature',
  };
};

/** mySongBook — /tab/123-song-title (artist may not be in URL) */
const parseMySongBook = (segments: string[]): UrlMetadata => {
  const tabIdx = segments.indexOf('tab');
  if (tabIdx === -1 || segments.length <= tabIdx + 1) return { type: 'tablature' };

  const slug = segments[tabIdx + 1].replace(/^\d+-/, '');
  return {
    title: capitalizeHyphenSlug(slug),
    type: 'tablature',
  };
};

/** MuseScore — /sheetmusic/artist/title (extractable) or /user/id/scores/id (not extractable) */
const parseMuseScore = (segments: string[]): UrlMetadata => {
  const sheetMusicIdx = segments.indexOf('sheetmusic');
  if (sheetMusicIdx !== -1 && segments.length > sheetMusicIdx + 2) {
    return {
      artist: capitalizeHyphenSlug(segments[sheetMusicIdx + 1]),
      title: capitalizeHyphenSlug(segments[sheetMusicIdx + 2]),
      type: 'tablature',
    };
  }
  return { type: 'tablature' };
};

// ── Fallback ────────────────────────────────────────────────

/** Generic fallback: split the last path segment at the midpoint */
const parseFallback = (segments: string[]): UrlMetadata => {
  if (segments.length === 0) return {};

  const last = segments[segments.length - 1].replace(/\.[^/.]+$/, '');
  if (last.includes('-')) {
    const { artist, title } = splitAtMidpoint(last);
    return {
      artist: artist ? capitalizeHyphenSlug(artist) : undefined,
      title: title ? capitalizeHyphenSlug(title) : undefined,
    };
  }
  return { title: capitalizeFirst(last) };
};

// ── Site matcher registry ───────────────────────────────────

type SiteParser = (segments: string[]) => UrlMetadata;

const SITE_MATCHERS: ReadonlyArray<{ test: (host: string) => boolean; parse: SiteParser }> = [
  { test: (h) => h.includes('ultimate-guitar.com'), parse: parseUltimateGuitar },
  { test: (h) => h.includes('songsterr.com'), parse: parseSongsterr },
  { test: (h) => h.includes('genius.com'), parse: parseGenius },
  { test: (h) => h.includes('azlyrics.com'), parse: parseAZLyrics },
  { test: (h) => h.includes('911tabs.com'), parse: parse911Tabs },
  { test: (h) => h.includes('imslp.org'), parse: parseIMSLP },
  { test: (h) => h.includes('gprotab.com'), parse: parseGProTab },
  { test: (h) => h.includes('mysongbook.com'), parse: parseMySongBook },
  { test: (h) => h.includes('musescore.com'), parse: parseMuseScore },
  { test: (h) => h.includes('musicnotes.com'), parse: () => ({ type: 'tablature' as const }) },
  { test: (h) => h.includes('sheetmusicdirect.com'), parse: () => ({ type: 'tablature' as const }) },
  { test: (h) => h.includes('youtube.com') || h.includes('youtu.be') || h.includes('vimeo.com'), parse: () => ({ type: 'video' as const }) },
];

// ── Main entry point ────────────────────────────────────────

export function extractMetadataFromUrl(urlStr: string): UrlMetadata {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return {};

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      parsedUrl = new URL(`https://${trimmed}`);
    }

    const host = parsedUrl.hostname.toLowerCase();
    const segments = parsedUrl.pathname.split('/').filter(Boolean);

    const matcher = SITE_MATCHERS.find((m) => m.test(host));
    if (matcher) return matcher.parse(segments);

    return parseFallback(segments);
  } catch {
    return {};
  }
}
