import React, { useState, useEffect } from 'react';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { requestPOST } from '@/utils/baseAPI';
import { useNewsFeed } from './hooks/useNewsFeed';
import { NewsFeedList } from './components/NewsFeedList';
import { NewsFeedFilters } from './components/NewsFeedFilters';

interface ILinhVucOption { id: string; ten: string; }
interface IDonViOption   { id: string; name: string; }

// Unwrap API response: AxiosResponse → IPagination → data[]
const safeList = <T,>(res: any): T[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const NewsFeedV2Page: React.FC = () => {
  const {
    items, loading, error,
    page, totalPages, totalCount,
    filters, goToPage, setFilters, retry, toggleLike,
  } = useNewsFeed();

  const [linhVucOptions, setLinhVucOptions] = useState<ILinhVucOption[]>([]);
  const [donViOptions, setDonViOptions]     = useState<IDonViOption[]>([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [lvRes, dvRes] = await Promise.allSettled([
        requestPOST<any>('LinhVucKHCNs/search', { pageNumber: 1, pageSize: 200 }),
        requestPOST<any>('OrganizationUnits/search', { pageNumber: 1, pageSize: 200 }),
      ]);
      if (lvRes.status === 'fulfilled')
        setLinhVucOptions(safeList<any>(lvRes.value).map((x: any) => ({ id: x.id, ten: x.ten ?? x.name ?? '' })));
      if (dvRes.status === 'fulfilled')
        setDonViOptions(safeList<any>(dvRes.value).map((x: any) => ({ id: x.id, name: x.name ?? x.ten ?? '' })));
      setFilterOptionsLoading(false);
    })();
  }, []);

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>
        Bảng tin
      </PageTitle>

      <Content>
        {/* Hero header — pattern từ CongDongPage / ThuVienTaiLieuPage */}
        <div
          className="mb-5 overflow-hidden shadow-sm"
          style={{
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #3b82f6 100%)',
            backgroundColor: '#0f172a',
            borderRadius: 12,
          }}
        >
          <div className="d-flex align-items-center gap-4 px-6 py-6">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <i className="fa-regular fa-newspaper fs-2" style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 className="mb-1" style={{ color: '#fff' }}>Bảng tin ĐMST</h3>
              <span className="fs-7" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Tài liệu mới · Bài viết nổi bật · Cập nhật từ cộng đồng
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <NewsFeedFilters
          linhVucOptions={linhVucOptions}
          donViOptions={donViOptions}
          filters={filters}
          loading={filterOptionsLoading}
          onChange={setFilters}
        />

        {/* Error state */}
        {error && !loading && (
          <div className="alert alert-danger d-flex align-items-center gap-3 mb-4">
            <i className="fa-regular fa-circle-exclamation fs-4 flex-shrink-0" />
            <div className="flex-grow-1">
              <div className="fw-semibold">Không thể tải bảng tin</div>
              <div className="fs-7 text-muted">{error}</div>
            </div>
            <button className="btn btn-sm btn-light-danger" onClick={retry}>
              Thử lại
            </button>
          </div>
        )}

        {/* Feed */}
        {!error && (
          <NewsFeedList
            items={items}
            loading={loading}
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            goToPage={goToPage}
            onLike={toggleLike}
          />
        )}
      </Content>
    </>
  );
};
