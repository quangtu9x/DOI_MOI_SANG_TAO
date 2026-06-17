import React from 'react';
import { Form, Collapse } from 'react-bootstrap';
import { Select } from 'antd';
import { TDSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';
import {
  ProjectDifficultyType,
  ProjectDifficultyLevel,
  ResolutionStatus,
} from '@/models/ke-hoach-von';
import { SearchData } from '@/types';

interface ProjectSituationFilterSectionProps {
  searchData?: SearchData;
  onFilterChange: (field: string, value: any) => void;
  showFilter: boolean;
}

export const ProjectSituationFilterSection: React.FC<ProjectSituationFilterSectionProps> = ({
  searchData,
  onFilterChange,
  showFilter,
}) => {
  const handleFilterChange = (field: string, value: any): void => {
    let extractedValue: string | number | boolean | undefined = undefined;

    if (value === null || value === undefined) {
      extractedValue = undefined;
    } else if (typeof value === 'object' && value?.value) {
      extractedValue = value.value;
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      extractedValue = value;
    }

    onFilterChange(field, extractedValue);
  };

  return (
    <Collapse in={showFilter}>
      <div>
        <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid">
          <Form>
            <div className="row">
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
                          label: `${item?.code || ''} - ${item?.name || ''}`,
                          value: item?.id,
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
                  <Form.Label>Loại</Form.Label>
                  <Select
                    placeholder="Chọn loại"
                    style={{ width: '100%' }}
                    value={searchData?.type}
                    onChange={value => handleFilterChange('type', value)}
                    allowClear
                  >
                    <Select.Option value={ProjectDifficultyType.Technical}>Kỹ thuật</Select.Option>
                    <Select.Option value={ProjectDifficultyType.Financial}>Tài chính</Select.Option>
                    <Select.Option value={ProjectDifficultyType.Legal}>Pháp lý</Select.Option>
                    <Select.Option value={ProjectDifficultyType.Other}>Khác</Select.Option>
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
                    <Select.Option value={ProjectDifficultyLevel.Low}>Thấp</Select.Option>
                    <Select.Option value={ProjectDifficultyLevel.Medium}>Trung bình</Select.Option>
                    <Select.Option value={ProjectDifficultyLevel.High}>Cao</Select.Option>
                    <Select.Option value={ProjectDifficultyLevel.Critical}>Nghiêm trọng</Select.Option>
                  </Select>
                </Form.Group>
              </div>
              <div className="col-xl-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái xử lý</Form.Label>
                  <Select
                    placeholder="Chọn trạng thái xử lý"
                    style={{ width: '100%' }}
                    value={searchData?.resolutionStatus}
                    onChange={value => handleFilterChange('resolutionStatus', value)}
                    allowClear
                  >
                    <Select.Option value={ResolutionStatus.Pending}>Chờ xử lý</Select.Option>
                    <Select.Option value={ResolutionStatus.InProgress}>Đang xử lý</Select.Option>
                    <Select.Option value={ResolutionStatus.Resolved}>Đã xử lý</Select.Option>
                    <Select.Option value={ResolutionStatus.Unresolved}>Không thể xử lý</Select.Option>
                  </Select>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-xl-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label>Có kết quả xử lý</Form.Label>
                  <Select
                    placeholder="Chọn"
                    style={{ width: '100%' }}
                    value={searchData?.isHasResult}
                    onChange={value => handleFilterChange('isHasResult', value)}
                    allowClear
                  >
                    <Select.Option value={true}>Có</Select.Option>
                    <Select.Option value={false}>Không</Select.Option>
                  </Select>
                </Form.Group>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Collapse>
  );
};
