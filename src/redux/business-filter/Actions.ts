import { AppDispatch } from '../Store';
import { setCurrentBusiness, setLoading, setError } from './Slice';
import { requestGET } from '@/utils/baseAPI';
import { IChuyenGia, IResult } from '@/models';

// Cache để tránh fetch duplicate
const businessCache = new Map<string, IChuyenGia>();
const pendingRequests = new Map<string, Promise<IChuyenGia | null>>();

export const fetchBusinessById = (businessId: string) => async (dispatch: AppDispatch): Promise<IChuyenGia | null> => {
  // Kiểm tra cache trước
  if (businessCache.has(businessId)) {
    const cachedBusiness = businessCache.get(businessId)!;
    dispatch(setCurrentBusiness(cachedBusiness));
    return cachedBusiness;
  }

  // Kiểm tra pending request
  if (pendingRequests.has(businessId)) {
    return await pendingRequests.get(businessId)!;
  }

  const fetchPromise = (async (): Promise<IChuyenGia | null> => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const response = await requestGET<IResult<IChuyenGia>>(`chuyengias/${businessId}`);
      
      // Kiểm tra response status
      if (response?.status !== 200) {
        let errorMsg = response?.data?.message || 'Không thể tải thông tin người nghiên cứu khoa học.';
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg.join(', ');
        }
        dispatch(setError(errorMsg));
        return null;
      }

      const data = response?.data?.data ?? null;

      if (data) {
        // Lưu vào cache
        businessCache.set(businessId, data);
        dispatch(setCurrentBusiness(data));
        return data;
      } else {
        dispatch(setError('Không tìm thấy thông tin người nghiên cứu khoa học.'));
        return null;
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      const errorMsg = error instanceof Error ? error.message : 'Lỗi khi tải thông tin người nghiên cứu khoa học.';
      dispatch(setError(errorMsg));
      return null;
    } finally {
      dispatch(setLoading(false));
      pendingRequests.delete(businessId);
    }
  })();

  pendingRequests.set(businessId, fetchPromise);
  return await fetchPromise;
};

// Clear cache khi update business
export const clearBusinessCache = (businessId?: string) => {
  if (businessId) {
    businessCache.delete(businessId);
  } else {
    businessCache.clear();
  }
};

// Action để force refresh
export const refreshBusiness = (businessId: string) => async (dispatch: AppDispatch): Promise<IChuyenGia | null> => {
  clearBusinessCache(businessId);
  return await dispatch(fetchBusinessById(businessId));
};