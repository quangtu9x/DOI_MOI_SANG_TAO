import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';

const STORAGE_KEY = 'project_acceptance_column_config';

interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'code', title: 'Mã dự án', visible: true },
  { key: 'name', title: 'Tên dự án', visible: true },
  { key: 'projectTypeName', title: 'Loại dự án', visible: true },
  { key: 'projectGroupName', title: 'Nhóm dự án', visible: false },
  { key: 'investorName', title: 'Chủ đầu tư', visible: true },
  { key: 'organizationUnitName', title: 'Đơn vị quản lý', visible: false },
  { key: 'contractorName', title: 'Nhà thầu', visible: false },
  { key: 'totalInvestment', title: 'Tổng mức đầu tư', visible: true },
  { key: 'allocatedCapital', title: 'Vốn đã phân bổ', visible: true },
  { key: 'disbursedCapital', title: 'Vốn đã giải ngân', visible: true },
  { key: 'startDate', title: 'Ngày bắt đầu', visible: false },
  { key: 'expectedEndDate', title: 'Ngày kết thúc dự kiến', visible: true },
  { key: 'actualEndDate', title: 'Ngày kết thúc thực tế', visible: true },
  { key: 'currentPhase', title: 'Giai đoạn', visible: true },
  { key: 'status', title: 'Trạng thái', visible: true },
];

export const ProjectAcceptanceColumnConfigModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.columnConfigModalVisible);
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  useEffect(() => {
    if (modalVisible) {
      loadColumnConfig();
    }
  }, [modalVisible]);

  const loadColumnConfig = (): void => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ColumnConfig[];
        setColumnConfig(parsed);
      } else {
        setColumnConfig(DEFAULT_COLUMNS);
      }
    } catch (error) {
      console.error('Error loading column config:', error);
      setColumnConfig(DEFAULT_COLUMNS);
    }
  };

  const saveColumnConfig = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnConfig));
      toast.success('Đã lưu cấu hình cột!');
      dispatch(actionsGlobal.setRandom());
      handleCancel();
    } catch (error) {
      console.error('Error saving column config:', error);
      toast.error('Không thể lưu cấu hình!');
    }
  };

  const handleColumnToggle = (key: string, checked: boolean): void => {
    setColumnConfig(prev =>
      prev.map(col => (col.key === key ? { ...col, visible: checked } : col))
    );
  };

  const handleSelectAll = (): void => {
    setColumnConfig(DEFAULT_COLUMNS.map(col => ({ ...col, visible: true })));
  };

  const handleCancel = (): void => {
    dispatch(actionsModal.setColumnConfigModalVisible(false));
  };

  return (
    <Modal show={modalVisible} size="lg" onHide={handleCancel} keyboard={true} scrollable={true}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Cấu hình cột</Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label="Close"
          onClick={handleCancel}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column gap-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Chọn các cột hiển thị:</h6>
            <div>
              <Button size="sm" variant="outline-primary me-2" onClick={handleSelectAll}>
                Chọn tất cả
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  setColumnConfig(DEFAULT_COLUMNS.map(col => ({ ...col, visible: false })));
                }}
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          </div>
          <div className="row">
            {columnConfig.map(column => (
              <div key={column.key} className="col-xl-6 col-lg-6 mb-2">
                <Checkbox
                  checked={column.visible}
                  onChange={e => handleColumnToggle(column.key, e.target.checked)}
                >
                  {column.title}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-between w-100">
          <Button className="btn-sm btn-success rounded-1 p-2" onClick={saveColumnConfig}>
            <i className="fa-regular fa-floppy-disk me-2"></i>Lưu cấu hình
          </Button>
          <Button className="btn-sm btn-secondary rounded-1 p-2" onClick={handleCancel}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
