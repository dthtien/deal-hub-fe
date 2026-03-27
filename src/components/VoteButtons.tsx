import { useEffect, useState, useCallback } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getSessionId(): string {
  let sid = localStorage.getItem('ozvfy_session_id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('ozvfy_session_id', sid);
  }
  return sid;
}

interface VoteState {
  upvotes: number;
  downvotes: number;
  user_vote: number | null;
}

interface Props {
  dealId: number | string;
  compact?: boolean;
}

export default function VoteButtons({ dealId, compact = false }: Props) {
  const [state, setState] = useState<VoteState>({ upvotes: 0, downvotes: 0, user_vote: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${dealId}/vote`, {
      headers: { 'X-Session-Id': getSessionId() },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setState(d); })
      .catch(() => {});
  }, [dealId]);

  const vote = useCallback((value: 1 | -1) => {
    if (loading) return;
    setLoading(true);

    // Save state before optimistic update so we can revert on failure
    let prevState: VoteState;
    setState(prev => {
      prevState = prev;
      const removing = prev.user_vote === value;
      return {
        upvotes: value === 1
          ? prev.upvotes + (removing ? -1 : prev.user_vote === 1 ? 0 : 1)
          : prev.upvotes + (prev.user_vote === 1 ? -1 : 0),
        downvotes: value === -1
          ? prev.downvotes + (removing ? -1 : prev.user_vote === -1 ? 0 : 1)
          : prev.downvotes + (prev.user_vote === -1 ? -1 : 0),
        user_vote: removing ? null : value,
      };
    });

    fetch(`${API_BASE}/api/v1/deals/${dealId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() },
      body: JSON.stringify({ value }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setState(d); })
      .catch(() => { setState(prevState!); })
      .finally(() => setLoading(false));
  }, [dealId, loading]);

  const score = state.upvotes - state.downvotes;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); vote(1); }}
          className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            state.user_vote === 1
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20'
          }`}
          aria-label="Upvote deal"
          title="Upvote"
        >
          {state.user_vote === 1
            ? <HandThumbUpSolid className="w-3.5 h-3.5" />
            : <HandThumbUpIcon className="w-3.5 h-3.5" />}
          <span>{state.upvotes}</span>
        </button>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); vote(-1); }}
          className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            state.user_vote === -1
              ? 'bg-rose-100 text-rose-700 dark:bg-gray-800 dark:text-rose-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20'
          }`}
          aria-label="Downvote deal"
          title="Downvote"
        >
          {state.user_vote === -1
            ? <HandThumbDownSolid className="w-3.5 h-3.5" />
            : <HandThumbDownIcon className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => vote(1)}
        disabled={loading}
        aria-label="Upvote deal"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          state.user_vote === 1
            ? 'bg-emerald-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30'
        }`}
      >
        {state.user_vote === 1
          ? <HandThumbUpSolid className="w-4 h-4" />
          : <HandThumbUpIcon className="w-4 h-4" />}
        Hot deal · {state.upvotes}
      </button>

      <span className={`text-sm font-bold tabular-nums ${score > 0 ? 'text-emerald-600 dark:text-emerald-400' : score < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-gray-400'}`}>
        {score > 0 ? `+${score}` : score}
      </span>

      <button
        onClick={() => vote(-1)}
        disabled={loading}
        aria-label="Downvote deal"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          state.user_vote === -1
            ? 'bg-rose-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30'
        }`}
      >
        {state.user_vote === -1
          ? <HandThumbDownSolid className="w-4 h-4" />
          : <HandThumbDownIcon className="w-4 h-4" />}
        Overpriced · {state.downvotes}
      </button>
    </div>
  );
}
