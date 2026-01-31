'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Book, BookGenre } from '@/lib/types';

interface BookshelfProps {
  books: Book[];
}

// Genre inference based on vibeTags
const GENRE_RULES: { genre: BookGenre; tags: string[]; priority: number }[] = [
  { genre: 'Dark Academia', tags: ['dark-academia', 'academic', 'scholarly'], priority: 10 },
  { genre: 'Horror & Gothic', tags: ['horror', 'gothic', 'unsettling', 'creepy', 'supernatural', 'eerie'], priority: 9 },
  { genre: 'Fantasy', tags: ['fantasy', 'magical', 'mythical', 'fairy-tale', 'whimsical', 'enchanting'], priority: 8 },
  { genre: 'Science Fiction', tags: ['dystopian', 'sci-fi', 'futuristic', 'cyberpunk', 'post-apocalyptic'], priority: 8 },
  { genre: 'Mystery & Thriller', tags: ['mysterious', 'suspenseful', 'thriller', 'noir', 'crime', 'detective'], priority: 7 },
  { genre: 'Romance', tags: ['romantic', 'passionate', 'love', 'tender', 'swoon'], priority: 6 },
  { genre: 'Historical Fiction', tags: ['historical', 'period', 'war', 'victorian', 'regency'], priority: 5 },
  { genre: 'Young Adult', tags: ['coming-of-age', 'ya', 'teen', 'adolescent', 'bildungsroman'], priority: 4 },
  { genre: 'Classics', tags: ['classic', 'timeless', 'canonical', 'literary'], priority: 3 },
  { genre: 'Contemporary Fiction', tags: ['contemporary', 'modern', 'indie', 'urban'], priority: 2 },
  { genre: 'Literary Fiction', tags: ['literary', 'introspective', 'philosophical', 'character-driven'], priority: 1 },
];

function inferGenre(book: Book): BookGenre {
  if (book.genre) return book.genre;

  const bookTags = new Set(book.vibeTags.map(t => t.toLowerCase()));
  let bestMatch: { genre: BookGenre; score: number; priority: number } | null = null;

  for (const rule of GENRE_RULES) {
    const matchCount = rule.tags.filter(tag => bookTags.has(tag)).length;
    if (matchCount > 0) {
      const score = matchCount * rule.priority;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { genre: rule.genre, score, priority: rule.priority };
      }
    }
  }

  return bestMatch?.genre || 'Literary Fiction';
}

// Genre colors for shelf labels
const GENRE_COLORS: Record<BookGenre, string> = {
  'Literary Fiction': 'from-stone-600 to-stone-700',
  'Romance': 'from-rose-600 to-rose-700',
  'Fantasy': 'from-purple-600 to-purple-700',
  'Science Fiction': 'from-cyan-600 to-cyan-700',
  'Mystery & Thriller': 'from-slate-600 to-slate-700',
  'Horror & Gothic': 'from-zinc-700 to-zinc-800',
  'Dark Academia': 'from-amber-700 to-amber-800',
  'Classics': 'from-amber-600 to-amber-700',
  'Contemporary Fiction': 'from-teal-600 to-teal-700',
  'Historical Fiction': 'from-orange-600 to-orange-700',
  'Young Adult': 'from-pink-500 to-pink-600',
};

// Single book on the shelf
function ShelfBook({ book }: { book: Book }) {
  const [imageError, setImageError] = useState(false);

  const getSpineColor = (title: string) => {
    const colors = [
      'from-red-800 to-red-900',
      'from-blue-800 to-blue-900',
      'from-green-800 to-green-900',
      'from-amber-700 to-amber-800',
      'from-purple-800 to-purple-900',
      'from-stone-700 to-stone-800',
      'from-emerald-800 to-emerald-900',
      'from-rose-800 to-rose-900',
      'from-indigo-800 to-indigo-900',
      'from-orange-700 to-orange-800',
    ];
    const index = title.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Link
      href={`/book/${book.id}`}
      className="group relative flex-shrink-0 transition-all duration-300 hover:-translate-y-2 hover:z-10"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-[100px] sm:w-[120px] h-[150px] sm:h-[180px] transition-transform duration-300 group-hover:rotate-[-5deg]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 rounded-r-sm rounded-l-[2px] overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow">
          {book.coverImageUrl && !imageError ? (
            <Image
              src={book.coverImageUrl}
              alt={`Cover of ${book.title}`}
              fill
              sizes="120px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${getSpineColor(book.title)} flex flex-col items-center justify-center p-2`}>
              <span className="text-white/90 text-[10px] font-medium text-center leading-tight line-clamp-3">
                {book.title}
              </span>
              <span className="text-white/60 text-[8px] mt-1 text-center">
                {book.author}
              </span>
            </div>
          )}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
            <p className="text-white text-[10px] font-medium line-clamp-2">{book.title}</p>
            <p className="text-white/70 text-[8px] mt-0.5">{book.author}</p>
          </div>
        </div>
        <div
          className={`absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r ${getSpineColor(book.title)} rounded-l-[2px]`}
          style={{
            transform: 'rotateY(-90deg) translateX(-5px)',
            transformOrigin: 'left center'
          }}
        />
        <div
          className="absolute right-0 top-[2px] bottom-[2px] w-[6px] bg-gradient-to-l from-stone-100 to-stone-200"
          style={{
            transform: 'rotateY(90deg) translateX(3px)',
            transformOrigin: 'right center',
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px)'
          }}
        />
      </div>
    </Link>
  );
}

// Genre section with label and shelf
function GenreShelf({ genre, books }: { genre: BookGenre; books: Book[] }) {
  return (
    <div className="relative">
      {/* Genre label */}
      <div className="flex items-center gap-3 px-4 sm:px-6 mb-2">
        <div className={`px-3 py-1 rounded-md bg-gradient-to-r ${GENRE_COLORS[genre]} shadow-md`}>
          <span className="text-white text-xs sm:text-sm font-medium">{genre}</span>
        </div>
        <span className="text-stone-500 text-xs">{books.length} books</span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-stone-400/30 to-transparent" />
      </div>

      {/* Books container */}
      <div className="flex gap-2 sm:gap-3 px-4 sm:px-6 pb-3 pt-1 overflow-x-auto scrollbar-hide">
        {books.map((book) => (
          <ShelfBook key={book.id} book={book} />
        ))}
      </div>

      {/* Wooden shelf */}
      <div className="relative h-5 sm:h-6">
        <div
          className="absolute inset-x-0 top-0 h-3 sm:h-4 rounded-sm"
          style={{
            background: 'linear-gradient(180deg, #8B7355 0%, #6B5344 50%, #5D4637 100%)',
            boxShadow: '0 4px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 21px)`,
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-b from-transparent to-black/20" />
        </div>
        <div className="absolute left-6 top-3 sm:top-4 w-3 h-2 bg-gradient-to-b from-black/30 to-transparent rounded-b-sm" />
        <div className="absolute right-6 top-3 sm:top-4 w-3 h-2 bg-gradient-to-b from-black/30 to-transparent rounded-b-sm" />
        <div className="absolute inset-x-0 top-3 sm:top-4 h-2 bg-gradient-to-b from-black/10 to-transparent" />
      </div>
    </div>
  );
}

export default function Bookshelf({ books }: BookshelfProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<BookGenre | null>(null);

  // Group books by genre
  const booksByGenre = useMemo(() => {
    const grouped = new Map<BookGenre, Book[]>();

    books.forEach((book) => {
      const genre = inferGenre(book);
      if (!grouped.has(genre)) {
        grouped.set(genre, []);
      }
      grouped.get(genre)!.push(book);
    });

    // Sort genres by book count (descending)
    return Array.from(grouped.entries())
      .sort((a, b) => b[1].length - a[1].length);
  }, [books]);

  // Get all genres
  const allGenres = useMemo(() => booksByGenre.map(([genre]) => genre), [booksByGenre]);

  // Filter books based on search and genre
  const filteredByGenre = useMemo(() => {
    return booksByGenre
      .filter(([genre]) => selectedGenre === null || genre === selectedGenre)
      .map(([genre, genreBooks]) => {
        const filtered = genreBooks.filter((book) => {
          return searchQuery === '' ||
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        });
        return [genre, filtered] as [BookGenre, Book[]];
      })
      .filter(([, books]) => books.length > 0);
  }, [booksByGenre, searchQuery, selectedGenre]);

  const totalFiltered = filteredByGenre.reduce((sum, [, books]) => sum + books.length, 0);

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur border border-stone-300 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Genre Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              selectedGenre === null
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white/80 text-stone-600 hover:bg-white'
            }`}
          >
            All Genres
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                selectedGenre === genre
                  ? `bg-gradient-to-r ${GENRE_COLORS[genre]} text-white shadow-md`
                  : 'bg-white/80 text-stone-600 hover:bg-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-stone-600 text-sm mb-4">
        {totalFiltered === books.length
          ? `${books.length} books on the shelf`
          : `${totalFiltered} of ${books.length} books`}
      </p>

      {/* Bookshelf organized by genre */}
      {filteredByGenre.length > 0 ? (
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #D4C4A8 0%, #C9B896 50%, #BEA882 100%)',
            boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.1), 0 10px 40px -10px rgba(0,0,0,0.3)',
          }}
        >
          {/* Wall texture overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Genre Shelves */}
          <div className="relative py-4 space-y-1">
            {filteredByGenre.map(([genre, genreBooks]) => (
              <GenreShelf key={genre} genre={genre} books={genreBooks} />
            ))}
          </div>

          {/* Decorative frame edges */}
          <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-amber-900/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-t from-amber-900/30 to-transparent" />
          <div className="absolute left-0 inset-y-0 w-3 bg-gradient-to-r from-amber-900/20 to-transparent" />
          <div className="absolute right-0 inset-y-0 w-3 bg-gradient-to-l from-amber-900/20 to-transparent" />
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, #D4C4A8 0%, #C9B896 100%)',
          }}
        >
          <p className="text-stone-600">No books match your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre(null);
            }}
            className="mt-4 text-amber-700 hover:text-amber-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
