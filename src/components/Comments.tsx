import { useState, useEffect, useMemo } from 'react';
import { ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Button, TextArea } from '@heroui/react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Comment {
  id: number;
  name: string;
  body: string;
  session_id: string;
  created_at: string;
}

type SortMode = 'newest' | 'oldest' | 'most_liked';

const EMOJI_REACTIONS = ['👍', '❤️', '😮', '😂'] as const;
type EmojiReaction = typeof EMOJI_REACTIONS[number];

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

// Persistent color per name
const AVATAR_COLORS = [
  'bg-orange-400', 'bg-blue-400', 'bg-emerald-400', 'bg-violet-400',
  'bg-rose-400', 'bg-amber-400', 'bg-teal-400', 'bg-pink-400',
];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getReactions(dealId: number, commentId: number): Record<EmojiReaction, number> {
  try {
    const raw = localStorage.getItem(`reactions_${dealId}_${commentId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { '👍': 0, '❤️': 0, '😮': 0, '😂': 0 };
}

function getMyReaction(dealId: number, commentId: number): EmojiReaction | null {
  try {
    const raw = localStorage.getItem(`my_reaction_${dealId}_${commentId}`);
    if (raw && EMOJI_REACTIONS.includes(raw as EmojiReaction)) return raw as EmojiReaction;
  } catch { /* ignore */ }
  return null;
}

function saveReaction(dealId: number, commentId: number, emoji: EmojiReaction | null, reactions: Record<EmojiReaction, number>) {
  try {
    localStorage.setItem(`reactions_${dealId}_${commentId}`, JSON.stringify(reactions));
    if (emoji) localStorage.setItem(`my_reaction_${dealId}_${commentId}`, emoji);
    else localStorage.removeItem(`my_reaction_${dealId}_${commentId}`);
  } catch { /* ignore */ }
}

function getReplies(dealId: number, commentId: number): Comment[] {
  try {
    const raw = localStorage.getItem(`replies_${dealId}_${commentId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveReply(dealId: number, commentId: number, reply: Comment) {
  const existing = getReplies(dealId, commentId);
  const updated = [...existing, reply];
  try {
    localStorage.setItem(`replies_${dealId}_${commentId}`, JSON.stringify(updated));
  } catch { /* ignore */ }
  return updated;
}

function totalLikes(dealId: number, commentId: number): number {
  const r = getReactions(dealId, commentId);
  return r['👍'] + r['❤️'];
}

interface CommentItemProps {
  comment: Comment;
  dealId: number;
  displayName: string;
}

function CommentItem({ comment, dealId, displayName }: CommentItemProps) {
  const [reactions, setReactions] = useState<Record<EmojiReaction, number>>(() => getReactions(dealId, comment.id));
  const [myReaction, setMyReaction] = useState<EmojiReaction | null>(() => getMyReaction(dealId, comment.id));
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replies, setReplies] = useState<Comment[]>(() => getReplies(dealId, comment.id));
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleReact = (emoji: EmojiReaction) => {
    const next = { ...reactions };
    if (myReaction === emoji) {
      // toggle off
      next[emoji] = Math.max(0, next[emoji] - 1);
      setMyReaction(null);
      setReactions(next);
      saveReaction(dealId, comment.id, null, next);
    } else {
      if (myReaction) {
        next[myReaction] = Math.max(0, next[myReaction] - 1);
      }
      next[emoji] = (next[emoji] || 0) + 1;
      setMyReaction(emoji);
      setReactions(next);
      saveReaction(dealId, comment.id, emoji, next);
    }
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || replySubmitting) return;
    setReplySubmitting(true);
    const reply: Comment = {
      id: Date.now(),
      name: displayName,
      body: replyBody.trim(),
      session_id: getSessionId(),
      created_at: new Date().toISOString(),
    };
    const updated = saveReply(dealId, comment.id, reply);
    setReplies(updated);
    setReplyBody('');
    setShowReplyForm(false);
    setReplySubmitting(false);
  };

  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-9 h-9 rounded-full ${avatarColor(comment.name)} flex items-center justify-center text-xs font-bold text-white`}>
        {initials(comment.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.name}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.body}</p>

          {/* Emoji reactions */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {EMOJI_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  myReaction === emoji
                    ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{emoji}</span>
                {reactions[emoji] > 0 && <span className="font-medium">{reactions[emoji]}</span>}
              </button>
            ))}
            <button
              onClick={() => setShowReplyForm(v => !v)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 ml-1 transition-colors"
            >
              Reply
            </button>
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-2 ml-4 space-y-2">
            {replies.map(r => (
              <div key={r.id} className="flex gap-2">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full ${avatarColor(r.name)} flex items-center justify-center text-xs font-bold text-white`}>
                  {initials(r.name)}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{r.name}</span>
                    <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline reply form */}
        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="mt-2 ml-4 flex gap-2">
            <input
              type="text"
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyBody.trim() || replySubmitting}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 transition-colors"
            >
              Reply
            </button>
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Comments({ dealId }: { dealId: number }) {
  const { user, login } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [fetching, setFetching] = useState(true);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

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

  const sortedComments = useMemo(() => {
    const arr = [...comments];
    if (sortMode === 'newest') {
      return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortMode === 'oldest') {
      return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      return arr.sort((a, b) => totalLikes(dealId, b.id) - totalLikes(dealId, a.id));
    }
  }, [comments, sortMode, dealId]);

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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <ChatBubbleLeftIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          Community ({comments.length})
        </h3>
        {comments.length > 1 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400 dark:text-gray-500 mr-1">Sort:</span>
            {(['newest', 'oldest', 'most_liked'] as SortMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  sortMode === mode
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {mode === 'newest' ? 'Newest' : mode === 'oldest' ? 'Oldest' : 'Most Liked'}
              </button>
            ))}
          </div>
        )}
      </div>

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
        {sortedComments.map(c => (
          <CommentItem key={c.id} comment={c} dealId={dealId} displayName={displayName} />
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
                : <div className={`w-8 h-8 rounded-full ${avatarColor(displayName)} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{initials(displayName)}</div>
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

        <TextArea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share your thoughts on this deal..."
          rows={3}
          required
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-700 resize-none"
        />

        {status === 'error' && (
          <p className="text-xs text-red-500 dark:text-red-400">Something went wrong. Try again.</p>
        )}

        <Button
          type="submit"
          isDisabled={status === 'loading' || !body.trim()}
          className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
        >
          {status === 'loading' ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </div>
  );
}
