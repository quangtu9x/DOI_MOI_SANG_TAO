import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { toast } from 'react-toastify';
import { ProjectTable } from './components/ProjectTable';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectColumnConfigModal } from './components/ProjectColumnConfigModal';
import { ProjectFilterSection } from './components/ProjectFilterSection';
import { exportProjectsToExcel, exportProjectsToPDF } from './components/useProjectExport';
import { searchProjects } from '@/services/project.service';
import { ISearchProjectRequest, IProject } from '@/models/ke-hoach-von';
import { ProjectProcessTable } from './components/ProjectProcessTable';
import { ProjectProcessDetailModal } from './components/ProjectProcessDetailModal';
import { ProjectProcessFilterSection } from './components/ProjectProcessFilterSection';
import { ProjectProcessStepTable } from './components/ProjectProcessStepTable';
import { ProjectProcessStepFilterSection } from './components/ProjectProcessStepFilterSection';
import { ProjectProcessStepDetailModal } from './components/ProjectProcessStepDetailModal';
import { ProjectProcessExecutionTable } from './components/ProjectProcessExecutionTable';
import { ProjectProcessExecutionDetailModal } from './components/ProjectProcessExecutionDetailModal';
import { ProjectProcessExecutionFilterSection } from './components/ProjectProcessExecutionFilterSection';
import { ProjectProcessStepExecutionTable } from './components/ProjectProcessStepExecutionTable';
import { ProjectProcessStepExecutionDetailModal } from './components/ProjectProcessStepExecutionDetailModal';
import { ProjectProcessStepExecutionFilterSection } from './components/ProjectProcessStepExecutionFilterSection';

type TabType = 'danh-sach-du-an' | 'quan-ly-quy-trinh-du-an' | 'quan-ly-quy-trinh' | 'ap-dung-quy-trinh';

export const QuanLyThongTinDuAnPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const searchDataRedux = useSelector((state: RootState) => state.modal.searchData) as
    | SearchData
    | undefined;
  const [activeTab, setActiveTab] = useState<TabType>('danh-sach-du-an');
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

  useEffect(() => {
    if (activeTab === 'quan-ly-quy-trinh-du-an') {
      setShowFilter(false);
    }
  }, [activeTab]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value;
    const newSearchData = { ...searchData, keyword };
    setSearchData(newSearchData);
    dispatch(actionsModal.setSearchData(newSearchData));
    dispatch(actionsGlobal.setRandom());
  };

  const handleAddNewProject = (): void => {
    dispatch(actionsModal.setDataModal({ readOnly: false }));
    dispatch(actionsModal.setModalVisible(true));
  };

  const handleAddNewProcess = (): void => {
    dispatch(actionsModal.setDataModalCapBon({ readOnly: false }));
    dispatch(actionsModal.setModalVisibleCapBon(true));
  };

  const handleAddNewProcessStep = (): void => {
    dispatch(actionsModal.setDataModalCapMot({ readOnly: false }));
    dispatch(actionsModal.setModalVisibleCapMot(true));
  };

  const handleAddNewExecution = (): void => {
    dispatch(actionsModal.setDataModalCapHai({ readOnly: false, mode: 'manual' }));
    dispatch(actionsModal.setModalVisibleCapHai(true));
  };

  const handleApplyProcess = (): void => {
    dispatch(actionsModal.setDataModalCapHai({ readOnly: false, mode: 'apply' }));
    dispatch(actionsModal.setModalVisibleCapHai(true));
  };

  const handleInheritProcess = (): void => {
    dispatch(actionsModal.setDataModalCapHai({ readOnly: false, mode: 'inherit' }));
    dispatch(actionsModal.setModalVisibleCapHai(true));
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
      let allProjects: IProject[] = [];
      let currentPage = 1;
      const pageSize = 1000; // Fetch từng batch 1000 records
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
          
          // Kiểm tra xem còn dữ liệu không
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
          toast.success(`Xuất file Excel thành công! `);
        } else {
          await exportProjectsToPDF(allProjects, searchData);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'danh-sach-du-an':
        return (
          <>
            <ProjectFilterSection
              searchData={searchData || searchDataRedux}
              onFilterChange={handleFilterChange}
              showFilter={showFilter}
            />
            <ProjectTable searchData={searchData || searchDataRedux} />
          </>
        );
      case 'quan-ly-quy-trinh-du-an':
        return (
          <>
            <ProjectProcessTable searchData={searchData || searchDataRedux} />
          </>
        );
      case 'quan-ly-quy-trinh':
        return (
          <>
            <ProjectProcessStepFilterSection
              searchData={searchData || searchDataRedux}
              onFilterChange={handleFilterChange}
              showFilter={showFilter}
            />
            <ProjectProcessStepTable searchData={searchData || searchDataRedux} />
          </>
        );
      case 'ap-dung-quy-trinh':
        return (
          <>
            <ProjectProcessExecutionTable searchData={searchData || searchDataRedux} />
          </>
        );
      default:
        return null;
    }
  };

  const getToolbarButtons = () => {
    if (activeTab === 'danh-sach-du-an') {
      return (
        <>
          <div className="btn-group me-2 position-relative" ref={exportMenuRef}>
            <button
              className="btn btn-info btn-sm py-2"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              title="Xuất file danh sách dự án"
            >
              <span>
                <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
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
        </>
      );
    }
    return null;
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              {activeTab === 'danh-sach-du-an'
                ? 'Quản lý thông tin dự án'
                : activeTab === 'quan-ly-quy-trinh-du-an'
                ? 'Quản lý quy trình dự án'
                : activeTab === 'quan-ly-quy-trinh'
                ? 'Quản lý quy trình các bước thực hiện dự án'
                : 'Áp dụng quy trình các bước thực hiện cho dự án'}
            </h3>
          </div>

          {/* Main Tabs */}
          <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary me-10 ${
                  activeTab === 'danh-sach-du-an' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('danh-sach-du-an')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: '2px' }}
              >
                Danh sách dự án
              </button>
            </li>
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary ms-0 me-10 ${
                  activeTab === 'quan-ly-quy-trinh-du-an' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('quan-ly-quy-trinh-du-an')}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Quản lý quy trình dự án
              </button>
            </li>
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary ms-0 me-10 ${
                  activeTab === 'quan-ly-quy-trinh' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('quan-ly-quy-trinh')}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Quản lý quy trình các bước thực hiện dự án
              </button>
            </li>
            <li className="nav-item mt-2">
              <button
                className={`nav-link text-active-primary ms-0 me-10 ${
                  activeTab === 'ap-dung-quy-trinh' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('ap-dung-quy-trinh')}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Áp dụng quy trình các bước thực hiện cho dự án
              </button>
            </li>
          </ul>

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
              {(activeTab === 'danh-sach-du-an' || activeTab === 'quan-ly-quy-trinh' || activeTab === 'ap-dung-quy-trinh') && (
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
              )}
              {getToolbarButtons()}
              {activeTab === 'danh-sach-du-an' && (
                <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNewProject}>
                  <span>
                    <i className="fa-regular fa-plus me-2"></i>
                    <span className="">Thêm mới</span>
                  </span>
                </button>
              )}
              {activeTab === 'quan-ly-quy-trinh-du-an' && (
                <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNewProcess}>
                  <span>
                    <i className="fa-regular fa-plus me-2"></i>
                    <span className="">Thêm mới</span>
                  </span>
                </button>
              )}
              {activeTab === 'quan-ly-quy-trinh' && (
                <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNewProcessStep}>
                  <span>
                    <i className="fa-regular fa-plus me-2"></i>
                    <span className="">Thêm mới</span>
                  </span>
                </button>
              )}
              {activeTab === 'ap-dung-quy-trinh' && (
                <>
                  <button className="btn btn-success btn-sm py-2 me-2" onClick={handleApplyProcess}>
                    <span>
                      <i className="fa-solid fa-diagram-project me-2"></i>
                      <span className="">Áp dụng quy trình</span>
                    </span>
                  </button>
                  <button className="btn btn-info btn-sm py-2 me-2" onClick={handleInheritProcess}>
                    <span>
                      <i className="fa-solid fa-people-arrows me-2"></i>
                      <span className="">Kế thừa quy trình</span>
                    </span>
                  </button>
                  <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNewExecution}>
                    <span>
                      <i className="fa-regular fa-plus me-2"></i>
                      <span className="">Thêm mới</span>
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>

        {/* Modals */}
        <ProjectDetailModal />
        <ProjectColumnConfigModal />
        <ProjectProcessDetailModal />
        <ProjectProcessStepDetailModal />
        <ProjectProcessExecutionDetailModal />
        <ProjectProcessStepExecutionDetailModal />
      </Content>
    </>
  );
};
