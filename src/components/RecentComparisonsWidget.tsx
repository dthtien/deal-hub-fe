import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScaleIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface ComparisonSession {
  id: number;
  session_id: string;
  product_ids: number[];
  created_at: string;
}

interface ProductThumbnail {
  id: number;
  image_url?: string;
  name: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getSessionId(): string {
  let sid = localStorage.getItem('ozvfy_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('ozvfy_session_id', sid);
  }
  return sid;
}

function SessionEntry({ session, thumbnails }: { session: ComparisonSession; thumbnails: Record<number, ProductThumbnail> }) {
  const navigate = useNavigate();
  const ids = session.product_ids.slice(0, 4);

  const handleClick = () => {
    navigate(`/compare?ids=${session.product_ids.join(',')}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors text-left group"
    >
      <div className="flex -space-x-2 flex-shrink-0">
        {ids.map((pid) => {
          const thumb = thumbnails[pid];
          return thumb?.image_url ? (
            <img
              key={pid}
              src={thumb.image_url}
              alt={thumb.name}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div key={pid} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-orange-200 dark:bg-orange-800 flex items-center justify-center">
              <ScaleIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          );
        })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 truncate">
          Compared {session.product_ids.length} deal{session.product_ids.length !== 1 ? 's' : ''}
        </p>
        <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          <ClockIcon className="w-3 h-3" />
          {timeAgo(session.created_at)}
        </p>
      </div>
    </button>
  );
}

export default function RecentComparisonsWidget() {
  const [sessions, setSessions] = useState<ComparisonSession[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, ProductThumbnail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    fetch(`${API_BASE}/api/v1/comparison_sessions?session_id=${encodeURIComponent(sid)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const list: ComparisonSession[] = (data.comparison_sessions || []).slice(0, 3);
        setSessions(list);
        // fetch thumbnails for unique product IDs
        const ids = [...new Set(list.flatMap(s => s.product_ids))].slice(0, 12);
        return Promise.all(
          ids.map(id =>
            fetch(`${API_BASE}/api/v1/deals/${id}`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        ).then(products => {
          const map: Record<number, ProductThumbnail> = {};
          products.forEach(p => {
            if (p && p.id) {
              map[p.id] = { id: p.id, image_url: p.image_url || p.image_urls?.[0], name: p.name };
            }
          });
          setThumbnails(map);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || sessions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ScaleIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Comparisons</h3>
      </div>
      <div className="space-y-2">
        {sessions.map(s => (
          <SessionEntry key={s.id} session={s} thumbnails={thumbnails} />
        ))}
      </div>
    </div>
  );
}
