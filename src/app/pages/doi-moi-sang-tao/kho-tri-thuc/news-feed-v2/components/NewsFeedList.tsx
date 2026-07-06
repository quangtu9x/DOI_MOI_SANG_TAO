import React from 'react';
import { Spin, Empty, Button } from 'antd';
import type { INewsFeedV2Item } from '../types';
import { NewsFeedCard } from './NewsFeedCard';

interface Props {
  items: INewsFeedV2Item[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  goToPage: (pg: number) => void;
  onLike: (item: INewsFeedV2Item) => void;
}

export const NewsFeedList: React.FC<Props> = ({
  items, loading, page, totalPages, totalCount, goToPage, onLike,
}) => (
  <Spin spinning={loading}>
    {/* Min-height để spinner hiển thị đúng khi không có items */}
    <div style={{ minHeight: loading && items.length === 0 ? 240 : undefined }}>

      {/* Summary */}
      {items.length > 0 && (
        <div className="d-flex align-items-center mb-4">
          <span className="badge badge-light-primary fs-8">{totalCount} bản ghi</span>
          <span className="text-muted fs-8 ms-2">· Trang {page} / {Math.max(1, totalPages)}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <Empty
            className="py-10"
            description={
              <div>
                <div className="fw-semibold text-gray-700 mb-1">Không có nội dung nào</div>
                <div className="text-muted fs-8">
                  Bảng tin chưa có bài đăng nào phù hợp với tiêu chí lọc
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* Card list — pattern từ CongDongPage.renderPostCard */}
      {items.length > 0 && (
        <div>{items.map(item => <NewsFeedCard key={item.id} item={item} onLike={onLike} />)}</div>
      )}

      {/* Pagination — pattern từ ThuVienTaiLieuPage */}
      {totalPages > 1 && !loading && (
        <div className="d-flex justify-content-center mt-4 gap-2">
          <Button
            size="small"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            icon={<i className="fa-regular fa-chevron-left" />}
          />
          <span className="align-self-center fs-7">Trang {page} / {totalPages}</span>
          <Button
            size="small"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            icon={<i className="fa-regular fa-chevron-right" />}
          />
        </div>
      )}
    </div>
  </Spin>
);
