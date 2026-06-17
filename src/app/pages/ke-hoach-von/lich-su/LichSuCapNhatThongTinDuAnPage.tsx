import React, { useState } from 'react';
import { DatePicker, Select } from 'antd';
import { ProjectUpdateHistoryTable } from './components/ProjectUpdateHistoryTable';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { TDSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IProject, IUserDto, ProjectUpdateHistoryType } from '@/models';
import { Dayjs } from 'dayjs';
import { searchProjects } from '@/services/project.service';

const { RangePicker } = DatePicker;
const { Option } = Select;

const getUpdateTypeLabel = (updateType: ProjectUpdateHistoryType): string => {
  switch (updateType) {
    case ProjectUpdateHistoryType.ProjectInfo:
      return 'Thông tin dự án';
    case ProjectUpdateHistoryType.StepInfo:
      return 'Thông tin bước tiến trình';
    default:
      return '';
  }
};

export const LichSuCapNhatThongTinDuAnPage = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value;
    setSearchData(prev => ({
      ...prev,
      keyword: keyword || undefined,
    }));
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (dates) {
      setSearchData((prev) => ({
        ...prev,
        fromDate: dates[0]?.format('YYYY-MM-DD') || undefined,
        toDate: dates[1]?.format('YYYY-MM-DD') || undefined,
      }));
    } else {
      setSearchData((prev) => ({
        ...prev,
        fromDate: undefined,
        toDate: undefined,
      }));
    }
  };

  const handleUpdateTypeChange = (value: string | undefined) => {
    setSearchData((prev) => ({
      ...prev,
      updateType: value || undefined,
    }));
  };

  const handleProjectChange = (value: any) => {
    if (value) {
      setSearchData(prev => ({
        ...prev,
        projectId: value.value
      }));
    } else {
      setSearchData(prev => ({
        ...prev,
        projectId: undefined
      }));
    }
  };

  const handleUserChange = (value: any) => {
    if (value) {
      setSearchData(prev => ({
        ...prev,
        updatedByUserId: value.value
      }));
    } else {
      setSearchData(prev => ({
        ...prev,
        updatedByUserId: undefined
      }));
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Lịch sử cập nhật thông tin dự án'}</h3>
            <div className="card-toolbar d-flex align-items-center gap-3 flex-wrap">
              <div className="btn-group me-2 w-250px">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder="Nhập từ khoá tìm kiếm" 
                  onChange={handleKeywordChange} 
                />
              </div>
              <div className="d-flex align-items-center me-2">
                <TDSelect
                  notFoundContent="Không tìm thấy dữ liệu" 
                  reload 
                  showSearch 
                  placeholder="Chọn dự án" 
                  allowClear
                  fetchOptions={async keyword => {
                    const res = await searchProjects({
                      pageNumber: 1,
                      pageSize: 1000,
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
                  style={{
                    width: 250,
                  }}
                  onChange={handleProjectChange}
                />
              </div>
              <div className="d-flex align-items-center me-2">
                <Select
                  placeholder="Loại cập nhật"
                  allowClear
                  style={{ width: 200 }}
                  onChange={handleUpdateTypeChange}
                >
                  <Option value={ProjectUpdateHistoryType.ProjectInfo}>
                    {getUpdateTypeLabel(ProjectUpdateHistoryType.ProjectInfo)}
                  </Option>
                  <Option value={ProjectUpdateHistoryType.StepInfo}>
                    {getUpdateTypeLabel(ProjectUpdateHistoryType.StepInfo)}
                  </Option>
                </Select>
              </div>
              <div className="d-flex align-items-center me-2">
                <TDSelect
                  notFoundContent="Không tìm thấy dữ liệu" 
                  reload 
                  showSearch 
                  placeholder="Chọn người dùng" 
                  allowClear
                  fetchOptions={async keyword => {
                    const res = await requestPOST<IPaginationResponse<IUserDto[]>>(`users/search`, {
                      pageNumber: 1,
                      pageSize: 1000,
                      keyword: keyword
                    }, 'neutral');
                    return (
                      res.data?.data?.map(item => ({
                        ...item,
                        label: item?.userName,
                        value: item?.id,
                      })) ?? []
                    );
                  }}
                  style={{
                    width: 200,
                  }}
                  onChange={handleUserChange}
                />
              </div>
              <div className='d-flex align-items-center'>
                <RangePicker
                  format="DD-MM-YYYY"
                  style={{ width: '250px' }}
                  onChange={handleDateChange}
                />
              </div>
            </div>
          </div>
          <ProjectUpdateHistoryTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};
