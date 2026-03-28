import { useState, useEffect, useRef } from 'react';

const TESTIMONIALS = [
  { text: 'OzVFY saved me $200 this month!', author: 'Sarah, Melbourne' },
  { text: 'Found my TV 40% cheaper here than anywhere else!', author: 'James, Sydney' },
  { text: 'Best deals site in Australia. Checking it daily!', author: 'Priya, Brisbane' },
  { text: 'Saved $85 on my new laptop. Absolutely brilliant!', author: 'Tom, Perth' },
  { text: 'Love the price alerts - never miss a deal now!', author: 'Emma, Adelaide' },
];

const ACTIVITIES = [
  { name: 'Sarah', city: 'Melbourne', amount: 45, product: 'Nike Runners' },
  { name: 'James', city: 'Sydney', amount: 120, product: 'JBL Headphones' },
  { name: 'Priya', city: 'Brisbane', amount: 67, product: 'ASOS Jacket' },
  { name: 'Tom', city: 'Perth', amount: 200, product: 'Samsung Tablet' },
  { name: 'Emma', city: 'Adelaide', amount: 35, product: 'Kmart Cookware' },
  { name: 'Liam', city: 'Canberra', amount: 89, product: 'JB Hi-Fi Earbuds' },
];

interface SocialProofBarProps {
  subscriberCount?: number;
}

export default function SocialProofBar({ subscriberCount = 0 }: SocialProofBarProps) {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [activityIdx, setActivityIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length);
        setActivityIdx(i => (i + 1) % ACTIVITIES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const testimonial = TESTIMONIALS[testimonialIdx];
  const activity = ACTIVITIES[activityIdx];
  const displayCount = subscriberCount > 0 ? subscriberCount : 12847;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl px-5 py-4 mb-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Subscriber count */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xl">🎉</span>
          <span className="text-gray-700 dark:text-gray-300">
            Join{' '}
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {displayCount.toLocaleString()}
            </span>{' '}
            deal hunters
          </span>
        </div>

        {/* Live activity */}
        <div
          className="flex items-center gap-1.5 text-sm transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <span className="text-green-500">💰</span>
          <span className="text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-800 dark:text-gray-200">{activity.name}</span>
            {' from '}{activity.city}
            {' just saved '}
            <span className="font-semibold text-green-600 dark:text-green-400">${activity.amount}</span>
            {' on '}{activity.product}
          </span>
        </div>

        {/* Testimonial */}
        <div
          className="hidden lg:flex items-center gap-2 text-sm max-w-xs transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <span className="text-yellow-400">★</span>
          <span className="text-gray-500 dark:text-gray-400 italic text-xs">
            &ldquo;{testimonial.text}&rdquo;
            <span className="not-italic font-medium text-gray-600 dark:text-gray-300 ml-1">
              — {testimonial.author}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
