import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { DatePicker, Form, Input, Select } from 'antd';
import Collapse from 'react-bootstrap/Collapse';

import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { requestPOST } from '@/utils/baseAPI';
import { TDSelect } from '@/app/components';
import { IOrganizationUnit, IPaginationResponse, IPosition } from '@/models';
import { Content } from '@/_metronic/layout/components/content';
import { UserTable } from './components/UserTable';

export const UserPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [form] = Form.useForm<SearchData>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);


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

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">Người dùng</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-200px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              <button className="btn btn-secondary btn-sm py-2 me-2 text-hover-primary" onClick={() => setIsOpen(!isOpen)}>
                <span>
                  <i className="fas fa-search me-2"></i>
                  <span className="">Tìm kiếm nâng cao</span>
                </span>
              </button>
              <button data-tour='user-add' className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNew}>
                <span>
                  <i className="fa-regular fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <Collapse in={isOpen}>
            <div className="row g-5 mt-1">
              <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold  w-150px">Ngày tạo từ:</span>
                <div className="ms-2 w-100 ">
                  <DatePicker
                    format={'DD/MM/YYYY'}
                    style={{ width: '100%' }}
                    onChange={(date, dateString) => {
                      setSearchData({
                        ...searchData,
                        fromDate: date,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold  w-150px">Ngày tạo đến:</span>
                <div className="ms-2 w-100 ">
                  <DatePicker
                    format={'DD/MM/YYYY'}
                    style={{ width: '100%' }}
                    onChange={(date, dateString) => {
                      setSearchData({
                        ...searchData,
                        toDate: date,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold  w-150px">Đơn vị:</span>
                <div className="ms-2 w-100 ">
                  <TDSelect
                    notFoundContent="Không tìm thấy dữ liệu"
                    showSearch
                    placeholder="Chọn"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<IOrganizationUnit[]>>(`organizationunits/search`, {
                        pageNumber: 1,
                        pageSize: 1000,
                        keyword: keyword,
                      });
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    style={{
                      width: '100%',
                    }}
                    onChange={(value, current: any) => {
                      if (value) {
                        setSearchData({
                          ...searchData,
                          organizationUnitId: current?.id,
                        });
                      } else {
                        setSearchData({
                          ...searchData,
                          organizationUnitId: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 btn-group align-items-center px-5">
                <span className="fw-bold  w-150px">Chức vụ:</span>
                <div className="ms-2 w-100 ">
                  <TDSelect
                    notFoundContent="Không tìm thấy dữ liệu"
                    showSearch
                    placeholder="Chọn"
                    fetchOptions={async keyword => {
                      const res = await requestPOST<IPaginationResponse<IPosition[]>>(`positions/search`, {
                        pageNumber: 1,
                        pageSize: 1000,
                        keyword: keyword,
                      });
                      return (
                        res.data?.data?.map(item => ({
                          ...item,
                          label: item?.name,
                          value: item?.id,
                        })) ?? []
                      );
                    }}
                    style={{
                      width: '100%',
                    }}
                    onChange={(value, current: any) => {
                      if (value) {
                        setSearchData({
                          ...searchData,
                          positionId: current?.id,
                        });
                      } else {
                        setSearchData({
                          ...searchData,
                          positionId: null,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </Collapse>
          <UserTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};
