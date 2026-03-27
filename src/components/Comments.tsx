import { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Comment {
  id: number;
  name: string;
  body: string;
  session_id: string;
  created_at: string;
}

function getSessionId(): string {
  let sid = localStorage.getItem('ozvfy_session_id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('ozvfy_session_id', sid);
  }
  return sid;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Comments({ dealId }: { dealId: number }) {
  const { user, login } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [fetching, setFetching] = useState(true);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : 'Anonymous';

  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    fetch(`${API_BASE}/api/v1/deals/${dealId}/comments`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (!cancelled) setComments(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, [dealId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${dealId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: { name: displayName, body: body.trim(), session_id: getSessionId() } }),
      });
      if (!res.ok) throw new Error();
      const created: Comment = await res.json();
      setComments(prev => [...prev, created]);
      setBody('');

      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
        <ChatBubbleLeftIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        Community ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {fetching && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!fetching && comments.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">No comments yet. Be the first!</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
              {initials(c.name)}
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        {/* Identity row */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.avatar_url
                ? <img src={user.avatar_url} alt={displayName} className="w-8 h-8 rounded-full flex-shrink-0" />
                : <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">{initials(displayName)}</div>
              }
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{displayName}</span>
            </>
          ) : (
            <>
              <UserCircleIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                Commenting as <span className="font-medium">Anonymous</span> ·
                <button type="button" onClick={login} className="text-orange-500 hover:underline font-medium">Sign in with Google</button>
                <span className="text-xs text-gray-400">to use your name</span>
              </div>
            </>
          )}
        </div>

        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share your thoughts on this deal..."
          rows={3}
          required
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 resize-none"
        />
        {status === 'error' && <p className="text-xs text-red-500 dark:text-red-400">Something went wrong. Try again.</p>}
        <button
          type="submit"
          disabled={status === 'loading' || !body.trim()}
          className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
        >
          {status === 'loading' ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}
