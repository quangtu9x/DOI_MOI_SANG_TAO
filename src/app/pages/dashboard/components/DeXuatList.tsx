import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

interface DeXuat {
  id: string;
  ten: string;
  chuyenGiaHoTen?: string;
  createdOn: string;
  trangThai: number;
}

interface Props {
  className?: string;
  data: DeXuat[];
}

const DeXuatList: React.FC<Props> = ({ className, data }) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Đề xuất mới nhất</span>
          <span className="text-muted mt-1 fw-semibold fs-7">Chờ phê duyệt</span>
        </h3>
      </div>
      <div className="card-body py-3">
        <div className="table-responsive">
          <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr className="fw-bold text-muted">
                <th className="min-w-150px">Tên đề xuất</th>
                <th className="min-w-120px">Người đề xuất</th>
                <th className="min-w-100px text-end">Ngày gửi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="symbol symbol-45px me-5">
                        <span className="symbol-label bg-light-warning">
                          <i className="fa-regular fa-file-signature text-warning fs-2x"></i>
                        </span>
                      </div>
                      <div className="d-flex justify-content-start flex-column">
                        <Link
                          to={`/nhiem-vu/dang-ky-nhiem-vu/de-xuat-de-tai`}
                          className="text-dark fw-bold text-hover-primary fs-6"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.ten}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-dark fw-bold d-block fs-6">
                      {item.chuyenGiaHoTen || '-'}
                    </span>
                  </td>
                  <td className="text-end">
                    <span className="text-muted fw-semibold d-block fs-7">
                      {dayjs(item.createdOn).format('DD/MM/YYYY')}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">Không có đề xuất nào đang chờ duyệt.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { DeXuatList };
