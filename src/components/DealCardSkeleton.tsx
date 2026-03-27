interface DealCardSkeletonProps {
  index?: number;
}

export default function DealCardSkeleton({ index = 0 }: DealCardSkeletonProps) {
  return (
    <div
      className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image placeholder */}
      <div className="w-40 sm:w-48 flex-shrink-0 bg-gray-100 dark:bg-gray-800 relative">
        {/* Badge area skeleton */}
        <div className="absolute top-3 left-3 h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-2.5">
        {/* Brand + store row */}
        <div className="flex gap-2 items-center">
          <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>

        {/* Quality badge area */}
        <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-md" />

        {/* Title lines */}
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />

        {/* Price skeleton - larger, orange-tinted */}
        <div className="flex items-baseline gap-2 mt-2">
          <div className="h-8 w-20 bg-orange-100 dark:bg-orange-900/20 rounded-lg" />
          <div className="h-4 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>

        {/* Button skeleton */}
        <div className="flex gap-2 mt-3">
          <div className="h-8 w-24 bg-orange-200 dark:bg-orange-900/30 rounded-xl" />
          <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
