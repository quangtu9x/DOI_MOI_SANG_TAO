import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { KeHoachChoDuyetTable } from '../../giai-doan-xin-von/ke-hoach-cho-duyet/components/KeHoachChoDuyetTable';
import { TrangThaiDuyet } from '@/models';

interface KeHoachSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (selectedKeys: React.Key[]) => void;
  initialSelectedKeys?: React.Key[];
}

export const KeHoachSelectionModal: React.FC<KeHoachSelectionModalProps> = ({ visible, onClose, onSuccess, initialSelectedKeys = [] }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(initialSelectedKeys);

  const handleOk = () => {
    onSuccess(selectedRowKeys);
    onClose();
  };

  return (
    <Modal show={visible} onHide={onClose} centered size="xl">
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chọn kế hoạch xin vốn đã duyệt</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
      </Modal.Header>
      <Modal.Body className="p-0">
        <KeHoachChoDuyetTable
          searchData={{ trangThai: TrangThaiDuyet.DaDuyet }}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
        />
      </Modal.Body>

      <Modal.Footer className="px-4 py-3 border-0">
        <Button variant="secondary" className="btn-sm rounded-1 p-2 ms-2" onClick={onClose}>
          <i className="fa-regular fa-xmark"></i> Đóng
        </Button>
        <Button variant="primary" className="btn-sm rounded-1 p-2 ms-2" onClick={handleOk}>
          <i className="fa-regular fa-check"></i> Đồng ý
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
