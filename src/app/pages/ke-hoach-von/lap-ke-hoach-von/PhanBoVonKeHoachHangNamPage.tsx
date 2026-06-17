import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import { Form, Collapse } from 'react-bootstrap';
import { Select } from 'antd';
import { useAuth } from '@/app/modules/auth';
import { UserType } from '@/models/user';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { toast } from 'react-toastify';
import { CapitalAllocationTable } from './components/CapitalAllocationTable';
import { CapitalAllocationDetailModal } from './components/CapitalAllocationDetailModal';
import { exportCapitalAllocationsExcel } from '@/services/capitalAllocation.service';
import { TDSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IResult } from '@/models/response';
import { CapitalAllocationType } from '@/models/ke-hoach-von';
import { searchAnnualCapitalPlans } from '@/services/annualCapitalPlan.service';

export const PhanBoVonKeHoachHangNamPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.type === UserType.Admin;
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleAddNew = (): void => {
    dispatch(actionsModal.setDataModal({ readOnly: false }));
    dispatch(actionsModal.setModalVisible(true));
  };

  const handleExportClick = async (): Promise<void> => {
    try {
      setIsExporting(true);
      await exportCapitalAllocationsExcel(searchData?.annualCapitalPlanId as string | undefined);
      toast.success('Export thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi export file. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (field: string, value: any): void => {
    // Extract GUID từ object nếu là TDSelect value, hoặc dùng trực tiếp nếu là string
    let extractedValue: string | number | undefined = undefined;
    
    if (value === null || value === undefined) {
      extractedValue = undefined;
    } else if (typeof value === 'object' && value?.value) {
      // TDSelect trả về object { value, label }
      extractedValue = value.value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      // Giá trị trực tiếp (string GUID hoặc number cho allocationType)
      extractedValue = value;
    }
    
    setSearchData(prev => ({
      ...prev,
      [field]: extractedValue,
    }));
  };

  const handleClearFilter = (): void => {
    setSearchData(prev => ({
      ...prev,
      annualCapitalPlanId: undefined,
      projectId: undefined,
      allocationType: undefined,
      investorId: undefined,
    }));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Phân bổ vốn kế hoạch hàng năm'}</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              <button
                className="btn btn-secondary btn-sm py-2 me-2"
                onClick={() => setShowFilter(!showFilter)}
                title="Bộ lọc"
              >
                <span>
                  <i className={`fa-regular ${showFilter ? 'fa-filter-circle-xmark' : 'fa-filter'} me-2`}></i>
                  <span className="">Bộ lọc</span>
                </span>
              </button>
              <button
                className="btn btn-info btn-sm py-2 me-2"
                onClick={handleExportClick}
                disabled={isExporting}
                title="Export Excel danh sách phân bổ vốn"
              >
                <span>
                  <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                  <span className="">Export Excel</span>
                </span>
              </button>
              {isAdmin && (
                <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNew}>
                  <span>
                    <i className="fa-regular fa-plus me-2"></i>
                    <span className="">Thêm mới</span>
                  </span>
                </button>
              )}
            </div>
          </div>
          <Collapse in={showFilter}>
            <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
              <Form>
                <div className="row">
                  <div className="col-xl-3 col-lg-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Kế hoạch vốn</Form.Label>
                      <TDSelect
                        placeholder="Chọn kế hoạch vốn"
                        fetchOptions={async keyword => {
                          const res = await searchAnnualCapitalPlans({
                            pageNumber: 1,
                            pageSize: 10000,
                            keyword: keyword || '',
                          });
                          const filtered = res.data ?? [];
                          return filtered.map(item => ({
                            ...item,
                            label: `${item.code || ''} - ${item.name || ''}`,
                            value: item.id,
                          }));
                        }}
                        showSearch
                        reload
                        value={searchData?.annualCapitalPlanId}
                        onChange={(value) => handleFilterChange('annualCapitalPlanId', value)}
                        allowClear
                      />
                    </Form.Group>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Dự án</Form.Label>
                      <TDSelect
                        placeholder="Chọn dự án"
                        fetchOptions={async keyword => {
                          const res = await requestPOST<IPaginationResponse<any[]>>(`projects/search`, {
                            pageNumber: 1,
                            pageSize: 10000,
                            keyword: keyword || '',
                          });
                          return (
                            res.data?.data?.map(item => ({
                              ...item,
                              label: `${item.code || ''} - ${item.name || ''}`,
                              value: item.id,
                            })) ?? []
                          );
                        }}
                        showSearch
                        reload
                        value={searchData?.projectId}
                        onChange={(value) => handleFilterChange('projectId', value)}
                        allowClear
                      />
                    </Form.Group>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Loại phân bổ</Form.Label>
                      <Select
                        placeholder="Chọn loại phân bổ"
                        style={{ width: '100%' }}
                        value={searchData?.allocationType}
                        onChange={(value) => handleFilterChange('allocationType', value)}
                        allowClear
                      >
                        <Select.Option value={CapitalAllocationType.Initial}>Phân bổ ban đầu</Select.Option>
                        <Select.Option value={CapitalAllocationType.Adjustment}>Điều chỉnh</Select.Option>
                        <Select.Option value={CapitalAllocationType.Supplement}>Bổ sung</Select.Option>
                      </Select>
                    </Form.Group>
                  </div>
                  {isAdmin && (
                    <div className="col-xl-3 col-lg-3">
                      <Form.Group className="mb-3">
                        <Form.Label>Chủ đầu tư</Form.Label>
                        <TDSelect
                          placeholder="Chọn chủ đầu tư"
                          fetchOptions={async keyword => {
                            const res = await requestPOST<IPaginationResponse<any[]>>(`investors/search`, {
                              pageNumber: 1,
                              pageSize: 10000,
                              keyword: keyword || '',
                            });
                            return (
                              res.data?.data?.map(item => ({
                                ...item,
                                label: `${item?.code || ''} - ${item?.name || ''}`,
                                value: item?.id,
                              })) ?? []
                            );
                          }}
                          showSearch
                          reload
                          value={searchData?.investorId}
                          onChange={(value) => handleFilterChange('investorId', value)}
                          allowClear
                        />
                      </Form.Group>
                    </div>
                  )}
                </div>
              </Form>
            </div>
          </Collapse>
          <CapitalAllocationTable searchData={searchData} />
        </div>
        <CapitalAllocationDetailModal />
      </Content>
    </>
  );
};
