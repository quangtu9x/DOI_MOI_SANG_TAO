import React from 'react';
import { Form, Collapse } from 'react-bootstrap';
import { Select } from 'antd';
import { TDSelect } from '@/app/components';
import { SearchData } from '@/types';
import { searchProjects } from '@/services/project.service';
import { searchProjectProcesses } from '@/services/projectProcess.service';

interface ProjectProcessExecutionFilterSectionProps {
  searchData?: SearchData;
  onFilterChange: (field: string, value: any) => void;
  showFilter: boolean;
}

export const ProjectProcessExecutionFilterSection: React.FC<ProjectProcessExecutionFilterSectionProps> = ({
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
                        res.data?.map(item => ({
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
                  <Form.Label>Quy trình</Form.Label>
                  <TDSelect
                    placeholder="Chọn quy trình"
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcesses({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    value={searchData?.projectProcessId}
                    onChange={value => handleFilterChange('projectProcessId', value)}
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
                    value={searchData?.isCompleted}
                    onChange={value => handleFilterChange('isCompleted', value)}
                    allowClear
                  >
                    <Select.Option value={true}>Hoàn thành</Select.Option>
                    <Select.Option value={false}>Đang thực hiện</Select.Option>
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
