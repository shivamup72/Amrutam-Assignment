import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { fetchFilteredProducts, getProductsDataset } from '../data/mockGenerator';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortOption?: string;
  reset?: boolean;
  useCache?: boolean;
  timeoutMs?: number;
  bypassChaos?: boolean;
}

export interface ProductListResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export const getProducts = async (params: GetProductsParams = {}): Promise<ProductListResponse> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const search = params.search || '';
  const category = params.category || '';
  const sortOption = params.sortOption || 'recommended';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: encodeURIComponent(search),
    category: encodeURIComponent(category),
    sort: sortOption,
  }).toString();

  const endpoint = `${ENDPOINTS.PRODUCTS.BASE}?${queryParams}`;

  const response = await apiClient.get(
    endpoint,
    () => fetchFilteredProducts({ page, limit, search, category, sortOption }),
    params
  );

  const resData = response.data || {};
  return {
    data: resData.data || [],
    total: resData.total || 0,
    page: resData.page || page,
    limit: resData.limit || limit,
    totalPages: resData.totalPages || 0,
    hasNextPage: Boolean(resData.hasNextPage),
  };
};

export const getProductById = async (id: string) => {
  const endpoint = ENDPOINTS.PRODUCTS.BY_ID(id);
  const response = await apiClient.get(
    endpoint,
    () => {
      const all = getProductsDataset();
      return all.find((p: any) => p.id === id) || null;
    }
  );
  return response.data;
};
