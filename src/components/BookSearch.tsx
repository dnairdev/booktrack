'use client';

import { useState, useMemo } from 'react';
import { Book } from '@/lib/types';
import BookCard from './BookCard';

interface BookSearchProps {
  books: Book[];
}

export default function BookSearch({ books }: BookSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags from books
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    books.forEach((book) => book.vibeTags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [books]);

  // Filter books based on search and tag
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        searchQuery === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === null || book.vibeTags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [books, searchQuery, selectedTag]);

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-4">
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
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Tag Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              selectedTag === null
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {allTags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                selectedTag === tag
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-stone-500 text-sm mb-6">
        {filteredBooks.length === books.length
          ? `${books.length} books`
          : `${filteredBooks.length} of ${books.length} books`}
      </p>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-stone-500">No books match your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
