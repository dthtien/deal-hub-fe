export const TOP_CATEGORIES = [
  { label: "Women's Fashion", keywords: ['women', 'dress', 'skirt', 'bra', 'ladies'] },
  { label: "Men's Fashion", keywords: ['men', 'polo', 'suit', 'mens'] },
  { label: 'Activewear', keywords: ['active', 'sport', 'gym', 'yoga', 'running', 'set-active'] },
  { label: 'Shoes & Footwear', keywords: ['shoe', 'sneaker', 'boot', 'sandal', 'footwear'] },
  { label: 'Electronics', keywords: ['electronic', 'laptop', 'phone', 'audio', 'tv', 'gaming', 'camera'] },
  { label: 'Home & Living', keywords: ['home', 'furniture', 'kitchen', 'bedding', 'bath'] },
  { label: 'Beauty & Health', keywords: ['beauty', 'health', 'skin', 'fragrance', 'vitamin'] },
  { label: 'Bags & Accessories', keywords: ['bag', 'accessory', 'accessories', 'watch', 'jewel'] },
  { label: 'Outdoor & Sports', keywords: ['outdoor', 'camp', 'hike', 'bike', 'swim', 'fishing'] },
  { label: 'Kids & Toys', keywords: ['kid', 'toy', 'baby', 'child', 'junior'] },
];

export function normalizeCategory(raw: string): string {
  if (!raw) return 'Other';
  const lower = raw.toLowerCase().trim();
  for (const cat of TOP_CATEGORIES) {
    if (cat.keywords.some(k => lower.includes(k))) return cat.label;
  }
  return raw.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 30);
}
