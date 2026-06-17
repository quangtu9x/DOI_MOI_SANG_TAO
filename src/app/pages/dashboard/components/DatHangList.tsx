import React from 'react';
import { Link } from 'react-router-dom';

interface DatHang {
  id: string;
  ten: string;
  donVi?: string;
  trangThai: number;
}

interface Props {
  className?: string;
  data: DatHang[];
}

const DatHangList: React.FC<Props> = ({ className, data }) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Đề xuất đặt hàng</span>
          <span className="text-muted mt-1 fw-semibold fs-7">Đang chờ xử lý</span>
        </h3>
      </div>
      <div className="card-body py-3">
        <div className="table-responsive">
          <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr className="fw-bold text-muted">
                <th className="min-w-150px">Tên nhiệm vụ đặt hàng</th>
                <th className="min-w-120px">Đơn vị</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="symbol symbol-45px me-5">
                        <span className="symbol-label bg-light-danger">
                          <i className="fa-regular fa-cart-shopping-fast text-danger fs-2x"></i>
                        </span>
                      </div>
                      <div className="d-flex justify-content-start flex-column">
                        <Link
                          to={`/nhiem-vu/dang-ky-nhiem-vu/dat-hang-nhiem-vu`}
                          className="text-dark fw-bold text-hover-primary fs-6"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
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
                    <span className="text-muted fw-semibold d-block fs-7"
                      style={{
                        width: '100%',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                      {item.donVi || '-'}
                    </span>
                  </td>
                  {/* <td className="text-end">
                    <Link
                      to={`/nhiem-vu/dat-hang/${item.id}`}
                      className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary"
                    >
                      <i className="fa-solid fa-eye fs-2"></i>
                    </Link>
                  </td> */}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">Không có đề xuất đặt hàng nào mới.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { DatHangList };
