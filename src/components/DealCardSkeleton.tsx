export default function DealCardSkeleton() {
  return (
    <div className="flex bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse h-36">
      {/* Image placeholder */}
      <div className="w-36 flex-shrink-0 bg-gray-100 dark:bg-gray-800" />
      {/* Content */}
      <div className="flex-1 p-4 space-y-2.5">
        <div className="flex gap-2 items-center">
          <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="h-5 w-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        <div className="flex gap-2 mt-3">
          <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
