'use client';

import { MatchResult } from '@/lib/types';

interface SongCardProps {
  matchResult: MatchResult;
}

export default function SongCard({ matchResult }: SongCardProps) {
  const { song, topFactors } = matchResult;

  // Extract Spotify track ID for embed
  const spotifyTrackId = song.spotifyUrl?.match(/track\/([a-zA-Z0-9]+)/)?.[1];

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-3xl shadow-lg border border-amber-900/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          {/* Album art placeholder */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-amber-500 text-sm font-medium uppercase tracking-wider mb-1">
              Your Theme Song
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-50 line-clamp-2">
              {song.title}
            </h2>
            <p className="text-stone-300 text-lg mt-1">{song.artist}</p>
          </div>
        </div>

        {/* Song mood blurb */}
        <p className="mt-4 text-stone-300 italic leading-relaxed">
          &ldquo;{song.moodBlurb}&rdquo;
        </p>

        {/* Spotify button */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={song.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Listen on Spotify
          </a>
        </div>
      </div>

      {/* Spotify Embed */}
      {spotifyTrackId && (
        <div className="px-6 sm:px-8 pb-2">
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        </div>
      )}

      {/* Why this fits section */}
      <div className="bg-black/20 p-6 sm:p-8 mt-2">
        <h3 className="font-serif text-lg font-semibold text-amber-100 mb-4">
          Why This Fits
        </h3>
        <ul className="space-y-3">
          {topFactors.map((factor, index) => (
            <li key={index} className="flex items-start gap-3">
              <span
                className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  factor.type === 'positive'
                    ? 'bg-emerald-400'
                    : factor.type === 'negative'
                    ? 'bg-red-400'
                    : 'bg-stone-400'
                }`}
              />
              <span className="text-stone-300">{factor.factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Match score (subtle) */}
      <div className="px-6 sm:px-8 py-4 bg-black/30 border-t border-amber-900/30">
        <p className="text-xs text-stone-400 text-center">
          Match score: {Math.round(matchResult.totalScore * 100)}% compatibility
        </p>
      </div>
    </div>
  );
}
