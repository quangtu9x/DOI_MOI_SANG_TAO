import React from 'react';
import { Form, Collapse } from 'react-bootstrap';
import { Select, Switch } from 'antd';
import { TDSelect } from '@/app/components';
import { SearchData } from '@/types';
import { searchProjectProcessExecutions } from '@/services/projectProcessExecution.service';
import { searchProjectProcessSteps } from '@/services/projectProcessStep.service';

interface ProjectProcessStepExecutionFilterSectionProps {
  searchData?: SearchData;
  onFilterChange: (field: string, value: any) => void;
  showFilter: boolean;
}

export const ProjectProcessStepExecutionFilterSection: React.FC<
  ProjectProcessStepExecutionFilterSectionProps
> = ({ searchData, onFilterChange, showFilter }) => {
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
                  <Form.Label>Áp dụng quy trình</Form.Label>
                  <TDSelect
                    placeholder="Chọn áp dụng quy trình"
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcessExecutions({
                        pageNumber: 1,
                        pageSize: 10000,
                        keyword: keyword || '',
                      });
                      return (
                        res.data?.map(item => ({
                          ...item,
                          label: `${item.projectName || ''} - ${item.projectProcessName || ''}`,
                          value: item.id,
                        })) ?? []
                      );
                    }}
                    showSearch
                    reload
                    value={searchData?.projectProcessExecutionId}
                    onChange={value => handleFilterChange('projectProcessExecutionId', value)}
                    allowClear
                  />
                </Form.Group>
              </div>
              <div className="col-xl-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label>Bước quy trình</Form.Label>
                  <TDSelect
                    placeholder="Chọn bước quy trình"
                    fetchOptions={async keyword => {
                      const res = await searchProjectProcessSteps({
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
                    value={searchData?.projectProcessStepId}
                    onChange={value => handleFilterChange('projectProcessStepId', value)}
                    allowClear
                  />
                </Form.Group>
              </div>
              <div className="col-xl-2 col-lg-2">
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Select
                    placeholder="Chọn trạng thái"
                    style={{ width: '100%' }}
                    value={searchData?.status}
                    onChange={value => handleFilterChange('status', value)}
                    allowClear
                  >
                    <Select.Option value={0}>Chờ xử lý</Select.Option>
                    <Select.Option value={1}>Đang xử lý</Select.Option>
                    <Select.Option value={2}>Hoàn thành</Select.Option>
                    <Select.Option value={3}>Hủy bỏ</Select.Option>
                  </Select>
                </Form.Group>
              </div>
              <div className="col-xl-2 col-lg-2">
                <Form.Group className="mb-3">
                  <Form.Label>Hoàn thành</Form.Label>
                  <Select
                    placeholder="Chọn trạng thái"
                    style={{ width: '100%' }}
                    value={searchData?.isCompleted}
                    onChange={value => handleFilterChange('isCompleted', value)}
                    allowClear
                  >
                    <Select.Option value={true}>Có</Select.Option>
                    <Select.Option value={false}>Chưa</Select.Option>
                  </Select>
                </Form.Group>
              </div>
              <div className="col-xl-2 col-lg-2 d-flex align-items-end">
                <Form.Group className="mb-3 d-flex align-items-center gap-2">
                  <Switch
                    checked={!!searchData?.myAssigned}
                    onChange={value => handleFilterChange('myAssigned', value)}
                  />
                  <span>Chỉ bước của tôi</span>
                </Form.Group>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Collapse>
  );
};
