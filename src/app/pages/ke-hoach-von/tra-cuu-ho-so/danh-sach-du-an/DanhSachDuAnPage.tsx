import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { IProject, ISearchProjectRequest } from '@/models/ke-hoach-von';
import { searchProjects } from '@/services/project.service';
import { DataTable } from './components/DataTable';
import { ProjectFilterSection } from './components/ProjectFilterSection';
import { ProjectColumnConfigModal } from './components/ProjectColumnConfigModal';
import { exportProjectsToExcel, exportProjectsToPDF } from './components/useProjectExport';

export const DanhSachDuAnPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleFilterChange = (field: string, value: any): void => {
    setSearchData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenColumnConfig = (): void => {
    // Hiển thị modal cấu hình cột danh sách dự án
    dispatch(actionsModal.setColumnConfigModalVisible(true));
  };

  const handleExport = async (format: 'excel' | 'pdf'): Promise<void> => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      // Lấy toàn bộ dữ liệu dự án để xuất file
      let allProjects: IProject[] = [];
      let currentPage = 1;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const searchRequest: ISearchProjectRequest = {
          pageNumber: currentPage,
          pageSize,
          ...searchData,
        };
        const response = await searchProjects(searchRequest);

        if (response?.data && response.data.length > 0) {
          allProjects = [...allProjects, ...response.data];

          const totalCount = response.totalCount || 0;
          if (allProjects.length >= totalCount || response.data.length < pageSize) {
            hasMore = false;
          } else {
            currentPage++;
          }
        } else {
          hasMore = false;
        }
      }

      if (allProjects.length > 0) {
        if (format === 'excel') {
          await exportProjectsToExcel(allProjects, searchData);
          toast.success('Xuất file Excel thành công!');
        } else {
          await exportProjectsToPDF(allProjects, searchData);
          toast.success('Xuất file PDF thành công!');
        }
      } else {
        toast.error('Không có dữ liệu để xuất!');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Có lỗi xảy ra khi xuất file. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">Danh sách dự án</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  onChange={handleKeywordChange}
                />
              </div>
              <button
                className="btn btn-sm btn-light-primary me-2"
                onClick={() => setShowFilter(!showFilter)}
              >
                <i className="fas fa-filter me-2"></i>
                {showFilter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </button>
              <div className="btn-group me-2" style={{ position: 'relative' }}>
                <button
                  className="btn btn-sm btn-light-primary dropdown-toggle"
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                >
                  <i className="fas fa-file-export me-2"></i>
                  {isExporting ? 'Đang xuất...' : 'Xuất file'}
                </button>
                {showExportMenu && (
                  <>
                    <div
                      className="position-fixed"
                      style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                      onClick={() => setShowExportMenu(false)}
                    ></div>
                    <div
                      className="dropdown-menu show"
                      style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}
                    >
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          handleExport('excel');
                        }}
                      >
                        <i className="fas fa-file-excel me-2 text-success"></i>
                        Xuất Excel
                      </a>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          handleExport('pdf');
                        }}
                      >
                        <i className="fas fa-file-pdf me-2 text-danger"></i>
                        Xuất PDF
                      </a>
                    </div>
                  </>
                )}
              </div>
              <button className="btn btn-sm btn-light-info" onClick={handleOpenColumnConfig}>
                <i className="fas fa-cog me-2"></i>
                Cấu hình cột
              </button>
            </div>
          </div>
          <ProjectFilterSection
            searchData={searchData}
            onFilterChange={handleFilterChange}
            showFilter={showFilter}
          />
          <DataTable searchData={searchData} />
        </div>
      </Content>
      <ProjectColumnConfigModal />
    </>
  );
};

