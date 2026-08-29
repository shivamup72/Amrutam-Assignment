import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { fetchFilteredHealthRecords, getHealthRecordsDataset } from '../data/mockGenerator';

export interface GetHealthRecordsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  reset?: boolean;
  useCache?: boolean;
  timeoutMs?: number;
  bypassChaos?: boolean;
}

export interface HealthRecordListResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export const getHealthRecords = async (params: GetHealthRecordsParams = {}): Promise<HealthRecordListResponse> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const search = params.search || '';
  const category = params.category || '';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: encodeURIComponent(search),
    category: encodeURIComponent(category),
  }).toString();

  const endpoint = `${ENDPOINTS.HEALTH_RECORDS.BASE}?${queryParams}`;

  const response = await apiClient.get(
    endpoint,
    () => fetchFilteredHealthRecords({ page, limit, search, category }),
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

export const getHealthRecordById = async (id: string) => {
  const endpoint = ENDPOINTS.HEALTH_RECORDS.BY_ID(id);
  const response = await apiClient.get(
    endpoint,
    () => {
      const all = getHealthRecordsDataset();
      return all.find((r: any) => r.id === id) || null;
    }
  );
  return response.data;
};
