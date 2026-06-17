import React, { useState, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { importProjectsFromExcel, downloadImportTemplate } from '@/services/annualCapitalPlan.service';
import * as actionsGlobal from '@/redux/global/Actions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';

interface ImportExcelModalProps {
  show: boolean;
  onHide: () => void;
  planId: string | null;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ show, onHide, planId }) => {
  const dispatch: AppDispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  /**
   * Xử lý tải template Excel
   */
  const handleDownloadTemplate = async (): Promise<void> => {
    try {
      setIsDownloadingTemplate(true);
      await downloadImportTemplate();
      toast.success('Tải template thành công!');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Có lỗi xảy ra khi tải template. Vui lòng thử lại!');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  /**
   * Xử lý khi click nút chọn file
   */
  const handleSelectFile = (): void => {
    if (!planId) {
      toast.warning('Vui lòng chọn một kế hoạch vốn từ bảng để import!');
      return;
    }
    fileInputRef.current?.click();
  };

  /**
   * Xử lý khi file được chọn
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!planId) {
      toast.warning('Vui lòng chọn một kế hoạch vốn từ bảng!');
      return;
    }

    // Kiểm tra định dạng file
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx') {
      toast.error('Chỉ chấp nhận file Excel (.xlsx)!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setIsImporting(true);
      const response = await importProjectsFromExcel(planId, file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      if (response.succeeded) {
        toast.success(`Import thành công! Đã import ${response.data || 0} dự án.`);
        dispatch(actionsGlobal.setRandom());
        onHide();
      } else {
        toast.error(response.message || 'Import thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Có lỗi xảy ra khi import file. Vui lòng thử lại!');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Xử lý đóng modal
   */
  const handleClose = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onHide();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header className="bg-primary px-4 py-3">
          <Modal.Title className="text-white">Import Excel</Modal.Title>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={handleClose}
          ></button>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <div className="d-flex flex-column gap-3">
            <div>
              <h5 className="mb-3">Tải template Excel</h5>
              <p className="text-muted mb-3">
                Tải file template Excel để điền thông tin dự án cần import.
              </p>
              <Button
                className="btn btn-success"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
              >
                <i
                  className={`fa-regular ${isDownloadingTemplate ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}
                ></i>
                {isDownloadingTemplate ? 'Đang tải...' : 'Tải template Excel'}
              </Button>
            </div>
            <hr />
            <div>
              <h5 className="mb-3">Chọn file Excel để import</h5>
              <p className="text-muted mb-3">
                Chọn file Excel đã điền thông tin để import danh sách dự án.
              </p>
              <Button
                className="btn btn-primary"
                onClick={handleSelectFile}
                disabled={isImporting || !planId}
              >
                <i
                  className={`fa-regular ${isImporting ? 'fa-spinner fa-spin' : 'fa-file-excel'} me-2`}
                ></i>
                {isImporting ? 'Đang import...' : 'Chọn file Excel'}
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Modal.Body>
        <Modal.Footer className="bg-light px-4 py-2">
          <Button className="btn-sm btn-secondary rounded-1 p-2" onClick={handleClose}>
            <i className="fa-regular fa-xmark me-2"></i>Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
