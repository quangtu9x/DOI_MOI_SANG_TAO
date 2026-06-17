import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { toast } from 'react-toastify';
import { ProjectSituationTable } from './components/ProjectSituationTable';
import { ProjectDifficultyDetailModal } from './components/ProjectDifficultyDetailModal';
import { ProjectSituationColumnConfigModal } from './components/ProjectSituationColumnConfigModal';
import { ProjectSituationFilterSection } from './components/ProjectSituationFilterSection';
import {
  exportProjectSituationsToExcel,
  exportProjectSituationsToPDF,
} from './components/useProjectSituationExport';
import { searchProjectDifficulties } from '@/services/projectDifficulty.service';
import { ISearchProjectDifficultyRequest, IProjectDifficulty, ProjectDifficultyCategory } from '@/models/ke-hoach-von';

export const TheoDoiTinhHinhThucHienDuAnPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const searchDataRedux = useSelector((state: RootState) => state.modal.searchData) as
    | SearchData
    | undefined;
  const [searchData, setSearchData] = useState<SearchData | undefined>(searchDataRedux);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value;
    const newSearchData = { ...searchData, keyword };
    setSearchData(newSearchData);
    dispatch(actionsModal.setSearchData(newSearchData));
    dispatch(actionsGlobal.setRandom());
  };

  const handleFilterChange = (field: string, value: any): void => {
    const newSearchData = { ...searchData, [field]: value };
    setSearchData(newSearchData);
    dispatch(actionsModal.setSearchData(newSearchData));
    dispatch(actionsGlobal.setRandom());
  };

  const handleClearFilter = (): void => {
    setSearchData(undefined);
    dispatch(actionsModal.setSearchData(undefined));
    dispatch(actionsGlobal.setRandom());
  };

  const handleOpenColumnConfig = (): void => {
    dispatch(actionsModal.setColumnConfigModalVisible(true));
  };

  const handleExport = async (format: 'excel' | 'pdf'): Promise<void> => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      // Fetch tất cả dữ liệu bằng cách loop qua các trang
      let allSituations: IProjectDifficulty[] = [];
      let currentPage = 1;
      const pageSize = 1000; // Fetch từng batch 1000 records
      let hasMore = true;

      while (hasMore) {
        const searchRequest: ISearchProjectDifficultyRequest = {
          pageNumber: currentPage,
          pageSize,
          keyword: searchData?.keyword as string,
          projectId: searchData?.projectId as string,
          category: ProjectDifficultyCategory.ProjectSituation, // category = 1 (Tình hình dự án)
          type: searchData?.type as number,
          level: searchData?.level as number,
          resolutionStatus: searchData?.resolutionStatus as number,
          isHasResult: searchData?.isHasResult as boolean,
        };
        const response = await searchProjectDifficulties(searchRequest);

        if (response?.data && response.data.length > 0) {
          allSituations = [...allSituations, ...response.data];

          // Kiểm tra xem còn dữ liệu không
          const totalCount = response.totalCount || 0;
          if (allSituations.length >= totalCount || response.data.length < pageSize) {
            hasMore = false;
          } else {
            currentPage++;
          }
        } else {
          hasMore = false;
        }
      }

      if (allSituations.length > 0) {
        if (format === 'excel') {
          await exportProjectSituationsToExcel(allSituations, searchData);
          toast.success(`Xuất file Excel thành công!`);
        } else {
          await exportProjectSituationsToPDF(allSituations, searchData);
          toast.success(`Xuất file PDF thành công!`);
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
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              {'Theo dõi tình hình thực hiện dự án'}
            </h3>
          </div>

          {/* Toolbar */}
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <div className="card-toolbar d-flex align-items-center flex-grow-1">
              <div className="btn-group me-2 flex-grow-1">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nhập từ khoá tìm kiếm"
                  value={searchData?.keyword || ''}
                  onChange={handleKeywordChange}
                />
              </div>
              <button
                className="btn btn-secondary btn-sm py-2 me-2"
                onClick={() => setShowFilter(!showFilter)}
                title="Bộ lọc"
              >
                <span>
                  <i
                    className={`fa-regular ${
                      showFilter ? 'fa-filter-circle-xmark' : 'fa-filter'
                    } me-2`}
                  ></i>
                  <span className="">Bộ lọc</span>
                </span>
              </button>
              <div className="btn-group me-2 position-relative" ref={exportMenuRef}>
                <button
                  className="btn btn-info btn-sm py-2"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  title="Xuất file danh sách tình hình thực hiện"
                >
                  <span>
                    <i
                      className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}
                    ></i>
                    <span className="">Xuất file</span>
                    <i className="fa-regular fa-chevron-down ms-2"></i>
                  </span>
                </button>
                {showExportMenu && (
                  <div
                    className="position-absolute bg-white border rounded shadow-lg"
                    style={{
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      zIndex: 1000,
                      minWidth: '150px',
                    }}
                  >
                    <button
                      className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                      onClick={() => handleExport('excel')}
                      style={{ display: 'block' }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className="fa-regular fa-file-excel me-2 text-success"></i>
                      Xuất Excel
                    </button>
                    <button
                      className="btn btn-sm w-100 text-start px-3 py-2 border-0"
                      onClick={() => handleExport('pdf')}
                      style={{ display: 'block' }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <i className="fa-regular fa-file-pdf me-2 text-danger"></i>
                      Xuất PDF
                    </button>
                  </div>
                )}
              </div>
              <button
                className="btn btn-warning btn-sm py-2 me-2"
                onClick={handleOpenColumnConfig}
                title="Cấu hình cột hiển thị"
              >
                <span>
                  <i className="fa-regular fa-table-columns me-2"></i>
                  <span className="">Cấu hình cột</span>
                </span>
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <ProjectSituationFilterSection
            searchData={searchData || searchDataRedux}
            onFilterChange={handleFilterChange}
            showFilter={showFilter}
          />

          {/* Table */}
          <ProjectSituationTable searchData={searchData || searchDataRedux} />
        </div>

        {/* Modals */}
        <ProjectDifficultyDetailModal />
        <ProjectSituationColumnConfigModal />
      </Content>
    </>
  );
};
