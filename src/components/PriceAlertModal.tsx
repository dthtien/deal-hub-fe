import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { BellIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface AlertSuggestion {
  label: string;
  price: number;
  confidence: string | null;
}
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

const AnimatedCheckmark = () => (
  <svg
    className="w-16 h-16 mx-auto mb-3"
    viewBox="0 0 52 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="stroke-green-500"
      cx="26" cy="26" r="24"
      strokeWidth="2"
      fill="none"
      style={{
        strokeDasharray: '166',
        strokeDashoffset: '166',
        animation: 'dash-circle 0.6s ease-in-out forwards',
      }}
    />
    <path
      className="stroke-green-500"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 27l8 8 16-16"
      style={{
        strokeDasharray: '48',
        strokeDashoffset: '48',
        animation: 'dash-check 0.4s 0.5s ease-in-out forwards',
      }}
    />
    <style>{`
      @keyframes dash-circle {
        to { stroke-dashoffset: 0; }
      }
      @keyframes dash-check {
        to { stroke-dashoffset: 0; }
      }
    `}</style>
  </svg>
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PriceAlertModal = ({ deal, onClose }: { deal: Deal; onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(String(Math.floor(deal.price * 0.9)));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [alreadyMet, setAlreadyMet] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [suggestions, setSuggestions] = useState<AlertSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/alert_suggestions`);
      if (!res.ok) return;
      const data = await res.json();
      const top3 = (data.suggestions as AlertSuggestion[])
        .filter((s) => s.price < deal.price && s.price > 0)
        .slice(0, 3);
      setSuggestions(top3);
    } catch {
      // silently ignore
    }
  }, [deal.id, deal.price]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Auto-dismiss after 3 seconds on success (non-alreadyMet)
  useEffect(() => {
    if (status === 'success' && !alreadyMet) {
      const t = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(t);
    }
  }, [status, alreadyMet, onClose]);

  const validate = (): boolean => {
    let valid = true;
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }
    const tp = parseFloat(targetPrice);
    if (isNaN(tp) || tp <= 0) {
      setPriceError('Please enter a valid price');
      valid = false;
    } else if (tp >= deal.price) {
      setPriceError(`Target price must be less than current price ($${deal.price.toFixed(2)})`);
      valid = false;
    } else {
      setPriceError('');
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/deals/${deal.id}/price_alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_alert: { email, target_price: targetPrice } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setAlreadyMet(data.already_met === true);
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
                {alreadyMet ? (
                  <>
                    <SparklesIcon className="w-12 h-12 mx-auto text-orange-500 mb-2" />
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      Price already met!
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Current price (${deal.price}) is at or below your target (${targetPrice}).
                    </p>
                    <Link
                      to={`/deals/${deal.id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Check the deal now &rarr;
                    </Link>
                  </>
                ) : (
                  <>
                    <AnimatedCheckmark />
                    <p className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                      Alert set!
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      We'll email you when{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {deal.name.length > 40 ? deal.name.slice(0, 40) + '...' : deal.name}
                      </span>{' '}
                      drops to{' '}
                      <span className="font-bold text-green-600 dark:text-green-400">${targetPrice}</span>
                    </p>
                    <Link
                      to="/notifications"
                      onClick={onClose}
                      className="inline-flex items-center gap-1 mt-4 text-sm text-orange-500 hover:underline font-medium"
                    >
                      Manage alerts &rarr;
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      Closing in a moment...
                    </p>
                  </>
                )}
              </div>
            ) : (
              <form id="alert-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{deal.name}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Current price: <span className="font-bold text-green-600 dark:text-green-400">${deal.price}</span>
                  </p>
                </div>
                {suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Smart suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setTargetPrice(String(s.price));
                            setPriceError('');
                            setActiveSuggestion(i);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            activeSuggestion === i
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40'
                          }`}
                        >
                          {s.label} ${s.price}
                        </button>
                      ))}
                    </div>
                    {activeSuggestion !== null && suggestions[activeSuggestion]?.confidence && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        {suggestions[activeSuggestion].confidence}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-1">
                    Alert me when price drops to
                  </label>
                  <div className={`flex items-center border rounded-lg px-3 bg-white dark:bg-gray-700 ${priceError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`}>
                    <span className="text-gray-400 mr-1">$</span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={e => { setTargetPrice(e.target.value); setPriceError(''); }}
                      className="flex-1 py-2 text-sm outline-none bg-transparent text-gray-900 dark:text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {priceError && <p className="text-xs text-red-500 mt-1">{priceError}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-1">
                    Your email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="you@email.com"
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 ${emailError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                  />
                  {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                </div>
                {status === 'error' && (
                  <p className="text-xs text-red-500">Something went wrong. Try again.</p>
                )}
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            {status === 'success' ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/notifications"
                  onClick={onClose}
                  className="text-sm text-orange-500 hover:underline"
                >
                  My Alerts
                </Link>
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </div>
            ) : (
              <>
                <Link
                  to="/notifications"
                  onClick={onClose}
                  className="text-sm text-orange-500 hover:underline mr-auto"
                >
                  My Alerts
                </Link>
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
