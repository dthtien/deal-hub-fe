import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem('ozvfy_session_id');
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('ozvfy_session_id', sid);
  }
  return sid;
}

interface RatingData {
  average: number;
  count: number;
  user_rating: number | null;
}

export default function StarRating({ dealId }: { dealId: number }) {
  const [data, setData] = useState<RatingData>({ average: 0, count: 0, user_rating: null });
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const sessionId = getOrCreateSessionId();

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/rating?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => {});
  }, [dealId, sessionId]);

  const handleRate = async (star: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${dealId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: star, session_id: sessionId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const displayStar = hover ?? data.user_rating ?? 0;

  return (
    <div className="flex items-center gap-3 mt-3">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rate this deal:</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            disabled={submitting}
            className="transition-transform hover:scale-110 focus:outline-none"
            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            {star <= displayStar ? (
              <StarSolid className="w-5 h-5 text-amber-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            )}
          </button>
        ))}
      </div>
      {data.count > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {data.average.toFixed(1)} ({data.count} {data.count === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
