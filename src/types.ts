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
}

export type ResponseProps = {
  products: Deal[];
  metadata: Metadata;
}

export type QueryProps = {
  brands?: string[];
  stores?: string[];
  price?: string;
  categories?: string[];
  query?: string;
  page?: number;
  order?: { [key: string]: string };
}
