import { useEffect, useState, useCallback } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid';
import { Button, ButtonGroup } from '@heroui/react';

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
      <ButtonGroup size="sm" variant="flat">
        <Button
          onPress={(e) => { vote(1); }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className={
            state.user_vote === 1
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }
          aria-label="Upvote deal"
          startContent={
            state.user_vote === 1
              ? <HandThumbUpSolid className="w-3.5 h-3.5" />
              : <HandThumbUpIcon className="w-3.5 h-3.5" />
          }
        >
          {state.upvotes}
        </Button>
        <Button
          onPress={() => vote(-1)}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className={
            state.user_vote === -1
              ? 'bg-rose-100 text-rose-700 dark:bg-gray-800 dark:text-rose-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }
          aria-label="Downvote deal"
          isIconOnly
        >
          {state.user_vote === -1
            ? <HandThumbDownSolid className="w-3.5 h-3.5" />
            : <HandThumbDownIcon className="w-3.5 h-3.5" />}
        </Button>
      </ButtonGroup>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onPress={() => vote(1)}
        isDisabled={loading}
        aria-label="Upvote deal"
        variant={state.user_vote === 1 ? 'solid' : 'flat'}
        color={state.user_vote === 1 ? 'success' : 'default'}
        className={state.user_vote !== 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : ''}
        startContent={
          state.user_vote === 1
            ? <HandThumbUpSolid className="w-4 h-4" />
            : <HandThumbUpIcon className="w-4 h-4" />
        }
      >
        Hot deal · {state.upvotes}
      </Button>

      <span className={`text-sm font-bold tabular-nums ${score > 0 ? 'text-emerald-600 dark:text-emerald-400' : score < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-gray-400'}`}>
        {score > 0 ? `+${score}` : score}
      </span>

      <Button
        onPress={() => vote(-1)}
        isDisabled={loading}
        aria-label="Downvote deal"
        variant={state.user_vote === -1 ? 'solid' : 'flat'}
        color={state.user_vote === -1 ? 'danger' : 'default'}
        className={state.user_vote !== -1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : ''}
        startContent={
          state.user_vote === -1
            ? <HandThumbDownSolid className="w-4 h-4" />
            : <HandThumbDownIcon className="w-4 h-4" />
        }
      >
        Overpriced · {state.downvotes}
      </Button>
    </div>
  );
}
