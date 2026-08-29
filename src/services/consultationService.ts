import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { fetchFilteredDoctors, getDoctorsDataset } from '../data/mockGenerator';

export const getDoctorById = async (id: string) => {
  const endpoint = ENDPOINTS.DOCTORS.BY_ID(id);
  const response = await apiClient.get(
    endpoint,
    () => {
      const all = getDoctorsDataset();
      return all.find((d: any) => d.id === id) || null;
    }
  );
  return response.data;
};

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  reset?: boolean;
  useCache?: boolean;
  timeoutMs?: number;
  bypassChaos?: boolean;
}

export interface DoctorListResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export const getDoctors = async (params: GetDoctorsParams = {}): Promise<DoctorListResponse> => {
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

  const endpoint = `${ENDPOINTS.DOCTORS.BASE}?${queryParams}`;

  const response = await apiClient.get(
    endpoint,
    () => fetchFilteredDoctors({ page, limit, search, category }),
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

export const bookConsultation = async (doctorId: string, slotId: string) => {
  const endpoint = ENDPOINTS.DOCTORS.SLOTS(doctorId);
  const response = await apiClient.post(
    endpoint,
    () => ({
      success: true,
      bookingId: `booking_${Date.now()}`,
      doctorId,
      slotId,
      bookedAt: new Date().toISOString(),
    })
  );
  return response.data;
};
