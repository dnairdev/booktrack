'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BookCoverProps {
  coverImageUrl: string;
  title: string;
  className?: string;
}

export default function BookCover({ coverImageUrl, title, className = '' }: BookCoverProps) {
  const [imageError, setImageError] = useState(false);

  if (!coverImageUrl || imageError) {
    return (
      <div className={`aspect-[2/3] rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 shadow-lg flex items-center justify-center ${className}`}>
        <span className="text-7xl font-serif text-stone-400">
          {title[0]}
        </span>
      </div>
    );
  }

  return (
    <div className={`aspect-[2/3] rounded-2xl overflow-hidden shadow-lg relative ${className}`}>
      <Image
        src={coverImageUrl}
        alt={`Cover of ${title}`}
        fill
        sizes="(max-width: 640px) 160px, 192px"
        className="object-cover"
        onError={() => setImageError(true)}
        priority
      />
    </div>
  );
}
