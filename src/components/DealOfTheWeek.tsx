import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Deal } from '../types';
import { CalendarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DealOfTheWeek = () => {
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/deal_of_the_week`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setDeal(data))
      .catch(() => {});
  }, []);

  if (!deal) return null;

  const hasDiscount = deal.old_price && deal.old_price > 0 && deal.discount && deal.discount !== 0;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Image */}
        <div className="md:order-2 flex-shrink-0">
          <Link to={`/deals/${deal.id}`}>
            <img
              src={deal.image_url}
              alt={deal.name}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain bg-white/10 rounded-2xl p-4"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </Link>
        </div>

        {/* Content */}
        <div className="md:order-1 flex-1 text-white">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-6 h-6 text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-wide text-yellow-200">Deal of the Week</span>
          </div>

          <Link to={`/deals/${deal.id}`}>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-snug hover:underline line-clamp-2">
              {deal.name}
            </h2>
          </Link>

          <p className="text-sm text-white/80 mb-4">{deal.store}</p>

          {/* Price */}
          <div className="flex items-end gap-3 mb-5">
            <span className="text-4xl sm:text-5xl font-extrabold">${deal.price}</span>
            {hasDiscount && (
              <>
                <span className="text-xl text-white/50 line-through mb-1">${deal.old_price}</span>
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-lg mb-1">
                  -{deal.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* CTA */}
          <Link
            to={`/deals/${deal.id}`}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold text-sm px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            View Deal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DealOfTheWeek;
