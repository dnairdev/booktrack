/**
 * Type definitions for BookTheme
 */

// The 9 vibe dimensions for books
export interface VibeVector {
  melancholy: number;    // 0-1: sadness, grief, longing
  intimacy: number;      // 0-1: closeness, personal connection
  intensity: number;     // 0-1: emotional or narrative strength
  hope: number;          // 0-1: optimism, light at the end
  tension: number;       // 0-1: suspense, conflict, anxiety
  warmth: number;        // 0-1: comfort, coziness, safety
  nostalgia: number;     // 0-1: looking back, memory, yearning for past
  eeriness: number;      // 0-1: uncanny, unsettling, supernatural
  pace: number;          // 0-1: speed of narrative/emotional movement
}

// Book genres
export type BookGenre =
  | 'Literary Fiction'
  | 'Romance'
  | 'Fantasy'
  | 'Science Fiction'
  | 'Mystery & Thriller'
  | 'Horror & Gothic'
  | 'Dark Academia'
  | 'Classics'
  | 'Contemporary Fiction'
  | 'Historical Fiction'
  | 'Young Adult';

// Book data model
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  vibeTags: string[];
  vibeVector: VibeVector;
  vibeBlurb: string;
  genre?: BookGenre;
}

// Spotify audio features (normalized 0-1)
export interface AudioFeatures {
  energy: number;       // 0-1: intensity and activity
  valence: number;      // 0-1: musical positiveness (happy vs sad)
  tempo: number;        // 0-1: normalized BPM (60-200 -> 0-1)
  acousticness: number; // 0-1: acoustic vs electronic
  danceability: number; // 0-1: rhythmic suitability for dancing
}

// Song data model
export interface Song {
  id: string;
  title: string;
  artist: string;
  spotifyUrl: string;
  previewUrl: string | null;
  vibeTags: string[];
  audio: AudioFeatures;
  moodBlurb: string;
}

// Scoring factors for explainability
export interface ScoringFactor {
  factor: string;        // Human-readable description
  contribution: number;  // How much this contributed to the score
  type: 'positive' | 'negative' | 'neutral';
}

// Match result
export interface MatchResult {
  song: Song;
  totalScore: number;
  tagScore: number;
  vectorScore: number;
  penaltyScore: number;
  topFactors: ScoringFactor[];
}
