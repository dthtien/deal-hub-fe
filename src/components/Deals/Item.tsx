import { useState } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import { Deal } from "../../types";
import SanitizeHTML from "../SanitizeHTML";
import ShareDeal from "../ShareDeal";
import PriceAlertModal from "../PriceAlertModal";
import SaveButton from "../SaveButton";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Item = ({ deal, fetchData }: { deal: Deal, fetchData: (query: any) => void}) => {
  const [clickCount, setClickCount] = useState<number>(deal.click_count || 0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleClick = (query: {}) => fetchData(query);

  const handleGetDeal = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRedirecting) return;

    // Open window immediately on click (before any async) to avoid popup blocker
    const newWindow = window.open(deal.store_url, '_blank', 'noreferrer');

    setIsRedirecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/deals/${deal.id}/redirect`);
      const data = await response.json();

      if (data.affiliate_url && newWindow) {
        newWindow.location.href = data.affiliate_url;
        setClickCount(data.click_count || clickCount + 1);
      }
    } catch {
      // window already open with store_url as fallback — nothing to do
    } finally {
      setIsRedirecting(false);
    }
  };

  return(
    <div
      className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 my-2"
    >
      <img
        className="object-contain max-h-52 w-48 rounded-t-lg h-auto md:h-auto md:w-48 sm:rounded-none md:rounded-s-lg"
        src={deal.image_url}
        alt=""
        loading="lazy"
      />
      <div className="flex flex-col justify-between p-4 leading-normal w-full">
        <Link to={`/deals/${deal.id}`}>
          <Typography variant="h5">
            <SanitizeHTML html={deal.name} />
          </Typography>
        </Link>
        { deal.description && (
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

        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">$ {deal.price}</span>

          {
            deal.old_price &&
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300 line-through">$ {deal.old_price}</span>
          }

          {
            (deal.discount && deal.discount != 0 ) &&
            <span className="bg-red-100 text-red-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">{deal.discount}%</span>
          }
        </p>

        <div>
          {
            deal.categories.map((category: string) => (
              <p
                className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 cursor-pointer capitalize inline-block"
                onClick={() => handleClick({ categories: [category] })}
                key={category}
              >
                <SanitizeHTML html={category} />
              </p>
            ))
          }
        </div>

        {/* AI badges: deal score + price trend + best deal */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {deal.deal_score !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              deal.deal_score >= 8 ? 'bg-green-500 text-white' :
              deal.deal_score >= 5 ? 'bg-yellow-400 text-white' :
              'bg-red-400 text-white'
            }`}>
              ⭐ {deal.deal_score}/10
            </span>
          )}
          {deal.best_deal && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
              🏆 Best Price in 90 days
            </span>
          )}
          {deal.price_trend === 'down' && (
            <span className="text-xs font-semibold text-green-600">↓ Price dropping</span>
          )}
          {deal.price_trend === 'up' && (
            <span className="text-xs font-semibold text-red-500">↑ Price rising</span>
          )}
        </div>

        {/* Get Deal button + click count + alert */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleGetDeal}
            disabled={isRedirecting}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {isRedirecting ? 'Opening...' : '🛍️ Get Deal'}
          </button>

          <button
            onClick={() => setShowAlert(true)}
            className="text-xs border border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500 px-3 py-2 rounded-lg transition-colors"
            title="Set price alert"
          >
            🔔 Alert me
          </button>

          {clickCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              🔥 {clickCount} {clickCount === 1 ? 'person' : 'people'} grabbed this
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <ShareDeal deal={deal} />
          <SaveButton productId={deal.id} />
        </div>

        {showAlert && <PriceAlertModal deal={deal} onClose={() => setShowAlert(false)} />}
      </div>
    </div>
  )
}

export default Item;
