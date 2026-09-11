import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDomainName, getEmbedUrl, isMediaEmbeddable } from './resourceUtils.ts';

describe('resourceUtils', () => {
  describe('getDomainName', () => {
    it('should extract clean domain name without www.', () => {
      assert.equal(getDomainName('https://www.youtube.com/watch?v=123'), 'youtube.com');
      assert.equal(getDomainName('https://songsterr.com/a/wsa/nirvana-tab'), 'songsterr.com');
      assert.equal(getDomainName('https://tabs.ultimate-guitar.com/tab/123'), 'tabs.ultimate-guitar.com');
    });

    it('should return original string for invalid URLs', () => {
      assert.equal(getDomainName('not-a-url'), 'not-a-url');
    });
  });

  describe('getEmbedUrl', () => {
    it('should convert YouTube watch URLs to embed URLs', () => {
      assert.equal(
        getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      );
    });

    it('should convert YouTube short youtu.be URLs to embed URLs', () => {
      assert.equal(
        getEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      );
    });

    it('should convert YouTube shorts URLs to embed URLs', () => {
      assert.equal(
        getEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      );
    });

    it('should convert Spotify track URLs to embed URLs', () => {
      assert.equal(
        getEmbedUrl('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'),
        'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT'
      );
    });

    it('should convert Vimeo URLs to embed URLs', () => {
      assert.equal(
        getEmbedUrl('https://vimeo.com/76979871'),
        'https://player.vimeo.com/video/76979871'
      );
    });

    it('should convert SoundCloud URLs to widget player URLs', () => {
      const url = 'https://soundcloud.com/artist/track';
      assert.equal(
        getEmbedUrl(url),
        `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`
      );
    });

    it('should return null for non-embeddable URLs', () => {
      assert.equal(getEmbedUrl('https://www.songsterr.com/a/wsa/tab-s123'), null);
      assert.equal(getEmbedUrl('https://tabs.ultimate-guitar.com/tab/123'), null);
    });
  });

  describe('isMediaEmbeddable', () => {
    it('should return true for embeddable media URLs', () => {
      assert.equal(isMediaEmbeddable('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
      assert.equal(isMediaEmbeddable('https://open.spotify.com/track/123'), true);
    });

    it('should return false for sheet music or arbitrary web pages', () => {
      assert.equal(isMediaEmbeddable('https://www.songsterr.com/a/wsa/tab-s123'), false);
      assert.equal(isMediaEmbeddable('https://genius.com/lyrics'), false);
    });
  });
});
