import { useState } from 'react';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Deal } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ShareButton({ deal }: { deal: Deal }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://www.ozvfy.com/deals/${deal.id}`;
  const shareText = `${deal.name} - $${deal.price} at ${deal.store}! Check it out on OzVFY`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Record share
    fetch(`${API_BASE}/api/v1/deals/${deal.id}/share`, { method: 'POST' }).catch(() => {});

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: deal.name, text: shareText, url: shareUrl });
        return;
      } catch { /* cancelled */ }
    }

    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <button
      onClick={handleShare}
      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 transition-colors"
      title={copied ? 'Copied!' : 'Share deal'}
      aria-label="Share deal"
    >
      {copied
        ? <CheckIcon className="w-4 h-4 text-green-500" />
        : <ShareIcon className="w-4 h-4" />}
    </button>
  );
}
