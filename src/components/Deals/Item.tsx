import { useState } from 'react';
import { Typography } from "@material-tailwind/react";
import { Deal } from "../../types";
import SanitizeHTML from "../SanitizeHTML";
import PriceAlertModal from "../PriceAlertModal";
import PriceHistoryChart from "../PriceHistoryChart";
import { buildAffiliateUrl } from "../../utils/affiliate";

const Item = ({ deal, fetchData }: { deal: Deal, fetchData: (query: any) => void }) => {
  const [showAlert, setShowAlert] = useState(false);
  const handleClick = (query: {}) => fetchData(query);

  const affiliateUrl = buildAffiliateUrl(deal.store_url, deal.store);

  return (
    <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 my-2">
      <img
        className="object-contain max-h-52 w-48 rounded-t-lg h-auto md:h-auto md:w-48 sm:rounded-none md:rounded-s-lg"
        src={deal.image_url}
        alt=""
        loading="lazy"
      />
      <div className="flex flex-col justify-between p-4 leading-normal w-full">
        <a href={affiliateUrl} target="_blank" rel="noreferrer">
          <Typography variant="h5">
            <SanitizeHTML html={deal.name} />
          </Typography>
        </a>

        {deal.description && (
          <Typography className="font-normal text-gray-700 dark:text-gray-400">
            {deal.description}
          </Typography>
        )}

        <Typography className="mb-0 mt-1 font-normal text-gray-700 dark:text-gray-400 italic">
          First seen at: <strong>{deal.created_at}</strong>
        </Typography>

        <Typography className="mb-3 font-normal text-gray-700 dark:text-gray-400 italic">
          Last updated at: <strong>{deal.updated_at}</strong>
        </Typography>

        <div className="flex align-middle">
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            <span
              className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300 cursor-pointer"
              onClick={() => handleClick({ brands: [deal.brand] })}
            >
              <SanitizeHTML html={deal.brand.toUpperCase()} />
            </span>
          </p>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            <span
              className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 cursor-pointer"
              onClick={() => handleClick({ stores: [deal.store] })}
            >
              {deal.store}
            </span>
          </p>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
            $ {deal.price}
          </span>

          {deal.old_price && (
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300 line-through">
              $ {deal.old_price}
            </span>
          )}

          {deal.discount && deal.discount !== 0 && (
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
              -{deal.discount}% OFF
            </span>
          )}

          {/* Price alert button */}
          <button
            onClick={() => setShowAlert(true)}
            className="ml-auto text-xs text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 flex items-center gap-1 transition-colors"
            title="Set price drop alert"
          >
            🔔 Alert me
          </button>
        </div>

        {/* Categories */}
        <div>
          {deal.categories.map((category: string) => (
            <p
              className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 cursor-pointer capitalize inline-block"
              onClick={() => handleClick({ categories: [category] })}
              key={category}
            >
              <SanitizeHTML html={category} />
            </p>
          ))}
        </div>

        {/* Price history chart */}
        <PriceHistoryChart productId={deal.id} currentPrice={deal.price} />
      </div>

      {/* Price alert modal */}
      {showAlert && (
        <PriceAlertModal deal={deal} onClose={() => setShowAlert(false)} />
      )}
    </div>
  );
};

export default Item;
