import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { getNewsFeedV2, toggleThich } from '@/app/services/khoTriThucApi';
import { LoaiDoiTuong } from '@/app/models/knowledge-hub';
import type { INewsFeedV2Item, INewsFeedV2Filters } from '../types';

const PAGE_SIZE = 12;

// Mapping bắt buộc: LoaiNewsFeedItem (BE) → LoaiDoiTuong (FE, dùng cho toggleThich)
// loaiItem=0 (TaiLieu) → LoaiDoiTuong.TaiLieu=1
// loaiItem=1 (BaiViet)  → LoaiDoiTuong.BaiViet=2
const toLoaiDoiTuong = (loaiItem: number): LoaiDoiTuong =>
  loaiItem === 0 ? LoaiDoiTuong.TaiLieu : LoaiDoiTuong.BaiViet;

export interface IUseNewsFeedReturn {
  items: INewsFeedV2Item[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalCount: number;
  filters: INewsFeedV2Filters;
  goToPage: (pg: number) => void;
  setFilters: (f: INewsFeedV2Filters) => void;
  retry: () => void;
  toggleLike: (item: INewsFeedV2Item) => Promise<void>;
}

export const useNewsFeed = (): IUseNewsFeedReturn => {
  const [items, setItems] = useState<INewsFeedV2Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFiltersState] = useState<INewsFeedV2Filters>({});

  const fetchItems = useCallback(async (pg: number, f: INewsFeedV2Filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNewsFeedV2(pg, PAGE_SIZE, f.donViId, f.linhVucKHCNId);
      const paged = (res as any)?.data;
      setItems((paged?.data as INewsFeedV2Item[]) ?? []);
      setTotalPages(paged?.totalPages ?? 1);
      setTotalCount(paged?.totalCount ?? 0);
    } catch (e: any) {
      setError(e?.message ?? 'Không thể tải bảng tin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(1, {});
  }, [fetchItems]);

  const goToPage = useCallback((pg: number) => {
    setPage(pg);
    fetchItems(pg, filters);
  }, [fetchItems, filters]);

  const setFilters = useCallback((f: INewsFeedV2Filters) => {
    setFiltersState(f);
    setPage(1);
    fetchItems(1, f);
  }, [fetchItems]);

  const retry = useCallback(() => {
    fetchItems(page, filters);
  }, [fetchItems, page, filters]);

  /**
   * Optimistic like/unlike:
   * 1. Đọc trạng thái gốc từ `item` (closure snapshot) để dùng khi rollback.
   * 2. Update state ngay lập tức (optimistic).
   * 3. Gọi API.
   * 4. Nếu thất bại → rollback về giá trị gốc từ closure.
   * 5. Nếu thành công → đồng bộ lại giá trị authoritative từ API (tránh lệch khi race condition).
   *
   * Deps [] vì item là tham số — hàm không capture state, chỉ dùng setItems updater form.
   */
  const toggleLike = useCallback(async (item: INewsFeedV2Item) => {
    const expectedLiked = !item.daThich;

    // Bước 1 — Optimistic update
    setItems(prev => prev.map(i => i.id === item.id
      ? { ...i, daThich: expectedLiked, soLuotThich: Math.max(0, i.soLuotThich + (expectedLiked ? 1 : -1)) }
      : i
    ));

    try {
      const res = await toggleThich({ loaiDoiTuong: toLoaiDoiTuong(item.loaiItem), doiTuongId: item.id });
      const result = (res as any)?.data; // IResult<boolean>

      // Bước 2a — API trả lỗi nghiệp vụ
      if (result?.succeeded === false) {
        setItems(prev => prev.map(i => i.id === item.id
          ? { ...i, daThich: item.daThich, soLuotThich: item.soLuotThich }
          : i
        ));
        message.warning('Thao tác không thành công');
        return;
      }

      // Bước 2b — Đồng bộ với kết quả authoritative (xử lý race condition)
      const actuallyLiked: boolean = Boolean(result?.data);
      if (actuallyLiked !== expectedLiked) {
        // Optimistic sai → sửa lại từ giá trị gốc (item.soLuotThich từ closure)
        setItems(prev => prev.map(i => i.id === item.id
          ? { ...i, daThich: actuallyLiked, soLuotThich: Math.max(0, item.soLuotThich + (actuallyLiked ? 1 : -1)) }
          : i
        ));
      }
    } catch {
      // Bước 3 — Network/server error → rollback
      setItems(prev => prev.map(i => i.id === item.id
        ? { ...i, daThich: item.daThich, soLuotThich: item.soLuotThich }
        : i
      ));
      message.error('Lỗi khi thích / bỏ thích');
    }
  }, []);

  return { items, loading, error, page, totalPages, totalCount, filters, goToPage, setFilters, retry, toggleLike };
};
