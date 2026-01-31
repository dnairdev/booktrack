import { notFound } from 'next/navigation';
import Link from 'next/link';
import books from '@/data/books.json';
import songs from '@/data/songs.json';
import bookSongMapping from '@/data/bookSongMapping.json';
import { Book, Song } from '@/lib/types';
import { getMatchResultForSong } from '@/lib/matchThemeSong';
import SongCard from '@/components/SongCard';
import VibeMeter from '@/components/VibeMeter';
import BookCover from '@/components/BookCover';

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return (books as Book[]).map((book) => ({
    id: book.id,
  }));
}

export async function generateMetadata({ params }: BookPageProps) {
  const { id } = await params;
  const book = (books as Book[]).find((b) => b.id === id);

  if (!book) {
    return { title: 'Book Not Found' };
  }

  return {
    title: `${book.title} Theme Song | BookTheme`,
    description: `Discover the perfect theme song for ${book.title} by ${book.author}`,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = (books as Book[]).find((b) => b.id === id);

  if (!book) {
    notFound();
  }

  // Get the theme song from pre-computed unique mapping
  const songId = (bookSongMapping as Record<string, string>)[book.id];
  const song = (songs as Song[]).find((s) => s.id === songId);

  if (!song) {
    notFound();
  }

  const matchResult = getMatchResultForSong(book, song);

  // Get previous and next books for navigation
  const bookList = books as Book[];
  const currentIndex = bookList.findIndex((b) => b.id === id);
  const prevBook = currentIndex > 0 ? bookList[currentIndex - 1] : null;
  const nextBook = currentIndex < bookList.length - 1 ? bookList[currentIndex + 1] : null;

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #2C2416 0%, #3D3226 50%, #2C2416 100%)',
      }}
    >
      {/* Ambient lighting effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,180,100,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Book Navigation Arrows */}
      {prevBook && (
        <Link
          href={`/book/${prevBook.id}`}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-amber-900/30 text-stone-300 hover:text-amber-400 hover:bg-black/70 transition-all group"
          title={prevBook.title}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      )}
      {nextBook && (
        <Link
          href={`/book/${nextBook.id}`}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-amber-900/30 text-stone-300 hover:text-amber-400 hover:bg-black/70 transition-all group"
          title={nextBook.title}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-amber-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-300 hover:text-amber-400 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">All Books</span>
          </Link>
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Book Header */}
        <section className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-12">
          {/* Book Cover */}
          <div className="w-40 sm:w-48 flex-shrink-0 mx-auto sm:mx-0">
            <BookCover
              coverImageUrl={book.coverImageUrl}
              title={book.title}
            />
          </div>

          {/* Book Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-50 leading-tight">
              {book.title}
            </h1>
            <p className="mt-2 text-lg sm:text-xl text-stone-300">
              by {book.author}
            </p>

            {/* Vibe Tags */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              {book.vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-amber-900/40 text-amber-200 border border-amber-700/30"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Vibe Blurb */}
            <blockquote className="mt-6 text-stone-300 italic leading-relaxed border-l-4 border-amber-600/50 pl-4">
              {book.vibeBlurb}
            </blockquote>
          </div>
        </section>

        {/* Theme Song Section */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-amber-100 mb-6 text-center sm:text-left">
            Your Theme Song
          </h2>
          <SongCard matchResult={matchResult} />
        </section>

        {/* Vibe Meter Section */}
        <section className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-900/30 p-6 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-amber-100 mb-6">
            Vibe Profile
          </h2>
          <div className="max-w-xl">
            <VibeMeter vibeVector={book.vibeVector} />
          </div>
        </section>

        {/* Back to Browse */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-full transition-colors shadow-lg shadow-amber-500/20"
          >
            Explore More Books
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-amber-900/30 bg-black/20 py-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-stone-500 text-xs sm:text-sm">
            <Link href="/" className="text-amber-500 hover:text-amber-400">
              BookTheme
            </Link>
            {' '}&mdash;{' '}
            Match books to music based on vibe, not plot.
          </p>
        </div>
      </footer>
    </div>
  );
}
