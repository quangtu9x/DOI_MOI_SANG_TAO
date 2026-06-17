import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

interface DotDangKy {
  id: string;
  ten: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: number;
}

interface Props {
  className?: string;
  data: DotDangKy[];
}

const DotDangKyList: React.FC<Props> = ({ className, data }) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Đợt đăng ký đang mở</span>
          <span className="text-muted mt-1 fw-semibold fs-7">{data.length} đợt đang hoạt động</span>
        </h3>
      </div>
      <div className="card-body py-3">
        <div className="tab-content">
          <div className="tab-pane fade show active">
            <div className="table-responsive">
              <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                <thead>
                  <tr className="fw-bold text-muted">
                    <th className="min-w-150px">Tên đợt</th>
                    <th className="min-w-140px">Thời gian</th>
                    {/* <th className="min-w-100px text-end">Hành động</th> */}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="symbol symbol-45px me-5">
                            <span className="symbol-label bg-light-primary">
                              <i className="fa-regular fa-calendar-check text-primary fs-2x"></i>
                            </span>
                          </div>
                          <div className="d-flex justify-content-start flex-column">
                            <Link
                              to={`/nhiem-vu/dang-ky-nhiem-vu/dot-dang-ky`}
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
                            <span className="text-muted fw-semibold text-muted d-block fs-7">
                              Đang nhận hồ sơ
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column w-100 me-2">
                          <span className="text-muted fw-semibold fs-7">
                            Bắt đầu: {dayjs(item.ngayBatDau).format('DD/MM/YYYY')}
                          </span>
                          <span className="text-danger fw-semibold fs-7">
                            Kết thúc: {dayjs(item.ngayKetThuc).format('DD/MM/YYYY')}
                          </span>
                        </div>
                      </td>
                      {/* <td className="text-end">
                        <Link
                          to={`/nhiem-vu/dang-ky-nhiem-vu`}
                          className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary"
                          title="Đăng ký ngay"
                        >
                          <i className="fa-solid fa-arrow-right fs-2"></i>
                        </Link>
                      </td> */}
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">Không có đợt đăng ký nào đang mở.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DotDangKyList };
