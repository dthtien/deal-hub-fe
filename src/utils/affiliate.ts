// Affiliate URL transformer
// Add your Commission Factory / affiliate tracking IDs here

const AFFILIATE_CONFIG: Record<string, { param: string; value: string }> = {
  'jbhifi': { param: 'aff', value: 'YOUR_CF_ID' },
  'myer': { param: 'aff', value: 'YOUR_CF_ID' },
  'theiconic': { param: 'aff', value: 'YOUR_CF_ID' },
  'asos': { param: 'aff_source', value: 'YOUR_ASOS_AFF_ID' },
  'gluestore': { param: 'aff', value: 'YOUR_CF_ID' },
  'officeworks': { param: 'aff', value: 'YOUR_CF_ID' },
  'jdsports': { param: 'aff', value: 'YOUR_CF_ID' },
  'culturekings': { param: 'aff', value: 'YOUR_CF_ID' },
  'nike': { param: 'aff', value: 'YOUR_CF_ID' },
  'thegoodguys': { param: 'aff', value: 'YOUR_CF_ID' },
};

// Normalize store name to key
const normalizeStore = (store: string): string =>
  store.toLowerCase().replace(/[\s\-_]/g, '');

export const buildAffiliateUrl = (storeUrl: string, store: string): string => {
  const key = normalizeStore(store);
  const config = AFFILIATE_CONFIG[key];

  if (!config || !storeUrl) return storeUrl;

  try {
    const url = new URL(storeUrl);
    url.searchParams.set(config.param, config.value);
    return url.toString();
  } catch {
    return storeUrl;
  }
};
