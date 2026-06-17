import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IHoanThienHoSo, LoaiNhiemVu, LoaiHoanThienHoSo } from '@/models';
import { SearchData } from '@/types';
import { AppDispatch, RootState } from '@/redux/Store';

interface UseDataTableProps {
  searchData?: SearchData;
  initialPageSize?: number;
}

export const useRaSoatKHCNTable = ({ searchData, initialPageSize = 50 }: UseDataTableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [data, setData] = useState<IHoanThienHoSo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestPOST<IPaginationResponse<IHoanThienHoSo[]>>('HoanThienHoSos/search', {
        pageNumber: currentPage,
        pageSize,
        ...searchData,
        loaiNhiemVu: LoaiNhiemVu.KhoaHocCongNghe,
        loaiHoanThienHoSo: LoaiHoanThienHoSo.RaSoat
      });

      if (response.data) {
        const { data: responseData, totalCount: total } = response.data;
        setData(responseData ?? []);
        setTotalCount(total);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, random]);

  return {
    data,
    loading,
    totalCount,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    refresh: fetchData,
  };
};
