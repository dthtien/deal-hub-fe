import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [{ label: 'Home', to: '/' }, ...items];

  // JSON-LD BreadcrumbList schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: `https://www.ozvfy.com${item.to}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
        {allItems.map((item, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRightIcon className="w-3.5 h-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600" />}
            {idx === 0 && <HomeIcon className="w-3.5 h-3.5 flex-shrink-0" />}
            {item.to && idx < allItems.length - 1 ? (
              <Link
                to={item.to}
                className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className={idx === allItems.length - 1 ? 'text-gray-800 dark:text-gray-200 font-medium' : ''}>
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
