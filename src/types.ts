export type Deal = {
  id: number,
  name: string,
  description: string,
  image_url: string,
  store: string,
  store_product_id: string,
  price: number,
  brand: string,
  categories: string[],
  store_url: string,
  updated_at: string,
  created_at: string,
  discount: number,
  old_price: number,
  click_count?: number,
  deal_score?: number,
  best_deal?: boolean,
  price_trend?: 'up' | 'down' | 'stable',
  ai_recommendation?: 'BUY_NOW' | 'GOOD_DEAL' | 'WAIT' | 'OVERPRICED',
  ai_confidence?: 'HIGH' | 'MEDIUM' | 'LOW',
  ai_reasoning_short?: string,
  expired?: boolean,
  featured?: boolean,
  tags?: string[],
  is_bundle?: boolean,
  in_stock?: boolean,
  watcher_count?: number,
  votes?: { up: number; down: number },
  price_prediction?: 'likely_to_drop' | 'recently_dropped' | null,
  expires_at?: string | null,
  drop_percent?: number,
  image_urls?: string[],
  flash_deal?: boolean,
  flash_expires_at?: string | null,
  specifications?: Record<string, string | number | boolean> | null,
  heat_index?: number,
  view_count?: number,
  share_count?: number,
  comment_count?: number,
  vote_count?: number,
  aggregate_score?: number,
  affiliate_network?: string,
  quality_score?: number,
  price_histories?: Array<{ price: number; recorded_at?: string }>,
  popularity_score?: number,
  bundle_quantity?: number,
  price_per_unit?: number | null,
  match_reason?: string,
}

type Metadata = {
  page: number,
  total_count?: number,
  total_pages?: number,
  show_next_page?: boolean
}
export type DealProps = {
  isLoading: boolean;
  data: null | ResponseProps;
  handleChangePage: (page: number) => void;
  handleFetchData: (query: {}) => void;
  viewMode?: 'grid' | 'list' | 'compact';
}

export type ResponseProps = {
  products: Deal[];
  metadata: Metadata;
}

export type QueryProps = {
  brands?: string[];
  stores?: string[];
  states?: string[];
  price?: string;
  categories?: string[];
  query?: string;
  page?: number;
  order?: { [key: string]: string };
  min_price?: number | string;
  max_price?: number | string;
  min_discount?: number | string;
  tags?: string[];
}
