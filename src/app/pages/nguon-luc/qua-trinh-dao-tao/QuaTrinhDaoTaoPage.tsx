import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { useAuth } from '@/app/modules/auth';
import { Form } from 'antd';
import { Collapse } from 'react-bootstrap';
import { TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { IPaginationResponse } from '@/models';
import { requestPOST } from '@/utils/baseAPI';
import { useAppConfigs } from '@/hooks';
import { CommonConfigs } from '@/hooks/appConfigHelpers';
import { AnimatePresence, motion } from 'framer-motion';
import { QuaTrinhDaoTaoTable } from './components/QuaTrinhDaoTaoTable';

export const QuaTrinhDaoTaoPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    organizationUnitId: currentUser?.organizationUnitId,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [form] = Form.useForm();

  const {
    provinceCode,
    loading,
  } = useAppConfigs({
    configs: CommonConfigs.ALL_ESSENTIAL
  });

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

  const hasActiveFilters = (): boolean => {
    return !!(searchData?.wardId || searchData?.industrialParkTypeId);
  };

  const handleClearFilters = (): void => {
    form.resetFields();
    setSearchData(prev => ({
      ...prev,
      wardId: null,
      industrialParkTypeId: null,
    }));
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh sách thông tin quá trình đạo tạo và văn bằng được cấp'}</h3>
            <div className="card-toolbar d-flex flex-wrap gap-2">
              <div className="flex-grow-1">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              <button className="btn btn-secondary btn-sm py-2 text-hover-primary" onClick={() => setShowFilter(!showFilter)}>
                <span>
                  <i className="fa-regular fa-filter me-2 text-dark"></i>
                  <span className="">Bộ lọc</span>
                </span>
              </button>
              <AnimatePresence>
                {hasActiveFilters() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                        duration: 0.15,
                      }
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.5,
                      transition: {
                        type: 'tween',
                        ease: 'easeIn',
                        duration: 0.25,
                      }
                    }}
                    className="btn btn-secondary btn-sm py-2 text-hover-danger"
                    onClick={handleClearFilters}
                    title="Xóa tất cả bộ lọc"
                  >
                    <span>
                      <i className="fas fa-times me-2"></i>
                      <span className="">Xóa bộ lọc</span>
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
              <button className="btn btn-primary btn-sm py-2" onClick={handleAddNew}>
                <span>
                  <i className="fa-regular fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <Collapse in={showFilter}>
            <div className='row'>
              <div className='col-xl-12 col-lg-12'>
                <div className='px-3 py-3 border-bottom border-secondary border-bottom-solid '>
                  <Form form={form} autoComplete='off'>
                    <div className='row'>
                      <div className="col-xl-3 col-lg-3">
                        <Form.Item label="Học vị" name="hocVi">
                          <TDSelect
                            notFoundContent="Không tìm thấy dữ liệu"
                            reload
                            showSearch
                            placeholder="Chọn"
                            fetchOptions={async keyword => {
                              const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                pageNumber: 1,
                                pageSize: 1000,
                                keyword: keyword,
                                categoryGroupCode: CATEGORY_GROUP_CODE.HOC_VI,
                              });
                              return (
                                res.data?.data?.map(item => ({
                                  ...item,
                                  label: item?.name,
                                  value: item?.id,
                                })) ?? []
                              );
                            }}
                            onChange={(value, current: any) => {
                              if (value) {
                                setSearchData(prev => ({
                                  ...prev,
                                  hocViId: current.id,
                                }));
                              } else {
                                setSearchData(prev => ({
                                  ...prev,
                                  hocViId: null,
                                }));
                              }
                            }}
                          />
                        </Form.Item>
                      </div>
                      <div className="col-xl-3 col-lg-3">
                        <Form.Item label="Học hàm" name="hocHam"
                        >
                          <TDSelect
                            notFoundContent="Không tìm thấy dữ liệu"
                            reload
                            showSearch
                            placeholder="Chọn"
                            fetchOptions={async keyword => {
                              const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                pageNumber: 1,
                                pageSize: 1000,
                                keyword: keyword,
                                categoryGroupCode: CATEGORY_GROUP_CODE.HOC_HAM,
                              });
                              return (
                                res.data?.data?.map(item => ({
                                  ...item,
                                  label: item?.name,
                                  value: item?.id,
                                })) ?? []
                              );
                            }}
                            onChange={(value, current: any) => {
                              if (value) {
                                setSearchData(prev => ({
                                  ...prev,
                                  hocHamId: current.id,
                                }));
                              } else {
                                setSearchData(prev => ({
                                  ...prev,
                                  hocHamId: null,
                                }));
                              }
                            }}
                          />
                        </Form.Item>
                      </div>

                    </div>
                  </Form>
                </div>
              </div>

            </div>
          </Collapse>
          <QuaTrinhDaoTaoTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};

