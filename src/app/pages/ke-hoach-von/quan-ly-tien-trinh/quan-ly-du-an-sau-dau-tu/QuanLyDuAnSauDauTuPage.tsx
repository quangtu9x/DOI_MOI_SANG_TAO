import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Collapse } from 'react-bootstrap';
import { Select, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { TDSelect } from '@/app/components';
import { IProject, ReportType } from '@/models/ke-hoach-von';
import { searchProjects } from '@/services/project.service';
import {
  ProjectPostInvestmentReportTable,
  ProjectPostInvestmentReportModal,
} from './components';

export const QuanLyDuAnSauDauTuPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [showFilter, setShowFilter] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleFilterChange = (field: string, value: any): void => {
    let extractedValue: string | number | undefined = undefined;

    if (value === null || value === undefined) {
      extractedValue = undefined;
    } else if (typeof value === 'object' && value?.value) {
      extractedValue = value.value as string;
    } else if (typeof value === 'string' || typeof value === 'number') {
      extractedValue = value;
    }

    setSearchData(prev => ({
      ...prev,
      [field]: extractedValue,
    }));
  };

  const handleReportDateRangeChange = (dates: Dayjs[] | null): void => {
    setSearchData(prev => ({
      ...prev,
      reportDateFrom: dates?.[0]?.format('YYYY-MM-DD'),
      reportDateTo: dates?.[1]?.format('YYYY-MM-DD'),
    }));
  };

  const handleClearFilter = (): void => {
    setSearchData(prev => ({
      ...prev,
      projectId: undefined,
      type: undefined,
      reportDateFrom: undefined,
      reportDateTo: undefined,
    }));
  };

  const handleAddNew = (): void => {
    dispatch(actionsModal.setDataModal({ readOnly: false }));
    dispatch(actionsModal.setModalVisible(true));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              Quản lý thông tin báo cáo giám sát, đánh giá dự án sau đầu tư
            </h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
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
              <button className="btn btn-primary btn-sm py-2" onClick={handleAddNew}>
                <i className="fa-regular fa-plus me-2"></i>
                Thêm mới
              </button>
            </div>
          </div>
          <Collapse in={showFilter}>
            <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
              <Form>
                <div className="row">
                  <div className="col-xl-4 col-lg-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Dự án</Form.Label>
                      <TDSelect
                        placeholder="Chọn dự án"
                        fetchOptions={async keyword => {
                          const res = await searchProjects({
                            pageNumber: 1,
                            pageSize: 10000,
                            keyword: keyword || '',
                          });
                          return (
                            res.data?.map((item: IProject) => ({
                              ...item,
                              label: `${item.code || ''} - ${item.name || ''}`,
                              value: item.id,
                            })) ?? []
                          );
                        }}
                        showSearch
                        reload
                        value={searchData?.projectId}
                        onChange={value => handleFilterChange('projectId', value)}
                        allowClear
                      />
                    </Form.Group>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Loại báo cáo</Form.Label>
                      <Select
                        placeholder="Chọn loại báo cáo"
                        style={{ width: '100%' }}
                        value={searchData?.type}
                        onChange={value => handleFilterChange('type', value)}
                        allowClear
                      >
                        <Select.Option value={ReportType.Monitoring}>Giám sát</Select.Option>
                        <Select.Option value={ReportType.Evaluation}>Đánh giá</Select.Option>
                      </Select>
                    </Form.Group>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Khoảng thời gian báo cáo</Form.Label>
                      <DatePicker.RangePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        value={
                          searchData?.reportDateFrom && searchData?.reportDateTo
                            ? [
                                dayjs(searchData.reportDateFrom as string),
                                dayjs(searchData.reportDateTo as string),
                              ]
                            : undefined
                        }
                        onChange={dates =>
                          handleReportDateRangeChange((dates as unknown as Dayjs[]) || null)
                        }
                      />
                    </Form.Group>
                  </div>
                  <div className="col-xl-2 col-lg-2 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-light btn-sm py-2 w-100"
                      onClick={handleClearFilter}
                    >
                      <i className="fa-regular fa-eraser me-2" />
                      Xóa lọc
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </Collapse>
          <div className="card-body p-0">
            <ProjectPostInvestmentReportTable searchData={searchData} />
          </div>
        </div>
      </Content>
      <ProjectPostInvestmentReportModal />
    </>
  );
};
