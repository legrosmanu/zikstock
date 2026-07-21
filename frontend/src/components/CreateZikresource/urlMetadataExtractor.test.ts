import { describe, it } from 'node:test';
import assert from 'node:assert';
import { extractMetadataFromUrl } from './urlMetadataExtractor.ts';

describe('extractMetadataFromUrl', () => {
  // ── Songsterr ──────────────────────────────────────────

  it('should parse Songsterr URLs correctly', () => {
    const result = extractMetadataFromUrl(
      'https://www.songsterr.com/a/wsa/red-hot-chili-peppers-under-the-bridge-tab-s99',
    );
    assert.strictEqual(result.artist, 'Red Hot Chili Peppers');
    assert.strictEqual(result.title, 'Under The Bridge');
    assert.strictEqual(result.type, 'tablature');
  });

  // ── Ultimate Guitar ────────────────────────────────────

  it('should parse Ultimate Guitar tabs URLs', () => {
    const result = extractMetadataFromUrl(
      'https://tabs.ultimate-guitar.com/tab/the-black-keys/things-aint-like-they-used-to-be-tabs-1019951',
    );
    assert.strictEqual(result.artist, 'The Black Keys');
    assert.strictEqual(result.title, 'Things Aint Like They Used To Be');
    assert.strictEqual(result.type, 'tablature');
  });

  it('should parse Ultimate Guitar chords URLs', () => {
    const result = extractMetadataFromUrl(
      'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596',
    );
    assert.strictEqual(result.artist, 'Oasis');
    assert.strictEqual(result.title, 'Wonderwall');
    assert.strictEqual(result.type, 'tablature');
  });

  it('should parse Ultimate Guitar with fr subdomain', () => {
    const result = extractMetadataFromUrl(
      'https://fr.ultimate-guitar.com/tab/the-black-keys/things-aint-like-they-used-to-be-tabs-1019951',
    );
    assert.strictEqual(result.artist, 'The Black Keys');
    assert.strictEqual(result.title, 'Things Aint Like They Used To Be');
    assert.strictEqual(result.type, 'tablature');
  });

  // ── Genius ─────────────────────────────────────────────

  it('should parse Genius lyrics URLs', () => {
    const result = extractMetadataFromUrl(
      'https://genius.com/Red-hot-chili-peppers-under-the-bridge-lyrics',
    );
    assert.strictEqual(result.artist, 'Red Hot Chili Peppers');
    assert.strictEqual(result.title, 'Under The Bridge');
  });

  it('should not extract from Genius non-lyrics URLs', () => {
    const result = extractMetadataFromUrl('https://genius.com/artists/Red-hot-chili-peppers');
    assert.strictEqual(result.artist, undefined);
    assert.strictEqual(result.title, undefined);
  });

  // ── AZLyrics ───────────────────────────────────────────

  it('should parse AZLyrics URLs (concatenated slugs)', () => {
    const result = extractMetadataFromUrl(
      'https://www.azlyrics.com/lyrics/blackkeys/thingsaintliketheyusedtobe.html',
    );
    assert.strictEqual(result.artist, 'Blackkeys');
    assert.strictEqual(result.title, 'Thingsaintliketheyusedtobe');
  });

  // ── 911Tabs ────────────────────────────────────────────

  it('should parse 911Tabs URLs with underscores', () => {
    const result = extractMetadataFromUrl(
      'https://www.911tabs.com/tabs/a/ac_dc/back_in_black_tab.htm',
    );
    assert.strictEqual(result.artist, 'Ac Dc');
    assert.strictEqual(result.title, 'Back In Black');
    assert.strictEqual(result.type, 'tablature');
  });

  // ── IMSLP ──────────────────────────────────────────────

  it('should parse IMSLP URLs with composer in parentheses', () => {
    const result = extractMetadataFromUrl(
      'https://imslp.org/wiki/Clair_de_lune_(Debussy,_Claude)',
    );
    assert.strictEqual(result.artist, 'Debussy, Claude');
    assert.strictEqual(result.title, 'Clair de lune');
    assert.strictEqual(result.type, 'tablature');
  });

  // ── GProTab ────────────────────────────────────────────

  it('should parse GProTab URLs', () => {
    const result = extractMetadataFromUrl(
      'https://www.gprotab.com/tabs/metallica/master-of-puppets',
    );
    assert.strictEqual(result.artist, 'Metallica');
    assert.strictEqual(result.title, 'Master Of Puppets');
    assert.strictEqual(result.type, 'tablature');
  });

  // ── mySongBook ─────────────────────────────────────────

  it('should parse mySongBook URLs (title only, no artist in URL)', () => {
    const result = extractMetadataFromUrl(
      'https://www.mysongbook.com/tab/12345-hotel-california',
    );
    assert.strictEqual(result.artist, undefined);
    assert.strictEqual(result.title, 'Hotel California');
    assert.strictEqual(result.type, 'tablature');
  });

  // ── MuseScore ──────────────────────────────────────────

  it('should parse MuseScore /sheetmusic/ URLs', () => {
    const result = extractMetadataFromUrl('https://musescore.com/sheetmusic/radiohead/creep');
    assert.strictEqual(result.artist, 'Radiohead');
    assert.strictEqual(result.title, 'Creep');
    assert.strictEqual(result.type, 'tablature');
  });

  it('should detect MuseScore /user/scores/ URLs (type only)', () => {
    const result = extractMetadataFromUrl('https://musescore.com/user/12345/scores/67890');
    assert.strictEqual(result.artist, undefined);
    assert.strictEqual(result.title, undefined);
    assert.strictEqual(result.type, 'tablature');
  });

  // ── Metadata-only sites ────────────────────────────────

  it('should detect Musicnotes as tablature', () => {
    const result = extractMetadataFromUrl(
      'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0123456',
    );
    assert.strictEqual(result.type, 'tablature');
  });

  it('should detect Sheet Music Direct as tablature', () => {
    const result = extractMetadataFromUrl(
      'https://www.sheetmusicdirect.com/se/ID_No/product.aspx',
    );
    assert.strictEqual(result.type, 'tablature');
  });

  // ── Video platforms ────────────────────────────────────

  it('should identify YouTube videos', () => {
    const result = extractMetadataFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.strictEqual(result.type, 'video');
  });

  it('should identify Vimeo videos', () => {
    const result = extractMetadataFromUrl('https://vimeo.com/123456');
    assert.strictEqual(result.type, 'video');
  });

  // ── Fallback & edge cases ──────────────────────────────

  it('should fallback gracefully for unknown URLs with hyphens', () => {
    const result = extractMetadataFromUrl('https://example.com/led-zeppelin-stairway-to-heaven');
    assert.strictEqual(result.artist, 'Led Zeppelin Stairway');
    assert.strictEqual(result.title, 'To Heaven');
  });

  it('should return empty for empty string', () => {
    const result = extractMetadataFromUrl('');
    assert.deepStrictEqual(result, {});
  });

  it('should return empty for invalid URL', () => {
    const result = extractMetadataFromUrl('not a url at all');
    assert.ok(result);
  });
});
