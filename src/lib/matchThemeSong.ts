/**
 * Theme Song Matching Algorithm
 *
 * This module matches books to songs based on "vibe" - the emotional and aesthetic
 * feeling of both, rather than plot or literal content.
 *
 * SCORING BREAKDOWN:
 * - Tag Score (55%): Jaccard similarity between book.vibeTags and song.vibeTags
 * - Vector Score (35%): Cosine similarity between book.vibeVector and derived song vector
 * - Penalties (up to -15%): Reduce score for vibe mismatches
 */

import { Book, Song, VibeVector, ScoringFactor, MatchResult, AudioFeatures } from './types';

// Weights for scoring components
const TAG_WEIGHT = 0.55;
const VECTOR_WEIGHT = 0.35;

/**
 * Derives a vibe vector from song audio features.
 *
 * MAPPING RATIONALE:
 * - melancholy = 1 - valence: Low valence = sad/melancholic
 * - intimacy = acousticness * 0.6 + (1 - energy) * 0.4: Acoustic + quiet = intimate
 * - intensity = energy: High energy = high intensity
 * - hope = valence * 0.7 + energy * 0.3: Positive + energetic = hopeful
 * - tension = energy * 0.5 + (1 - valence) * 0.5: High energy + negative valence = tense
 * - warmth = acousticness * 0.5 + valence * 0.3 + (1 - energy) * 0.2: Acoustic + positive + gentle
 * - nostalgia = acousticness * 0.4 + (1 - tempo) * 0.3 + (1 - energy) * 0.3: Slow, acoustic, soft
 * - eeriness = (1 - valence) * 0.5 + (1 - danceability) * 0.3 + (1 - warmth) * 0.2: Dark + strange
 * - pace = tempo * 0.6 + energy * 0.4: Fast tempo + high energy = fast pace
 */
export function deriveVibeVector(audio: AudioFeatures): VibeVector {
  const { energy, valence, tempo, acousticness, danceability } = audio;

  // Calculate intermediate warmth for eeriness calculation
  const warmthCalc = acousticness * 0.5 + valence * 0.3 + (1 - energy) * 0.2;

  return {
    melancholy: 1 - valence,
    intimacy: acousticness * 0.6 + (1 - energy) * 0.4,
    intensity: energy,
    hope: valence * 0.7 + energy * 0.3,
    tension: energy * 0.5 + (1 - valence) * 0.5,
    warmth: warmthCalc,
    nostalgia: acousticness * 0.4 + (1 - tempo) * 0.3 + (1 - energy) * 0.3,
    eeriness: (1 - valence) * 0.5 + (1 - danceability) * 0.3 + (1 - warmthCalc) * 0.2,
    pace: tempo * 0.6 + energy * 0.4,
  };
}

/**
 * Calculates Jaccard similarity between two sets of tags.
 * Jaccard = |A ∩ B| / |A ∪ B|
 * Returns 0-1 where 1 means identical tag sets.
 */
export function jaccardSimilarity(tags1: string[], tags2: string[]): number {
  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Gets the tags that overlap between two tag arrays.
 */
export function getOverlappingTags(tags1: string[], tags2: string[]): string[] {
  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));
  return [...set1].filter(x => set2.has(x));
}

/**
 * Calculates cosine similarity between two vibe vectors.
 * Cosine similarity = (A · B) / (||A|| * ||B||)
 * Returns 0-1 where 1 means identical direction.
 */
export function cosineSimilarity(vec1: VibeVector, vec2: VibeVector): number {
  const keys: (keyof VibeVector)[] = [
    'melancholy', 'intimacy', 'intensity', 'hope', 'tension',
    'warmth', 'nostalgia', 'eeriness', 'pace'
  ];

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const key of keys) {
    dotProduct += vec1[key] * vec2[key];
    magnitude1 += vec1[key] ** 2;
    magnitude2 += vec2[key] ** 2;
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Gets the top N dimensions where two vectors are most similar.
 */
export function getTopMatchingDimensions(
  bookVec: VibeVector,
  songVec: VibeVector,
  n: number = 3
): { dimension: string; bookValue: number; songValue: number; similarity: number }[] {
  const keys: (keyof VibeVector)[] = [
    'melancholy', 'intimacy', 'intensity', 'hope', 'tension',
    'warmth', 'nostalgia', 'eeriness', 'pace'
  ];

  const similarities = keys.map(key => ({
    dimension: key,
    bookValue: bookVec[key],
    songValue: songVec[key],
    // Similarity is inverse of absolute difference
    similarity: 1 - Math.abs(bookVec[key] - songVec[key])
  }));

  // Sort by similarity descending
  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, n);
}

/**
 * Calculates penalties for vibe mismatches.
 *
 * PENALTY RULES:
 * - Melancholic book + happy song: -0.10
 * - Tense book + low-energy song: -0.05
 * - Eerie book + warm song: -0.08
 * - Hopeful book + very sad song: -0.07
 * - Intense book + mellow song: -0.05
 */
export function calculatePenalties(
  book: Book,
  songVec: VibeVector,
  audio: AudioFeatures
): { total: number; factors: ScoringFactor[] } {
  const factors: ScoringFactor[] = [];
  let total = 0;

  // Melancholic book + happy song
  if (book.vibeVector.melancholy > 0.7 && audio.valence > 0.7) {
    const penalty = -0.10;
    total += penalty;
    factors.push({
      factor: 'Song too upbeat for melancholic book',
      contribution: penalty,
      type: 'negative'
    });
  }

  // Tense book + low-energy song
  if (book.vibeVector.tension > 0.7 && audio.energy < 0.3) {
    const penalty = -0.05;
    total += penalty;
    factors.push({
      factor: 'Song too mellow for high-tension book',
      contribution: penalty,
      type: 'negative'
    });
  }

  // Eerie book + warm song
  if (book.vibeVector.eeriness > 0.7 && songVec.warmth > 0.7) {
    const penalty = -0.08;
    total += penalty;
    factors.push({
      factor: 'Song too warm for eerie book',
      contribution: penalty,
      type: 'negative'
    });
  }

  // Hopeful book + very sad song
  if (book.vibeVector.hope > 0.7 && audio.valence < 0.2) {
    const penalty = -0.07;
    total += penalty;
    factors.push({
      factor: 'Song too sad for hopeful book',
      contribution: penalty,
      type: 'negative'
    });
  }

  // Intense book + mellow song
  if (book.vibeVector.intensity > 0.8 && audio.energy < 0.25) {
    const penalty = -0.05;
    total += penalty;
    factors.push({
      factor: 'Song too mellow for intense book',
      contribution: penalty,
      type: 'negative'
    });
  }

  return { total, factors };
}

/**
 * Generates human-readable scoring factors for explainability.
 */
function generateScoringFactors(
  book: Book,
  song: Song,
  songVec: VibeVector,
  tagScore: number,
  vectorScore: number,
  penaltyFactors: ScoringFactor[]
): ScoringFactor[] {
  const factors: ScoringFactor[] = [];

  // Tag overlap factor
  const overlappingTags = getOverlappingTags(book.vibeTags, song.vibeTags);
  if (overlappingTags.length > 0) {
    factors.push({
      factor: `Shared vibes: ${overlappingTags.slice(0, 3).join(', ')}`,
      contribution: tagScore * TAG_WEIGHT,
      type: 'positive'
    });
  }

  // Top matching dimensions
  const topDimensions = getTopMatchingDimensions(book.vibeVector, songVec, 2);
  for (const dim of topDimensions) {
    if (dim.similarity > 0.8) {
      const dimLabel = dim.dimension.charAt(0).toUpperCase() + dim.dimension.slice(1);
      factors.push({
        factor: `Strong ${dimLabel.toLowerCase()} alignment`,
        contribution: vectorScore * VECTOR_WEIGHT * 0.3,
        type: 'positive'
      });
    }
  }

  // Add penalty factors
  factors.push(...penaltyFactors);

  // Sort by contribution magnitude descending
  return factors
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 3);
}

/**
 * Main matching function: finds the best theme song for a book.
 *
 * @param book - The book to match
 * @param songs - All available songs
 * @returns The best matching song with scoring details
 */
export function matchThemeSong(book: Book, songs: Song[]): MatchResult {
  let bestMatch: MatchResult | null = null;

  for (const song of songs) {
    // Derive vibe vector from audio features
    const songVibeVector = deriveVibeVector(song.audio);

    // Calculate tag score (Jaccard similarity)
    const tagScore = jaccardSimilarity(book.vibeTags, song.vibeTags);

    // Calculate vector score (cosine similarity)
    const vectorScore = cosineSimilarity(book.vibeVector, songVibeVector);

    // Calculate penalties
    const penalties = calculatePenalties(book, songVibeVector, song.audio);

    // Combine scores
    const totalScore =
      (tagScore * TAG_WEIGHT) +
      (vectorScore * VECTOR_WEIGHT) +
      penalties.total;

    // Generate scoring factors for explainability
    const topFactors = generateScoringFactors(
      book,
      song,
      songVibeVector,
      tagScore,
      vectorScore,
      penalties.factors
    );

    const result: MatchResult = {
      song,
      totalScore,
      tagScore,
      vectorScore,
      penaltyScore: penalties.total,
      topFactors
    };

    // Keep the best match
    if (!bestMatch || totalScore > bestMatch.totalScore) {
      bestMatch = result;
    }
  }

  if (!bestMatch) {
    throw new Error('No songs available for matching');
  }

  return bestMatch;
}

/**
 * Gets the top N matches for a book (useful for debugging/alternatives).
 */
export function getTopMatches(book: Book, songs: Song[], n: number = 5): MatchResult[] {
  const results: MatchResult[] = [];

  for (const song of songs) {
    const songVibeVector = deriveVibeVector(song.audio);
    const tagScore = jaccardSimilarity(book.vibeTags, song.vibeTags);
    const vectorScore = cosineSimilarity(book.vibeVector, songVibeVector);
    const penalties = calculatePenalties(book, songVibeVector, song.audio);

    const totalScore =
      (tagScore * TAG_WEIGHT) +
      (vectorScore * VECTOR_WEIGHT) +
      penalties.total;

    const topFactors = generateScoringFactors(
      book,
      song,
      songVibeVector,
      tagScore,
      vectorScore,
      penalties.factors
    );

    results.push({
      song,
      totalScore,
      tagScore,
      vectorScore,
      penaltyScore: penalties.total,
      topFactors
    });
  }

  return results
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, n);
}

/**
 * Matches all books to unique songs using a greedy algorithm.
 * Each song can only be assigned to one book.
 *
 * ALGORITHM:
 * 1. Calculate scores for all book-song pairs
 * 2. Sort pairs by score descending
 * 3. Greedily assign highest-scoring unassigned pairs
 * 4. Each book and song can only be used once
 *
 * @param books - All books to match
 * @param songs - All available songs
 * @returns Map of book ID to MatchResult with unique song assignments
 */
/**
 * Gets a MatchResult for a specific book-song pair.
 * Used when looking up pre-computed assignments from bookSongMapping.json
 */
export function getMatchResultForSong(book: Book, song: Song): MatchResult {
  const songVibeVector = deriveVibeVector(song.audio);
  const tagScore = jaccardSimilarity(book.vibeTags, song.vibeTags);
  const vectorScore = cosineSimilarity(book.vibeVector, songVibeVector);
  const penalties = calculatePenalties(book, songVibeVector, song.audio);

  const totalScore =
    (tagScore * TAG_WEIGHT) +
    (vectorScore * VECTOR_WEIGHT) +
    penalties.total;

  const topFactors = generateScoringFactors(
    book,
    song,
    songVibeVector,
    tagScore,
    vectorScore,
    penalties.factors
  );

  return {
    song,
    totalScore,
    tagScore,
    vectorScore,
    penaltyScore: penalties.total,
    topFactors
  };
}

export function matchAllBooksUniquely(
  books: Book[],
  songs: Song[]
): Map<string, MatchResult> {
  // Calculate all pairwise scores
  interface ScoredPair {
    book: Book;
    song: Song;
    result: MatchResult;
  }

  const allPairs: ScoredPair[] = [];

  for (const book of books) {
    for (const song of songs) {
      const songVibeVector = deriveVibeVector(song.audio);
      const tagScore = jaccardSimilarity(book.vibeTags, song.vibeTags);
      const vectorScore = cosineSimilarity(book.vibeVector, songVibeVector);
      const penalties = calculatePenalties(book, songVibeVector, song.audio);

      const totalScore =
        (tagScore * TAG_WEIGHT) +
        (vectorScore * VECTOR_WEIGHT) +
        penalties.total;

      const topFactors = generateScoringFactors(
        book,
        song,
        songVibeVector,
        tagScore,
        vectorScore,
        penalties.factors
      );

      allPairs.push({
        book,
        song,
        result: {
          song,
          totalScore,
          tagScore,
          vectorScore,
          penaltyScore: penalties.total,
          topFactors
        }
      });
    }
  }

  // Sort by score descending
  allPairs.sort((a, b) => b.result.totalScore - a.result.totalScore);

  // Greedy assignment
  const assignments = new Map<string, MatchResult>();
  const usedSongIds = new Set<string>();
  const assignedBookIds = new Set<string>();

  for (const pair of allPairs) {
    const bookId = pair.book.id;
    const songId = pair.song.id;

    // Skip if book already assigned or song already used
    if (assignedBookIds.has(bookId) || usedSongIds.has(songId)) {
      continue;
    }

    // Assign this pair
    assignments.set(bookId, pair.result);
    usedSongIds.add(songId);
    assignedBookIds.add(bookId);

    // Check if all books are assigned
    if (assignedBookIds.size === books.length) {
      break;
    }
  }

  return assignments;
}
