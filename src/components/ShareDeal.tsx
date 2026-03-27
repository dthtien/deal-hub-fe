import { useState } from "react";
import { Deal } from "../types";
import { ClipboardIcon, CheckIcon, ShareIcon } from "@heroicons/react/24/outline";

const ShareDeal = ({ deal }: { deal: Deal }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://www.ozvfy.com/deals/${deal.id}`;
  const shareText = `${deal.name} – $${deal.price}${deal.old_price ? ` (was $${deal.old_price})` : ''} at ${deal.store}! Check it out on OzVFY`;

  const shareToX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareToTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this deal: ${shareUrl}`)}`, '_blank');

  const copyLink = async () => {
    const urlToCopy = typeof window !== 'undefined' ? window.location.href : shareUrl;
    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: deal.name, text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      <span className="text-xs text-gray-400 dark:text-gray-500">Share:</span>
      <button onClick={shareToX} className="text-xs bg-black dark:bg-gray-700 text-white px-2 py-0.5 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-bold" title="Share on X">X</button>
      <button onClick={shareToFacebook} className="text-xs bg-blue-600 dark:bg-blue-700 text-white px-2 py-0.5 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-bold" title="Share on Facebook">f</button>
      <button onClick={shareToWhatsApp} className="text-xs bg-green-500 dark:bg-green-600 text-white px-2 py-0.5 rounded hover:bg-green-600 dark:hover:bg-green-500 transition-colors font-bold" title="Share on WhatsApp">W</button>
      <button onClick={shareToTelegram} className="flex items-center gap-0.5 text-xs bg-sky-500 dark:bg-sky-600 text-white px-2 py-0.5 rounded hover:bg-sky-600 dark:hover:bg-sky-500 transition-colors" title="Share on Telegram">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.668l-2.95-.924c-.64-.203-.654-.64.136-.948l11.527-4.444c.537-.194 1.006.131.609.896z"/>
        </svg>
      </button>
      <button onClick={copyLink} className="flex items-center gap-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Copy link">
        {copied ? <CheckIcon className="w-3 h-3 text-green-500" /> : <ClipboardIcon className="w-3 h-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button onClick={nativeShare} className="flex items-center gap-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Share">
          <ShareIcon className="w-3 h-3" />
          Share
        </button>
      )}
    </div>
  );
};

export default ShareDeal;
