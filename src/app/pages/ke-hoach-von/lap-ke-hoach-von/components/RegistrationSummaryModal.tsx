import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Spin } from 'antd';
import { toast } from 'react-toastify';
import { getProjectRegistrationsSummary } from '@/services/annualCapitalPlan.service';
import { IProjectRegistrationsSummary } from '@/models/ke-hoach-von';

interface RegistrationSummaryModalProps {
  show: boolean;
  onHide: () => void;
  planId: string | null;
  planName?: string;
}

export const RegistrationSummaryModal: React.FC<RegistrationSummaryModalProps> = ({
  show,
  onHide,
  planId,
  planName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<IProjectRegistrationsSummary | null>(null);

  /**
   * Lấy dữ liệu thống kê khi modal mở
   */
  useEffect(() => {
    const fetchSummary = async (): Promise<void> => {
      if (!show || !planId) {
        return;
      }

      try {
        setIsLoading(true);
        const data = await getProjectRegistrationsSummary(planId);
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
        toast.error('Có lỗi xảy ra khi tải thống kê. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [show, planId]);

  /**
   * Format số tiền
   */
  const formatCurrency = (amount?: number): string => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  /**
   * Xử lý đóng modal
   */
  const handleClose = (): void => {
    setSummary(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Tổng hợp đăng ký vốn</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleClose}
        ></button>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        <Spin spinning={isLoading}>
          {planName && (
            <div className="mb-4">
              <h5 className="text-primary mb-2">Kế hoạch vốn:</h5>
              <p className="fs-5 fw-semibold">{planName}</p>
            </div>
          )}
          {summary ? (
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border border-secondary h-100">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <i className="fa-regular fa-folder-open fs-2x text-primary"></i>
                    </div>
                    <h3 className="text-primary mb-2">{summary.totalProjects}</h3>
                    <p className="text-muted mb-0">Tổng số dự án có đăng ký</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border border-secondary h-100">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <i className="fa-regular fa-file-lines fs-2x text-info"></i>
                    </div>
                    <h3 className="text-info mb-2">{summary.totalRegistrations}</h3>
                    <p className="text-muted mb-0">Tổng số đăng ký vốn</p>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="card border border-secondary">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <i className="fa-regular fa-money-bill-wave fs-2x text-success"></i>
                    </div>
                    <h3 className="text-success mb-2">
                      {formatCurrency(summary.totalRegisteredAmount)} VNĐ
                    </h3>
                    <p className="text-muted mb-0">Tổng số tiền đăng ký</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border border-success h-100">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <i className="fa-regular fa-circle-check fs-2x text-success"></i>
                    </div>
                    <h3 className="text-success mb-2">{summary.approvedCount}</h3>
                    <p className="text-muted mb-0">Số đăng ký đã phê duyệt</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border border-warning h-100">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <i className="fa-regular fa-clock fs-2x text-warning"></i>
                    </div>
                    <h3 className="text-warning mb-2">{summary.pendingCount}</h3>
                    <p className="text-muted mb-0">Số đăng ký chờ phê duyệt</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-5">
                <p className="text-muted">Không có dữ liệu thống kê</p>
              </div>
            )
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2">
        <Button className="btn-sm btn-secondary rounded-1 p-2" onClick={handleClose}>
          <i className="fa-regular fa-xmark me-2"></i>Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
