import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Form, Spin, Input } from 'antd';
import { toast } from 'react-toastify';
import { IPaginationResponse, IResult, TrangThaiHoSoSangKien, IHoiDongSangKien } from '@/models';
import { requestPOST, requestPUT } from '@/utils/baseAPI';
import { TDTable } from '@/app/components';
import { toViewDateString } from '@/utils/utils';

interface Props {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedIds: React.Key[];
}

export const TransferHoiDongModal: React.FC<Props> = ({ show, onClose, onSuccess, selectedIds }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState<IHoiDongSangKien[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [keyword, setKeyword] = useState("");
  const [selectedCouncil, setSelectedCouncil] = useState<IHoiDongSangKien | null>(null);

  const fetchCouncils = useCallback(async (page = 1, kw = "") => {
    try {
      setIsFetching(true);
      const res = await requestPOST<IPaginationResponse<IHoiDongSangKien[]>>(`HoiDongDanhGias/search`, {
        pageNumber: page,
        pageSize: pagination.pageSize,
        keyword: kw,
      });
      if (res.data) {
        setData(res.data.data ?? []);
        setPagination(prev => ({ ...prev, current: page, total: res.data?.totalCount ?? 0 }));
      }
    } catch (error) {
      console.error("Error fetching councils:", error);
    } finally {
      setIsFetching(false);
    }
  }, [pagination.pageSize]);

  useEffect(() => {
    if (show) {
      fetchCouncils(1, "");
    }
  }, [show, fetchCouncils]);

  const handleFinish = async () => {
    if (!selectedCouncil) {
      toast.warning('Vui lòng chọn một hội đồng!');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ids: selectedIds,
        trangThai: TrangThaiHoSoSangKien.DangThamDinh,
        hoiDongDanhGiaId: selectedCouncil.id,
      };

      const response = await requestPUT<IResult<any>>('HoSoSangKiens/trang-thai-multi', payload);

      if (response?.status === 200) {
        toast.success('Chuyển cho hội đồng đánh giá thành công!');
        onSuccess();
        onClose();
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(pagination.current - 1) * pagination.pageSize + index + 1}</div>,
    },
    {
      title: 'Tên hội đồng',
      dataIndex: 'ten',
      key: 'ten',
      render: (text) => <span className="fw-bold">{text}</span>
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'ngayThanhLap',
      key: 'ngayThanhLap',
      className: 'text-center',
      width: '20%',
      render: data => toViewDateString(data),
    },
    {
      title: 'Số thành viên',
      dataIndex: 'thanhViens',
      key: 'thanhViens',
      className: 'text-center',
      width: '15%',
      render: d => d ? d.length : 0,
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      key: 'moTa',
      className: 'text-left',
    },
  ];

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setKeyword(val);
    fetchCouncils(1, val);
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chuyển cho hội đồng đánh giá</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        <div className="card-body px-0 py-0">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="btn-group w-400px">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Tìm kiếm hội đồng..."
                onChange={handleKeywordChange}
              />
            </div>
          </div>
          <div className="card-dashboard-body table-responsive">
            <TDTable<IHoiDongSangKien>
              dataSource={data}
              columns={columns}
              isPagination={true}
              pageSize={pagination.pageSize}
              count={pagination.total}
              offset={pagination.current}
              setOffset={page => fetchCouncils(page, keyword)}
              setPageSize={size => setPagination(prev => ({ ...prev, pageSize: size }))}
              loading={isFetching || loading}
              rowSelection={{
                type: 'radio',
                onChange: (keys, rows) => setSelectedCouncil(rows[0]),
                selectedRowKeys: selectedCouncil ? [selectedCouncil.id] : []
              }}
            />
          </div>
          <p className="text-muted small mt-3 mb-0">
            <i className="fa-regular fa-circle-info me-1"></i>
            Hành động này sẽ chuyển <b>{selectedIds.length}</b> hồ sơ đã chọn sang trạng thái "Đang thẩm định".
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="px-4 py-3">
        <Button className="btn-sm btn-secondary rounded-1" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button className="btn-sm btn-primary rounded-1" onClick={handleFinish} disabled={loading}>
          Xác nhận chuyển
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
