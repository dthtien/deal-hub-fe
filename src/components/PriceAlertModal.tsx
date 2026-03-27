import { useState } from 'react';
import { Deal } from '../types';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalCloseTrigger,
  Button,
} from '@heroui/react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const PriceAlertModal = ({ deal, onClose }: { deal: Deal; onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(String(Math.floor(deal.price * 0.9)));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/price_alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_alert: { email, target_price: targetPrice } })
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Modal defaultOpen onOpenChange={(open) => { if (!open) onClose(); }}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="sm">
        <ModalDialog aria-label="Set Price Alert">
          <ModalHeader>
            <ModalHeading className="flex items-center gap-2">
              <BellIcon className="w-5 h-5" />
              Price Alert
            </ModalHeading>
            <ModalCloseTrigger onClick={onClose} />
          </ModalHeader>
          <ModalBody>
            {status === 'success' ? (
              <div className="text-center py-4">
                <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-2" />
                <p className="font-semibold text-gray-900 dark:text-white">Alert set!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  We'll email you when it drops to ${targetPrice}
                </p>
              </div>
            ) : (
              <form id="alert-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{deal.name}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Current price: <span className="font-bold text-green-600 dark:text-green-400">${deal.price}</span>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-1">
                    Alert me when price drops to
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg px-3 bg-white dark:bg-gray-700">
                    <span className="text-gray-400 mr-1">$</span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                      className="flex-1 py-2 text-sm outline-none bg-transparent text-gray-900 dark:text-white"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-1">
                    Your email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    required
                  />
                </div>
                {status === 'error' && (
                  <p className="text-xs text-red-500">Something went wrong. Try again.</p>
                )}
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            {status === 'success' ? (
              <Button variant="ghost" onClick={onClose}>Close</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button
                  variant="primary"
                  type="submit"
                  form="alert-form"
                  isDisabled={status === 'loading'}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  {status === 'loading' ? 'Setting alert...' : (
                    <span className="flex items-center gap-2">
                      <BellIcon className="w-4 h-4" /> Notify Me
                    </span>
                  )}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};

export default PriceAlertModal;
