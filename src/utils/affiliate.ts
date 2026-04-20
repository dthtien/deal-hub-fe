// Affiliate URL transformer
// Config is fetched from the backend — manage IDs via /admin/affiliate_configs

type AffiliateMap = Record<string, { param: string; value: string }>;

let affiliateConfig: AffiliateMap = {};
let configLoaded = false;

export const loadAffiliateConfig = async (): Promise<void> => {
  if (configLoaded) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/affiliate_configs`);
    if (!res.ok) return;
    const data = await res.json();
    affiliateConfig = data.affiliate_configs ?? {};
    configLoaded = true;
  } catch {
    // silently fail — links will just be non-affiliate
  }
};

const normalizeStore = (store: string): string => store.trim();

export const buildAffiliateUrl = (storeUrl: string, store: string): string => {
  const config = affiliateConfig[normalizeStore(store)];

  if (!config || !storeUrl) return storeUrl;

  try {
    const url = new URL(storeUrl);
    url.searchParams.set(config.param, config.value);
    return url.toString();
  } catch {
    return storeUrl;
  }
};
