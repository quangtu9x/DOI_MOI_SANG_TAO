import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { KiemTraTrungLapTable } from './components/KiemTraTrungLapTable';
import { IPaginationResponse, TrangThaiHoSoSangKien } from '@/models';
import { Form } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { Collapse } from 'react-bootstrap';
import { TDSelect } from '@/app/components';
import { requestPOST } from '@/utils/baseAPI';
import { CATEGORY_GROUP_CODE } from '@/data';

export const KiemTraTrungLapPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>({ trangThai: TrangThaiHoSoSangKien.DaTiepNhan });
  const [showFilter, setShowFilter] = useState(false);
  const [form] = Form.useForm();

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const hasActiveFilters = (): boolean => {
    return !!(searchData?.linhVucId);
  };

  const handleClearFilters = (): void => {
    form.resetFields();
    setSearchData(prev => ({
      ...prev,
      linhVucId: null,
    }));
  };


  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Kiểm tra trùng lặp sáng kiến'}</h3>
            <div className="card-toolbar">
              <div className="btn-group me-2 w-250px">
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
            </div>
          </div>
          <Collapse in={showFilter}>
            <div className='row'>
              <div className='col-xl-12 col-lg-12'>
                <div className='px-3 py-3 border-bottom border-secondary border-bottom-solid '>
                  <Form form={form} autoComplete='off'>
                    <div className='row'>
                      <div className="col-xl-3 col-lg-3">
                        <Form.Item label="Lĩnh vực" name="linhVuc">
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
                                categoryGroupCode: CATEGORY_GROUP_CODE.LINH_VUC_SANG_KIEN,
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
                                  linhVucId: current.id,
                                }));
                              } else {
                                setSearchData(prev => ({
                                  ...prev,
                                  linhVucId: null,
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
          <KiemTraTrungLapTable searchData={searchData} />
        </div>
      </Content >
    </>
  );
};

