'use client';

import { VibeVector } from '@/lib/types';

interface VibeMeterProps {
  vibeVector: VibeVector;
  compact?: boolean;
}

// Human-friendly labels for each dimension
const dimensionLabels: Record<keyof VibeVector, string> = {
  melancholy: 'Melancholy',
  intimacy: 'Intimacy',
  intensity: 'Intensity',
  hope: 'Hope',
  tension: 'Tension',
  warmth: 'Warmth',
  nostalgia: 'Nostalgia',
  eeriness: 'Eeriness',
  pace: 'Pace',
};

// Color classes for each dimension (using warm, earthy tones)
const dimensionColors: Record<keyof VibeVector, string> = {
  melancholy: 'bg-blue-400',
  intimacy: 'bg-rose-400',
  intensity: 'bg-red-500',
  hope: 'bg-amber-400',
  tension: 'bg-orange-500',
  warmth: 'bg-yellow-400',
  nostalgia: 'bg-purple-400',
  eeriness: 'bg-slate-500',
  pace: 'bg-emerald-500',
};

export default function VibeMeter({ vibeVector, compact = false }: VibeMeterProps) {
  const dimensions = Object.keys(vibeVector) as (keyof VibeVector)[];

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {dimensions.map((dimension) => {
        const value = vibeVector[dimension];
        const percentage = Math.round(value * 100);

        return (
          <div key={dimension} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={`text-stone-300 ${compact ? 'text-xs' : 'text-sm'}`}>
                {dimensionLabels[dimension]}
              </span>
              <span className={`text-stone-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                {percentage}%
              </span>
            </div>
            <div className={`w-full bg-stone-800/50 rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2'}`}>
              <div
                className={`${dimensionColors[dimension]} h-full rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
