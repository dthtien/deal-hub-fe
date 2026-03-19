import { useState } from "react";
import { Deal } from "../types";

const ShareDeal = ({ deal }: { deal: Deal }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://www.ozvfy.com/?query=${encodeURIComponent(deal.name)}`;
  const shareText = `🔥 ${deal.name} – $${deal.price}${deal.old_price ? ` (was $${deal.old_price})` : ''} at ${deal.store}! Check it out on OzVFY`;

  const shareToX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-gray-400">Share:</span>
      <button
        onClick={shareToX}
        className="text-xs bg-black text-white px-2 py-0.5 rounded hover:bg-gray-800 transition-colors"
        title="Share on X"
      >
        𝕏
      </button>
      <button
        onClick={shareToFacebook}
        className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-colors"
        title="Share on Facebook"
      >
        f
      </button>
      <button
        onClick={copyLink}
        className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors"
        title="Copy link"
      >
        {copied ? '✅' : '🔗'}
      </button>
    </div>
  );
};

export default ShareDeal;
