import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Spin } from 'antd';
import type { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';

import { FILE_URL, requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';
import { TDTable } from '@/app/components';
import { isUrl } from '@/utils/utils';

interface LichSuSangKienItem {
  id: string;
  hoSoSangKienId: string;
  nguoiThaoTacId?: string | null;
  tenNguoiThaoTac?: string | null;
  thaoTac?: string | number | null;
  yKien?: string | null;
  dinhKem?: string | null;
  createdOn?: string | null;
}

interface LichSuSangKienModalProps {
  show: boolean;
  hoSoSangKienId?: string | null;
  onClose: () => void;
}

export const LichSuSangKienModal: React.FC<LichSuSangKienModalProps> = ({ show, hoSoSangKienId, onClose }) => {
  const [data, setData] = useState<LichSuSangKienItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getThaoTacXuLyLabel = useCallback((value: unknown): string => {
    const num = typeof value === 'string' ? Number(value) : (value as number);
    if (!num || Number.isNaN(num)) return '-';

    switch (num) {
      case 1:
        return 'Đang soạn thảo';
      case 2:
        return 'Chờ tiếp nhận';
      case 3:
        return 'Yêu cầu bổ sung';
      case 4:
        return 'Tiếp nhận';
      case 5:
        return 'Từ chối tiếp nhận';
      case 6:
        return 'Được công nhận';
      case 7:
        return 'Gửi đánh giá';
      case 8:
        return 'Yêu cầu bổ sung đánh giá';
      case 9:
        return 'Từ chối đánh giá';
      case 10:
        return 'Đang thẩm định';
      case 11:
        return 'Không công nhận';
      case 12:
        return 'Thu hồi tiếp nhận';
      case 13:
        return 'Thu hồi đánh giá';
      case 14:
        return 'Cập nhật';
      default:
        return '-';
    }
  }, []);

  const getFileIconClass = useCallback((extension?: string): string => {
    const ext = (extension || '').toLowerCase();
    switch (ext) {
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'fa-file-excel';
      case 'ppt':
      case 'pptx':
        return 'fa-file-powerpoint';
      case 'pdf':
        return 'fa-file-pdf';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return 'fa-file-image';
      default:
        return 'fa-file';
    }
  }, []);

  const renderDinhKemCell = useCallback(
    (value: string | null | undefined) => {
      if (!value) return '-';

      const parts = value
        .split('##')
        .map(s => s.trim())
        .filter(Boolean)
        .map(p => p.replace(/\.+$/, '')); // số trường hợp backend trả về path kết thúc bằng dấu '.'

      if (parts.length === 0) return '-';

      return (
        <div className="d-flex flex-wrap">
          {parts.map((path, idx) => {
            const fileName = path.split('/').filter(Boolean).pop() || path;
            const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
            const iconClass = getFileIconClass(extension);
            const href = isUrl(path) ? path : `${FILE_URL}${path}`;

            return (
              <a
                key={`${path}-${idx}`}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="d-inline-flex align-items-center me-3 mb-1 text-decoration-none"
                title={fileName}
              >
                <i className={`fa-regular ${iconClass} me-2`} />
                <span className="text-truncate" style={{ maxWidth: 180 }}>
                  {fileName}
                </span>
              </a>
            );
          })}
        </div>
      );
    },
    [FILE_URL, getFileIconClass]
  );

  const fetchData = useCallback(async () => {
    if (!show || !hoSoSangKienId) return;

    setLoading(true);
    try {
      const response = await requestPOST<IPaginationResponse<LichSuSangKienItem[]>>('lichsusangkiens/search', {
        pageNumber: currentPage,
        pageSize,
        hoSoId: hoSoSangKienId,
      });

      if (response?.status === 200 && response.data) {
        const { data: responseData, totalCount: total } = response.data;
        setData(responseData ?? []);
        setTotalCount(total ?? 0);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching lich su sang kien:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [show, hoSoSangKienId, currentPage, pageSize]);

  useEffect(() => {
    if (!show) return;
    setCurrentPage(1);
  }, [show, hoSoSangKienId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: TableProps<LichSuSangKienItem>['columns'] = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'index',
        key: 'index',
        width: 50,
        className: 'text-center',
        render: (_: unknown, _record: LichSuSangKienItem, index: number) => (
          <div>{(currentPage - 1) * pageSize + index + 1}</div>
        ),
      },
      {
        title: 'Thao tác xử lý',
        dataIndex: 'thaoTac',
        key: 'thaoTac',
        width: 220,
        render: (value: string | number | null | undefined) => getThaoTacXuLyLabel(value),
      },
      {
        title: 'Thời gian',
        dataIndex: 'createdOn',
        key: 'createdOn',
        width: 180,
        render: (text: string | null | undefined) => (
          <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm:ss') : '-'}</div>
        ),
      },
      {
        title: 'Người thao tác',
        dataIndex: 'tenNguoiThaoTac',
        key: 'tenNguoiThaoTac',
        width: 200,
        render: (text: string | null | undefined) => text || '-',
      },
      {
        title: 'Ý kiến',
        dataIndex: 'yKien',
        key: 'yKien',
        width: 260,
        render: (text: string | null | undefined) => (
          <div className="text-wrap" style={{ maxWidth: 260 }}>
            {text || '-'}
          </div>
        ),
      },
      {
        title: 'Đính kèm',
        dataIndex: 'dinhKem',
        key: 'dinhKem',
        width: 260,
        render: (value: string | null | undefined) => renderDinhKemCell(value),
      },
    ],
    [currentPage, pageSize, getThaoTacXuLyLabel]
  );

  return (
    <Modal
      show={show}
      fullscreen={'lg-down'}
      size="xl"
      onExited={onClose}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={onClose}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Lịch sử hồ sơ sáng kiến</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
      </Modal.Header>

      <Modal.Body>
        <Spin spinning={loading}>
          <TDTable<LichSuSangKienItem>
            dataSource={data}
            columns={columns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
            rowKey="id"
          />
        </Spin>
      </Modal.Body>

      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={onClose} disabled={loading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

