import { useState } from 'react';
import { Deal } from '../types';
import { ClipboardIcon, CheckIcon, ShareIcon } from '@heroicons/react/24/outline';
import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalCloseTrigger,
} from '@heroui/react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const recordShare = (dealId: number, type: string) => {
  fetch(`${API_BASE}/api/v1/deals/${dealId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ share_type: type }),
  }).catch(() => {});
};

interface ShareModalProps {
  deal: Deal;
  onClose: () => void;
  onShared?: () => void;
}

const ShareModal = ({ deal, onClose, onShared }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);

  const shareUrl = `https://www.ozvfy.com/deals/${deal.id}`;
  const shareText = `${deal.name} - $${deal.price}${deal.old_price ? ` (was $${deal.old_price})` : ''} at ${deal.store}! Check it out on OzVFY`;
  const dealDetailsText = `Found this deal: ${deal.name} for $${deal.price}${deal.discount ? ` (${deal.discount}% off)` : ''} at ${deal.store} via ozvfy.com`;

  const handleShare = (type: string, fn: () => void) => {
    recordShare(deal.id, type);
    onShared?.();
    fn();
  };

  const shareToWhatsApp = () => handleShare('whatsapp', () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this deal: ${shareUrl}`)}`, '_blank')
  );
  const shareToTelegram = () => handleShare('telegram', () =>
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
  );
  const shareToTwitter = () => handleShare('twitter', () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  );
  const shareToFacebook = () => handleShare('facebook', () =>
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  );
  const shareToPinterest = () => handleShare('pinterest', () => {
    const imageUrl = deal.image_url || '';
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(dealDetailsText)}`,
      '_blank'
    );
  });
  const copyLink = async () => {
    const urlToCopy = typeof window !== 'undefined' ? window.location.href : shareUrl;
    await navigator.clipboard.writeText(urlToCopy);
    recordShare(deal.id, 'copy_link');
    onShared?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const copyDealDetails = async () => {
    await navigator.clipboard.writeText(dealDetailsText);
    recordShare(deal.id, 'copy_details');
    onShared?.();
    setCopiedDetails(true);
    setTimeout(() => setCopiedDetails(false), 2000);
  };

  const btnClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]";

  return (
    <Modal defaultOpen onOpenChange={(open) => { if (!open) onClose(); }}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="sm">
        <ModalDialog aria-label="Share Deal">
          <ModalHeader>
            <ModalHeading className="flex items-center gap-2">
              <ShareIcon className="w-5 h-5" />
              Share this Deal
            </ModalHeading>
            <ModalCloseTrigger onClick={onClose} />
          </ModalHeader>
          <ModalBody>
            {/* Deal preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-4">
              {deal.image_url && (
                <img
                  src={deal.image_url}
                  alt={deal.name}
                  className="w-14 h-14 rounded-lg object-contain bg-white dark:bg-gray-700 flex-shrink-0 p-1"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{deal.name}</p>
                <p className="text-lg font-extrabold text-orange-500 mt-0.5">${deal.price}</p>
                {deal.old_price && deal.old_price > 0 && (
                  <p className="text-xs text-gray-400 line-through">${deal.old_price}</p>
                )}
              </div>
            </div>

            {/* Share buttons */}
            <div className="space-y-2">
              <button
                onClick={shareToWhatsApp}
                className={`${btnClass} bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share on WhatsApp
              </button>

              <button
                onClick={shareToTelegram}
                className={`${btnClass} bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.668l-2.95-.924c-.64-.203-.654-.64.136-.948l11.527-4.444c.537-.194 1.006.131.609.896z"/>
                </svg>
                Share on Telegram
              </button>

              <button
                onClick={shareToTwitter}
                className={`${btnClass} bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on Twitter/X
              </button>

              <button
                onClick={shareToFacebook}
                className={`${btnClass} bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </button>

              <button
                onClick={shareToPinterest}
                className={`${btnClass} bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white`}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                Share on Pinterest
              </button>

              <button
                onClick={copyDealDetails}
                className={`${btnClass} bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300`}
              >
                {copiedDetails
                  ? <CheckIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
                  : <ClipboardIcon className="w-5 h-5 flex-shrink-0" />
                }
                {copiedDetails ? 'Copied deal details!' : 'Copy deal details'}
              </button>

              <button
                onClick={copyLink}
                className={`${btnClass} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
              >
                {copied
                  ? <CheckIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
                  : <ClipboardIcon className="w-5 h-5 flex-shrink-0" />
                }
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </ModalBody>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};

export default ShareModal;
