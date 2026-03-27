import { useState } from 'react';
import { Deal } from '../types';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
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
    <Modal isOpen onClose={onClose} size="sm" classNames={{ backdrop: "bg-black/50" }}>
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <BellIcon className="w-5 h-5" />
              Price Alert
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
                  <Input
                    type="number"
                    label="Alert me when price drops to"
                    value={targetPrice}
                    onValueChange={setTargetPrice}
                    startContent={<span className="text-gray-400">$</span>}
                    min={0}
                    step={0.01}
                    isRequired
                    size="sm"
                  />
                  <Input
                    type="email"
                    label="Your email"
                    placeholder="you@email.com"
                    value={email}
                    onValueChange={setEmail}
                    isRequired
                    size="sm"
                  />
                  {status === 'error' && (
                    <p className="text-xs text-red-500">Something went wrong. Try again.</p>
                  )}
                </form>
              )}
            </ModalBody>
            <ModalFooter>
              {status === 'success' ? (
                <Button variant="light" color="warning" onPress={onModalClose}>Close</Button>
              ) : (
                <>
                  <Button variant="light" onPress={onModalClose}>Cancel</Button>
                  <Button
                    color="warning"
                    type="submit"
                    form="alert-form"
                    isLoading={status === 'loading'}
                    startContent={status !== 'loading' ? <BellIcon className="w-4 h-4" /> : undefined}
                  >
                    Notify Me
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PriceAlertModal;
