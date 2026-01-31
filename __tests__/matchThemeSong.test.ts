/**
 * Unit tests for the matchThemeSong algorithm
 */

import { describe, it, expect } from 'vitest';
import {
  matchThemeSong,
  jaccardSimilarity,
  cosineSimilarity,
  deriveVibeVector,
  getOverlappingTags,
  calculatePenalties,
} from '../src/lib/matchThemeSong';
import { Book, Song, VibeVector } from '../src/lib/types';

// Test fixtures
const testBook: Book = {
  id: 'test-book',
  title: 'Test Book',
  author: 'Test Author',
  coverImageUrl: '/test.jpg',
  vibeTags: ['melancholic', 'nostalgic', 'intimate', 'tender'],
  vibeVector: {
    melancholy: 0.8,
    intimacy: 0.7,
    intensity: 0.4,
    hope: 0.3,
    tension: 0.4,
    warmth: 0.5,
    nostalgia: 0.9,
    eeriness: 0.2,
    pace: 0.3,
  },
  vibeBlurb: 'A melancholic and nostalgic test book.',
};

const testSongs: Song[] = [
  {
    id: 'perfect-match',
    title: 'Perfect Match Song',
    artist: 'Test Artist 1',
    spotifyUrl: 'https://spotify.com/test1',
    previewUrl: null,
    vibeTags: ['melancholic', 'nostalgic', 'intimate', 'folk'],
    audio: {
      energy: 0.25,    // Low energy -> high melancholy
      valence: 0.2,    // Low valence -> high melancholy
      tempo: 0.3,      // Slow tempo
      acousticness: 0.9, // Acoustic
      danceability: 0.25,
    },
    moodBlurb: 'A perfect matching song.',
  },
  {
    id: 'poor-match',
    title: 'Poor Match Song',
    artist: 'Test Artist 2',
    spotifyUrl: 'https://spotify.com/test2',
    previewUrl: null,
    vibeTags: ['upbeat', 'energetic', 'dance', 'party'],
    audio: {
      energy: 0.9,     // High energy
      valence: 0.85,   // Very positive
      tempo: 0.85,     // Fast tempo
      acousticness: 0.1, // Electronic
      danceability: 0.9,
    },
    moodBlurb: 'An upbeat party song.',
  },
  {
    id: 'moderate-match',
    title: 'Moderate Match Song',
    artist: 'Test Artist 3',
    spotifyUrl: 'https://spotify.com/test3',
    previewUrl: null,
    vibeTags: ['atmospheric', 'melancholic', 'dreamy'],
    audio: {
      energy: 0.4,
      valence: 0.35,
      tempo: 0.4,
      acousticness: 0.5,
      danceability: 0.4,
    },
    moodBlurb: 'A moderately matching atmospheric song.',
  },
];

describe('jaccardSimilarity', () => {
  it('returns 1 for identical tag sets', () => {
    const tags = ['a', 'b', 'c'];
    expect(jaccardSimilarity(tags, tags)).toBe(1);
  });

  it('returns 0 for completely different tag sets', () => {
    const tags1 = ['a', 'b', 'c'];
    const tags2 = ['d', 'e', 'f'];
    expect(jaccardSimilarity(tags1, tags2)).toBe(0);
  });

  it('returns 0.5 for half-overlapping tags', () => {
    const tags1 = ['a', 'b'];
    const tags2 = ['b', 'c'];
    // intersection: {b}, union: {a, b, c}
    // 1/3 ≈ 0.333
    expect(jaccardSimilarity(tags1, tags2)).toBeCloseTo(0.333, 2);
  });

  it('handles case-insensitivity', () => {
    const tags1 = ['Melancholic', 'Nostalgic'];
    const tags2 = ['melancholic', 'nostalgic'];
    expect(jaccardSimilarity(tags1, tags2)).toBe(1);
  });

  it('handles empty arrays', () => {
    expect(jaccardSimilarity([], [])).toBe(0);
    expect(jaccardSimilarity(['a'], [])).toBe(0);
  });
});

describe('getOverlappingTags', () => {
  it('returns overlapping tags', () => {
    const tags1 = ['a', 'b', 'c'];
    const tags2 = ['b', 'c', 'd'];
    const result = getOverlappingTags(tags1, tags2);
    expect(result).toContain('b');
    expect(result).toContain('c');
    expect(result.length).toBe(2);
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const vec: VibeVector = {
      melancholy: 0.5,
      intimacy: 0.5,
      intensity: 0.5,
      hope: 0.5,
      tension: 0.5,
      warmth: 0.5,
      nostalgia: 0.5,
      eeriness: 0.5,
      pace: 0.5,
    };
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 5);
  });

  it('returns lower similarity for different vectors', () => {
    const vec1: VibeVector = {
      melancholy: 1, intimacy: 1, intensity: 0, hope: 0,
      tension: 0, warmth: 1, nostalgia: 1, eeriness: 0, pace: 0,
    };
    const vec2: VibeVector = {
      melancholy: 0, intimacy: 0, intensity: 1, hope: 1,
      tension: 1, warmth: 0, nostalgia: 0, eeriness: 1, pace: 1,
    };
    const similarity = cosineSimilarity(vec1, vec2);
    expect(similarity).toBeLessThan(0.5);
  });
});

describe('deriveVibeVector', () => {
  it('derives high melancholy from low valence', () => {
    const audio = {
      energy: 0.5,
      valence: 0.1,
      tempo: 0.5,
      acousticness: 0.5,
      danceability: 0.5,
    };
    const derived = deriveVibeVector(audio);
    expect(derived.melancholy).toBeCloseTo(0.9, 1);
  });

  it('derives high intensity from high energy', () => {
    const audio = {
      energy: 0.9,
      valence: 0.5,
      tempo: 0.5,
      acousticness: 0.5,
      danceability: 0.5,
    };
    const derived = deriveVibeVector(audio);
    expect(derived.intensity).toBeCloseTo(0.9, 1);
  });

  it('derives high nostalgia from slow, acoustic, soft songs', () => {
    const audio = {
      energy: 0.1,
      valence: 0.3,
      tempo: 0.2,
      acousticness: 0.9,
      danceability: 0.2,
    };
    const derived = deriveVibeVector(audio);
    // nostalgia = acousticness * 0.4 + (1 - tempo) * 0.3 + (1 - energy) * 0.3
    // = 0.9 * 0.4 + 0.8 * 0.3 + 0.9 * 0.3 = 0.36 + 0.24 + 0.27 = 0.87
    expect(derived.nostalgia).toBeGreaterThan(0.8);
  });
});

describe('calculatePenalties', () => {
  it('applies melancholy+happy penalty', () => {
    const melancholicBook: Book = {
      ...testBook,
      vibeVector: { ...testBook.vibeVector, melancholy: 0.85 },
    };
    const happySongVec = deriveVibeVector({
      energy: 0.5,
      valence: 0.8, // High valence = happy
      tempo: 0.5,
      acousticness: 0.5,
      danceability: 0.5,
    });
    const result = calculatePenalties(melancholicBook, happySongVec, {
      energy: 0.5,
      valence: 0.8,
      tempo: 0.5,
      acousticness: 0.5,
      danceability: 0.5,
    });
    expect(result.total).toBeLessThan(0);
    expect(result.factors.some(f => f.factor.includes('upbeat'))).toBe(true);
  });

  it('applies no penalty for matching vibes', () => {
    const result = calculatePenalties(testBook, deriveVibeVector(testSongs[0].audio), testSongs[0].audio);
    expect(result.total).toBe(0);
  });
});

describe('matchThemeSong', () => {
  it('returns the best matching song', () => {
    const result = matchThemeSong(testBook, testSongs);

    // Should match the perfect-match song
    expect(result.song.id).toBe('perfect-match');
    expect(result.totalScore).toBeGreaterThan(0);
  });

  it('returns scoring details', () => {
    const result = matchThemeSong(testBook, testSongs);

    expect(result).toHaveProperty('tagScore');
    expect(result).toHaveProperty('vectorScore');
    expect(result).toHaveProperty('penaltyScore');
    expect(result).toHaveProperty('topFactors');
    expect(result.topFactors.length).toBeGreaterThan(0);
  });

  it('ranks perfect match higher than poor match', () => {
    const perfectResult = matchThemeSong(testBook, [testSongs[0]]);
    const poorResult = matchThemeSong(testBook, [testSongs[1]]);

    expect(perfectResult.totalScore).toBeGreaterThan(poorResult.totalScore);
  });

  it('throws error when no songs available', () => {
    expect(() => matchThemeSong(testBook, [])).toThrow('No songs available');
  });

  it('includes explainability factors', () => {
    const result = matchThemeSong(testBook, testSongs);

    // Should have factors explaining the match
    expect(result.topFactors.length).toBeLessThanOrEqual(3);
    result.topFactors.forEach(factor => {
      expect(factor).toHaveProperty('factor');
      expect(factor).toHaveProperty('contribution');
      expect(factor).toHaveProperty('type');
      expect(['positive', 'negative', 'neutral']).toContain(factor.type);
    });
  });
});

describe('integration: real data matching', () => {
  it('should work with a melancholic book and find a suitable song', () => {
    const melancholicBook: Book = {
      id: 'norwegian-wood',
      title: 'Norwegian Wood',
      author: 'Haruki Murakami',
      coverImageUrl: '/test.jpg',
      vibeTags: ['melancholic', 'dreamy', 'nostalgic', 'quiet', 'Japanese', 'introspective', 'bittersweet'],
      vibeVector: {
        melancholy: 0.9,
        intimacy: 0.7,
        intensity: 0.35,
        hope: 0.3,
        tension: 0.4,
        warmth: 0.45,
        nostalgia: 0.95,
        eeriness: 0.35,
        pace: 0.3,
      },
      vibeBlurb: 'A melancholic Japanese novel.',
    };

    const result = matchThemeSong(melancholicBook, testSongs);

    // Should prefer the melancholic song over the upbeat one
    expect(result.song.id).not.toBe('poor-match');
    expect(result.totalScore).toBeGreaterThan(0.2);
  });
});
