import React from 'react';
import { Form, Collapse } from 'react-bootstrap';
import { TDSelect, OrganizationUnitTreeSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';
import { SearchData } from '@/types';

interface ProjectAcceptanceFilterSectionProps {
  searchData?: SearchData;
  onFilterChange: (field: string, value: any) => void;
  showFilter: boolean;
}

export const ProjectAcceptanceFilterSection: React.FC<ProjectAcceptanceFilterSectionProps> = ({
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
                  <Form.Label>Mã dự án</Form.Label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập mã dự án"
                    value={searchData?.code || ''}
                    onChange={e => handleFilterChange('code', e.target.value || undefined)}
                  />
                </Form.Group>
              </div>
              <div className="col-xl-3 col-lg-3">
                <Form.Group className="mb-3">
                  <Form.Label>Loại dự án</Form.Label>
                  <TDSelect
                    placeholder="Chọn loại dự án"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(`projecttypes/search`, {
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
                      const res = await requestPOST<IPaginationResponse<any[]>>(`projectgroups/search`, {
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
                    value={searchData?.projectGroupId}
                    onChange={value => handleFilterChange('projectGroupId', value)}
                    allowClear
                  />
                </Form.Group>
              </div>
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
            </div>
            <div className="row">
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
                  <Form.Label>Nhà thầu</Form.Label>
                  <TDSelect
                    placeholder="Chọn nhà thầu"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<any[]>>(`contractors/search`, {
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
                    value={searchData?.contractorId}
                    onChange={value => handleFilterChange('contractorId', value)}
                    allowClear
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Collapse>
  );
};
