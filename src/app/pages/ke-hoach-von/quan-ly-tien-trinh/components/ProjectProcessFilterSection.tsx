import React from 'react';
import { Form, Collapse } from 'react-bootstrap';
import { Select } from 'antd';
import { TDSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';
import { SearchData } from '@/types';

interface ProjectProcessFilterSectionProps {
  searchData?: SearchData;
  onFilterChange: (field: string, value: any) => void;
  showFilter: boolean;
}

export const ProjectProcessFilterSection: React.FC<ProjectProcessFilterSectionProps> = ({
  searchData,
  onFilterChange,
  showFilter,
}) => {
  const handleFilterChange = (field: string, value: any): void => {
    let extractedValue: string | number | boolean | undefined = undefined;

    if (value === null || value === undefined) {
      extractedValue = undefined;
    } else if (typeof value === 'object' && value?.value !== undefined) {
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
                  <Form.Label>Loại dự án</Form.Label>
                  <TDSelect
                    placeholder="Chọn loại dự án"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                        pageNumber: 1,
                        pageSize: 10000,
                        categoryGroupCode: 'LOAI_DU_AN',
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    value={searchData?.projectTypeId}
                    onChange={value => handleFilterChange('projectTypeId', value)}
                    allowClear
                  />
                </Form.Group>
              </div>
              <div className="col-xl-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label>Nhóm dự án</Form.Label>
                  <TDSelect
                    placeholder="Chọn nhóm dự án"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                        pageNumber: 1,
                        pageSize: 10000,
                        categoryGroupCode: 'NHOM_DU_AN',
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    value={searchData?.projectGroupId}
                    onChange={value => handleFilterChange('projectGroupId', value)}
                    allowClear
                  />
                </Form.Group>
              </div>
              <div className="col-xl-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Select
                    placeholder="Chọn trạng thái"
                    style={{ width: '100%' }}
                    value={searchData?.isActive}
                    onChange={value => handleFilterChange('isActive', value)}
                    allowClear
                  >
                    <Select.Option value={true}>Hoạt động</Select.Option>
                    <Select.Option value={false}>Không hoạt động</Select.Option>
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
