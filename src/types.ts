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
}

type Metadata = {
  page: number,
  total_count: number,
  total_pages: number,
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

