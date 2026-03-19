import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Deal } from '../../types';
import Item from './Item';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DealShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/deals/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setDeal(data);
        // Update page title + meta for SEO
        document.title = `${data.name} – $${data.price} at ${data.store} | OzVFY`;
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', `${data.name} on sale for $${data.price}${data.old_price ? ` (was $${data.old_price})` : ''} at ${data.store}. Find the best deals at OzVFY.`);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading deal...</div>;
  if (!deal) return null;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4 hover:text-gray-700">← Back to deals</button>
      <Item deal={deal} fetchData={() => {}} />
    </div>
  );
};

export default DealShow;
