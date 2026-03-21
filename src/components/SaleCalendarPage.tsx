import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CalendarIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface SaleEvent {
  name: string;
  startDate: string;
  endDate: string;
  stores: string[];
  description: string;
}

const SALE_EVENTS: SaleEvent[] = [
  {
    name: 'Easter Sales',
    startDate: '2026-04-18',
    endDate: '2026-04-21',
    stores: ['Myer', 'The Iconic', 'Big W', 'Kmart'],
    description:
      'Expect markdowns across fashion, homewares and chocolate gift sets. Many retailers run long-weekend flash sales.',
  },
  {
    name: 'ANZAC Day Sales',
    startDate: '2026-04-25',
    endDate: '2026-04-25',
    stores: ['JB Hi-Fi', 'The Good Guys', 'Kmart'],
    description:
      'Public-holiday one-day deals, especially on electronics and appliances.',
  },
  {
    name: "Mother's Day Sales",
    startDate: '2026-05-01',
    endDate: '2026-05-11',
    stores: ['The Iconic', 'Myer', 'ASOS', 'Culture Kings'],
    description:
      "Fashion, beauty and gifting deals ramp up in the lead-up to Mother's Day. Look for bundle offers and free shipping.",
  },
  {
    name: 'Mid-Year / EOFY Sales',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    stores: ['JB Hi-Fi', 'Myer', 'The Iconic', 'Big W', 'The Good Guys'],
    description:
      'One of the biggest sale periods in Australia. Retailers clear stock before the new financial year with deep discounts across all categories.',
  },
  {
    name: 'Amazon Prime Day (AU)',
    startDate: '2026-07-15',
    endDate: '2026-07-16',
    stores: ['Amazon AU'],
    description:
      "Amazon's exclusive member event with thousands of deals across tech, home, fashion and more. Exact dates TBD — typically mid-July.",
  },
  {
    name: "Father's Day Sales",
    startDate: '2026-08-29',
    endDate: '2026-09-07',
    stores: ['JB Hi-Fi', 'The Good Guys', 'Nike', 'Culture Kings'],
    description:
      "Deals on tech, sport and grooming gear in the lead-up to Father's Day (first Sunday in September).",
  },
  {
    name: 'Click Frenzy',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    stores: ['The Iconic', 'ASOS', 'Nike', 'Myer', 'JD Sports'],
    description:
      "Australia's own online shopping event with exclusive deals across hundreds of retailers for 53 hours.",
  },
  {
    name: 'Black Friday / Cyber Monday',
    startDate: '2026-11-27',
    endDate: '2026-12-01',
    stores: ['JB Hi-Fi', 'The Iconic', 'ASOS', 'Myer', 'Amazon AU', 'Nike'],
    description:
      'The biggest global sale event. Australian retailers now match international discounts with massive markdowns across every category.',
  },
  {
    name: 'Christmas Sales',
    startDate: '2026-12-24',
    endDate: '2026-12-26',
    stores: ['Myer', 'Big W', 'Kmart', 'The Good Guys'],
    description:
      'Last-minute gift deals and early Boxing Day previews. Many retailers start clearance pricing on Christmas Eve.',
  },
  {
    name: 'Boxing Day Sales',
    startDate: '2026-12-26',
    endDate: '2027-01-05',
    stores: ['Myer', 'JB Hi-Fi', 'The Iconic', 'Big W', 'The Good Guys'],
    description:
      "Australia's traditional post-Christmas clearance event. Expect 40-70% off across fashion, electronics and homewares.",
  },
  {
    name: 'New Year Sales',
    startDate: '2027-01-01',
    endDate: '2027-01-14',
    stores: ['The Iconic', 'ASOS', 'Nike', 'JD Sports'],
    description:
      'New-year clearance continues with fresh markdowns and "new season" promotions across fashion and sportswear.',
  },
  {
    name: "Valentine's Day Sales",
    startDate: '2027-02-07',
    endDate: '2027-02-14',
    stores: ['The Iconic', 'Myer', 'ASOS', 'Culture Kings'],
    description:
      "Gifting deals on jewellery, fashion and experiences. Retailers offer curated Valentine's gift guides with exclusive discounts.",
  },
];

function getStatus(
  startDate: string,
  endDate: string,
  today: Date
): 'ACTIVE' | 'UPCOMING' | 'PAST' {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T23:59:59');
  if (today >= start && today <= end) return 'ACTIVE';
  if (today < start) return 'UPCOMING';
  return 'PAST';
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
  };
  const startStr = start.toLocaleDateString('en-AU', opts);
  const endFull = end.toLocaleDateString('en-AU', {
    ...opts,
    year: 'numeric',
  });
  if (startDate === endDate) return endFull;
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} – ${endFull}`;
  }
  return `${startStr} – ${endFull}`;
}

function daysUntil(dateStr: string, today: Date): number {
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'ACTIVE',
    bg: 'bg-red-100 text-red-700',
    Icon: FireIcon,
    iconColor: 'text-red-500',
  },
  UPCOMING: {
    label: 'UPCOMING',
    bg: 'bg-orange-100 text-orange-700',
    Icon: ClockIcon,
    iconColor: 'text-orange-500',
  },
  PAST: {
    label: 'PAST',
    bg: 'bg-gray-100 text-gray-500',
    Icon: CheckCircleIcon,
    iconColor: 'text-gray-400',
  },
};

export default function SaleCalendarPage() {
  const today = useMemo(() => new Date(), []);

  const sortedEvents = useMemo(() => {
    return SALE_EVENTS.map((event) => ({
      ...event,
      status: getStatus(event.startDate, event.endDate, today),
    })).sort((a, b) => {
      const order = { ACTIVE: 0, UPCOMING: 1, PAST: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [today]);

  const nextUpcoming = sortedEvents.find((e) => e.status === 'UPCOMING');
  const daysToNext = nextUpcoming ? daysUntil(nextUpcoming.startDate, today) : null;

  return (
    <>
      <Helmet>
        <title>Australian Sales Calendar 2026 | OzVFY</title>
        <meta
          name="description"
          content="Never miss an Australian sale. Our 2026 sales calendar covers EOFY, Black Friday, Boxing Day and every major retail event with dates, participating stores and deal tips."
        />
      </Helmet>

      {/* Countdown banner */}
      {nextUpcoming && daysToNext !== null && (
        <div className="sticky top-0 z-30 bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2.5 px-4 text-sm font-semibold shadow-md">
          <FireIcon className="w-4 h-4 inline -mt-0.5 mr-1" />
          Next sale: <span className="underline">{nextUpcoming.name}</span> in{' '}
          <span className="bg-white/20 rounded px-1.5 py-0.5">{daysToNext} day{daysToNext !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <CalendarIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Australian Sales Calendar 2025–2026
            </h1>
          </div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Never miss a major sale — bookmark this page and check back regularly
          </p>
        </div>

        {/* Sale cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map((event) => {
            const cfg = STATUS_CONFIG[event.status];
            const StatusIcon = cfg.Icon;
            return (
              <div
                key={event.name}
                className={`rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col ${
                  event.status === 'ACTIVE' ? 'ring-2 ring-red-400' : ''
                } ${event.status === 'PAST' ? 'opacity-60' : ''}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 flex-shrink-0 ${cfg.iconColor}`} />
                    <h2 className="font-semibold text-gray-900 text-lg leading-tight">
                      {event.name}
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.bg}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Date */}
                <p className="text-sm text-gray-500 mb-2">
                  {formatDateRange(event.startDate, event.endDate)}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 flex-1">{event.description}</p>

                {/* Stores */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {event.stores.map((store) => (
                    <span
                      key={store}
                      className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5"
                    >
                      {store}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-4 py-2 transition-colors"
                >
                  Browse deals
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
