'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Book } from '@/lib/types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/book/${book.id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-stone-100"
    >
      <div className="aspect-[2/3] relative bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {book.coverImageUrl && !imageError ? (
          <Image
            src={book.coverImageUrl}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-serif text-stone-300 group-hover:scale-110 transition-transform duration-300">
              {book.title[0]}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-stone-800 line-clamp-1 group-hover:text-amber-700 transition-colors">
          {book.title}
        </h3>
        <p className="text-stone-500 text-sm mt-1">{book.author}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {book.vibeTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
