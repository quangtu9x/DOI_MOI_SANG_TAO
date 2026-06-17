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
import {
  DifficultyType,
  DifficultyLevel,
  ResolutionStatus,
  IProject,
} from '@/models/ke-hoach-von';
import { searchProjects } from '@/services/project.service';
import { ProjectDifficultyTable, ProjectDifficultyModal } from './components';

export const TinhHinhThucHienDuAnKhoKhanVuongMacPage = () => {
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
    // comment: chuẩn hóa value từ TDSelect hoặc Select thường thành primitive
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

  const handleOccurredDateRangeChange = (dates: Dayjs[] | null): void => {
    setSearchData(prev => ({
      ...prev,
      occurredDateFrom: dates?.[0]?.format('YYYY-MM-DD'),
      occurredDateTo: dates?.[1]?.format('YYYY-MM-DD'),
    }));
  };

  const handleClearFilter = (): void => {
    setSearchData(prev => ({
      ...prev,
      projectId: undefined,
      type: undefined,
      level: undefined,
      resolutionStatus: undefined,
      occurredDateFrom: undefined,
      occurredDateTo: undefined,
    }));
  };

  const handleAddStepExecution = (): void => {
    dispatch(actionsModal.setDataModalCapMot({ readOnly: false, mode: 'list' }));
    dispatch(actionsModal.setModalVisibleCapMot(true));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
              Quản lý tình hình thực hiện dự án, các khó khăn, vướng mắc trong quá trình thực hiện dự án
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
              <button className="btn btn-primary btn-sm py-2" onClick={handleAddStepExecution}>
                <i className="fa-regular fa-plus me-2"></i>
                Thêm mới
              </button>
            </div>
          </div>
          <Collapse in={showFilter}>
            <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
              <Form>
                <div className="row">
                  <div className="col-xl-3 col-lg-3">
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
                  <div className="col-xl-3 col-lg-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Loại khó khăn</Form.Label>
                      <Select
                        placeholder="Chọn loại khó khăn"
                        style={{ width: '100%' }}
                        value={searchData?.type}
                        onChange={value => handleFilterChange('type', value)}
                        allowClear
                      >
                        <Select.Option value={DifficultyType.Technical}>Kỹ thuật</Select.Option>
                        <Select.Option value={DifficultyType.Financial}>Tài chính</Select.Option>
                        <Select.Option value={DifficultyType.Legal}>Pháp lý</Select.Option>
                        <Select.Option value={DifficultyType.Other}>Khác</Select.Option>
                      </Select>
                    </Form.Group>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Mức độ</Form.Label>
                      <Select
                        placeholder="Chọn mức độ"
                        style={{ width: '100%' }}
                        value={searchData?.level}
                        onChange={value => handleFilterChange('level', value)}
                        allowClear
                      >
                        <Select.Option value={DifficultyLevel.Low}>Thấp</Select.Option>
                        <Select.Option value={DifficultyLevel.Medium}>Trung bình</Select.Option>
                        <Select.Option value={DifficultyLevel.High}>Cao</Select.Option>
                        <Select.Option value={DifficultyLevel.Critical}>Nghiêm trọng</Select.Option>
                      </Select>
                    </Form.Group>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái xử lý</Form.Label>
                      <Select
                        placeholder="Chọn trạng thái"
                        style={{ width: '100%' }}
                        value={searchData?.resolutionStatus}
                        onChange={value => handleFilterChange('resolutionStatus', value)}
                        allowClear
                      >
                        <Select.Option value={ResolutionStatus.Pending}>Chờ xử lý</Select.Option>
                        <Select.Option value={ResolutionStatus.InProgress}>Đang xử lý</Select.Option>
                        <Select.Option value={ResolutionStatus.Resolved}>Đã xử lý</Select.Option>
                        <Select.Option value={ResolutionStatus.Unresolved}>
                          Không thể xử lý
                        </Select.Option>
                      </Select>
                    </Form.Group>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Khoảng thời gian phát sinh</Form.Label>
                      <DatePicker.RangePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        value={
                          searchData?.occurredDateFrom && searchData?.occurredDateTo
                            ? [
                                dayjs(searchData.occurredDateFrom as string),
                                dayjs(searchData.occurredDateTo as string),
                              ]
                            : undefined
                        }
                        onChange={dates =>
                          handleOccurredDateRangeChange(
                            (dates as unknown as Dayjs[]) || null
                          )
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
            <ProjectDifficultyTable searchData={searchData} mode="list" />
          </div>
        </div>
      </Content>
      <ProjectDifficultyModal />
    </>
  );
};
