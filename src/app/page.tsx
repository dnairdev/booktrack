import Bookshelf from '@/components/Bookshelf';
import books from '@/data/books.json';
import { Book } from '@/lib/types';

export default function Home() {
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

      {/* Hero Section */}
      <header className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Logo/Icon - Book with music note */}
          <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <svg
              className="w-7 h-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-50 tracking-tight">
            BookTheme
          </h1>

          <p className="mt-3 text-base sm:text-lg text-stone-300 max-w-xl mx-auto leading-relaxed">
            Find the song that{' '}
            <span className="italic text-amber-400">feels</span> like your book.
          </p>

          <p className="mt-2 text-stone-500 text-xs sm:text-sm">
            Select a book from the shelf to discover its perfect theme song.
          </p>
        </div>
      </header>

      {/* Main Content - The Bookshelf */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-amber-600/50" />
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-amber-100">
            Your Library
          </h2>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-amber-600/50 to-transparent" />
        </div>

        <Bookshelf books={books as Book[]} />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-amber-900/30 bg-black/20 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-stone-500 text-xs sm:text-sm">
            Built with vibes.{' '}
            <span className="text-stone-600">
              Powered by Vibe Alchemy.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
