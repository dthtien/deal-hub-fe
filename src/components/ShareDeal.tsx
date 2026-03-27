import { useState } from "react";
import { Deal } from "../types";
import { ClipboardIcon, CheckIcon, ShareIcon } from "@heroicons/react/24/outline";

const API_BASE = import.meta.env.VITE_API_URL || '';

const recordShare = (dealId: number) => {
  fetch(`${API_BASE}/api/v1/deals/${dealId}/share`, { method: 'POST' }).catch(() => {});
};

const ShareDeal = ({ deal, onShared }: { deal: Deal; onShared?: () => void }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://www.ozvfy.com/deals/${deal.id}`;
  const shareText = `${deal.name} - $${deal.price}${deal.old_price ? ` (was $${deal.old_price})` : ''} at ${deal.store}! Check it out on OzVFY`;

  const handleShare = (fn: () => void) => {
    recordShare(deal.id);
    onShared?.();
    fn();
  };

  const shareToWhatsApp = () => handleShare(() =>
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this deal: ${shareUrl}`)}`, '_blank')
  );

  const shareToTelegram = () => handleShare(() =>
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
  );

  const shareToTwitter = () => handleShare(() =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  );

  const shareToFacebook = () => handleShare(() =>
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  );

  const copyLink = async () => {
    const urlToCopy = typeof window !== 'undefined' ? window.location.href : shareUrl;
    await navigator.clipboard.writeText(urlToCopy);
    recordShare(deal.id);
    onShared?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: deal.name, text: shareText, url: shareUrl });
        recordShare(deal.id);
        onShared?.();
      } catch { /* user cancelled */ }
    }
  };

  const btnBase = "flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-xs font-semibold transition-all hover:scale-105 active:scale-95";

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Share this deal:</p>
      <div className="grid grid-cols-3 gap-2">
        {/* WhatsApp */}
        <button
          onClick={shareToWhatsApp}
          className={`${btnBase} bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white`}
          title="Share on WhatsApp"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>

        {/* Telegram */}
        <button
          onClick={shareToTelegram}
          className={`${btnBase} bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white`}
          title="Share on Telegram"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.668l-2.95-.924c-.64-.203-.654-.64.136-.948l11.527-4.444c.537-.194 1.006.131.609.896z"/>
          </svg>
          Telegram
        </button>

        {/* Twitter/X */}
        <button
          onClick={shareToTwitter}
          className={`${btnBase} bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white`}
          title="Share on X (Twitter)"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Twitter/X
        </button>

        {/* Facebook */}
        <button
          onClick={shareToFacebook}
          className={`${btnBase} bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white`}
          title="Share on Facebook"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className={`${btnBase} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
          title="Copy link"
        >
          {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Native Share */}
        <button
          onClick={nativeShare}
          className={`${btnBase} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
          title="Share"
        >
          <ShareIcon className="w-5 h-5" />
          More
        </button>
      </div>
    </div>
  );
};

export default ShareDeal;
