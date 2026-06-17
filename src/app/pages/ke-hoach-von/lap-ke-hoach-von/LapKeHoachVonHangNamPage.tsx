import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { toast } from 'react-toastify';
import { AnnualCapitalPlanTable } from './components/AnnualCapitalPlanTable';
import { AnnualCaptialPlanDetailModal } from './components/AnnualCaptialPlanDetailModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import { RegistrationSummaryModal } from './components/RegistrationSummaryModal';
import { exportProjectRegistrationsExcel } from '@/services/annualCapitalPlan.service';
import { IAnnualCapitalPlan } from '@/models/ke-hoach-von';
import { requestDownloadFile } from '@/utils/baseAPI';
import { TemplateFileType } from '@/models';
import { saveBlobAsFile } from '@/utils/utils';
import { TEMPLATE_FILE_CODE } from '@/data';

export const LapKeHoachVonHangNamPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<IAnnualCapitalPlan | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleAddNew = (): void => {
    console.log("handleAddNew clicked");
    dispatch(actionsModal.setDataModal(null));
    dispatch(actionsModal.setModalVisible(true));
  };

  /**
   * Xử lý khi click nút Import Excel
   */
  const handleImportClick = (): void => {
    if (!selectedPlan?.id) {
      toast.warning('Vui lòng chọn một kế hoạch vốn từ bảng để import!');
      return;
    }
    setShowImportModal(true);
  };

  const handleExportClick = async (): Promise<void> => {
    console.log("handleExportClick clicked", { selectedPlan });
    if (!selectedPlan?.id) {
      toast.warning('Vui lòng chọn một kế hoạch vốn từ bảng để export!');
      return;
    }

    try {
      setIsExporting(true);
      const response = await requestDownloadFile(`AnnualCapitalPlans/export-registrations`, {
        annualCapitalPlanId: selectedPlan?.id,
        exportConfig: {
          code: TEMPLATE_FILE_CODE.KE_HOACH,
          type: TemplateFileType.excel,
        }
      });
      if (response?.status == 200) {
        saveBlobAsFile(response);
      }
      else {
        toast.error("Xuất dữ liệu thất bại!");
      }
    } catch (error) {
      console.log("Failed:", error);
      toast.error("Có lỗi xảy ra!");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Xử lý khi click nút Tổng hợp
   */
  const handleSummaryClick = (): void => {
    if (!selectedPlan?.id) {
      toast.warning('Vui lòng chọn một kế hoạch vốn từ bảng để xem tổng hợp!');
      return;
    }
    setShowSummaryModal(true);
  };

  const handlePlanSelect = useCallback((plan: IAnnualCapitalPlan | null) => {
    setSelectedPlan(plan);
  }, []);

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Lập kế hoạch vốn hàng năm'}</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              {/* <button
                className="btn btn-success btn-sm py-2 me-2"
                onClick={handleImportClick}
                title="Import Excel danh sách dự án"
              >
                <span>
                  <i className="fa-regular fa-file-excel me-2"></i>
                  <span className="">Import Excel</span>
                </span>
              </button> */}
              <button
                className="btn btn-success btn-sm py-2 me-2"
                onClick={handleExportClick}
                disabled={isExporting}
                title="Xuất danh sách"
              >
                <span>
                  <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                  <span className="">Xuất danh sách</span>
                </span>
              </button>
              {/* <button
                className="btn btn-warning btn-sm py-2 me-2"
                onClick={handleSummaryClick}
                title="Tổng hợp danh sách dự án đăng ký vốn"
              >
                <span>
                  <i className="fa-regular fa-chart-pie me-2"></i>
                  <span className="">Tổng hợp</span>
                </span>
              </button> */}
              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNew}>
                <span>
                  <i className="fa-regular fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <AnnualCapitalPlanTable
            searchData={searchData}
            onPlanSelect={handlePlanSelect}
            selectedPlanId={selectedPlan?.id}
          />
        </div>
        <AnnualCaptialPlanDetailModal />
        <ImportExcelModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          planId={selectedPlan?.id || null}
        />
        <RegistrationSummaryModal
          show={showSummaryModal}
          onHide={() => setShowSummaryModal(false)}
          planId={selectedPlan?.id || null}
          planName={selectedPlan?.name}
        />
      </Content >
    </>
  );
};