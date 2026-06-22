import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0–5
  max?: number;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, max = 5, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half   = !filled && i < rating;
        return (
          <Star
            key={i}
            size={size}
            className={filled || half ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
