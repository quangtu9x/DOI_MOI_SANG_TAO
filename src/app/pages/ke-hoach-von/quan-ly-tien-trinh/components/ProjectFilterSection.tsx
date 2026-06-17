import React from 'react';
import { Form, Collapse } from 'react-bootstrap';
import { Select } from 'antd';
import { TDSelect, OrganizationUnitTreeSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';
import { ProjectStatus, ProjectPhase } from '@/models/ke-hoach-von';
import { SearchData } from '@/types';

interface ProjectFilterSectionProps {
  searchData?: SearchData;
  onFilterChange: (field: string, value: any) => void;
  showFilter: boolean;
}

export const ProjectFilterSection: React.FC<ProjectFilterSectionProps> = ({
  searchData,
  onFilterChange,
  showFilter,
}) => {
  const handleFilterChange = (field: string, value: any): void => {
    let extractedValue: string | number | undefined = undefined;

    if (value === null || value === undefined) {
      extractedValue = undefined;
    } else if (typeof value === 'object' && value?.value) {
      extractedValue = value.value;
    } else if (typeof value === 'string' || typeof value === 'number') {
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
                            label: item?.name,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      showSearch
                      reload
                      value={searchData?.investorId}
                      onChange={value => handleFilterChange('investorId', value)}
                      allowClear
                    />
                  </Form.Group>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Đơn vị quản lý</Form.Label>
                    <OrganizationUnitTreeSelect
                      placeholder="Chọn đơn vị quản lý"
                      useCurrentUserDefault={false}
                      value={searchData?.organizationUnitId}
                      onChange={value => handleFilterChange('organizationUnitId', value)}
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
                      value={searchData?.status}
                      onChange={value => handleFilterChange('status', value)}
                      allowClear
                    >
                      <Select.Option value={ProjectStatus.Draft}>Nháp</Select.Option>
                      <Select.Option value={ProjectStatus.Planning}>Đang lập kế hoạch</Select.Option>
                      <Select.Option value={ProjectStatus.Approved}>Đã phê duyệt</Select.Option>
                      <Select.Option value={ProjectStatus.Executing}>Đang thực hiện</Select.Option>
                      <Select.Option value={ProjectStatus.Suspended}>Tạm dừng</Select.Option>
                      <Select.Option value={ProjectStatus.Completed}>Hoàn thành</Select.Option>
                      <Select.Option value={ProjectStatus.Cancelled}>Hủy bỏ</Select.Option>
                    </Select>
                  </Form.Group>
                </div>
                <div className="col-xl-3 col-lg-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Giai đoạn</Form.Label>
                    <Select
                      placeholder="Chọn giai đoạn"
                      style={{ width: '100%' }}
                      value={searchData?.currentPhase}
                      onChange={value => handleFilterChange('currentPhase', value)}
                      allowClear
                    >
                      <Select.Option value={ProjectPhase.Preparation}>Chuẩn bị đầu tư</Select.Option>
                      <Select.Option value={ProjectPhase.Implementation}>Thực hiện đầu tư</Select.Option>
                      <Select.Option value={ProjectPhase.Completion}>Kết thúc đầu tư</Select.Option>
                      <Select.Option value={ProjectPhase.PostInvestment}>Sau đầu tư</Select.Option>
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
