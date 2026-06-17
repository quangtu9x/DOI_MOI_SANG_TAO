import { useState, type Key } from 'react';
import { toast } from 'react-toastify';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { ThongKeBaoCaoTable } from './components/ThongKeBaoCaoTable';
import { IPaginationResponse } from '@/models';
import { Form } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { OrganizationUnitTreeSelect, TDSelect } from '@/app/components';
import { requestDownloadFile, requestPOST } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';

type DotXetSangKienOption = {
  id: string;
  ten?: string | null;
};

type CategoryOption = {
  id: string;
  name?: string | null;
};

type ThongKeBaoCaoSelectOption = DefaultOptionType & {
  id?: string | number;
};

const getSingleOption = (option?: DefaultOptionType | DefaultOptionType[]): ThongKeBaoCaoSelectOption | undefined => {
  return Array.isArray(option) ? option[0] : option;
};

export const ThongKeBaoCaoPage = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    searching: false,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingResult, setIsExportingResult] = useState(false);
  const [form] = Form.useForm();

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const { searching, ...filters } = searchData ?? {};
      const response = await requestDownloadFile('HoSoSangKiens/export-thong-ke-bao-cao', filters);
      if (response?.status === 200) {
        saveBlobAsFile(response);
      } else {
        toast.error('Xuất dữ liệu thất bại!');
      }
    } catch (error) {
      console.error('Export thong ke bao cao error:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportResult = async (): Promise<void> => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn một hồ sơ sáng kiến được công nhận để xuất đánh giá!');
      return;
    }

    try {
      setIsExportingResult(true);
      const response = await requestDownloadFile('HoSoSangKiens/export-ket-qua', {
        hoSoId: selectedRowKeys[0],
      });
      if (response?.status === 200) {
        saveBlobAsFile(response);
      } else {
        toast.error('Xuất dữ liệu thất bại!');
      }
    } catch (error) {
      console.error('Export ket qua danh gia error:', error);
      toast.error('Có lỗi xảy ra khi xuất dữ liệu!');
    } finally {
      setIsExportingResult(false);
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thống kê báo cáo'}</h3>
            <div className="card-toolbar">
            </div>
          </div>
          <div className='row'>
            <div className='col-xl-12 col-lg-12'>
              <div className='px-3 py-3 border-bottom border-secondary border-bottom-solid '>
                <Form form={form} autoComplete='off'>
                  <div className='row'>
                    <div className="col-xl-3 col-lg-3">
                      <Form.Item label="Đợt xét sáng kiến" name="dotXetSangKien">
                        <TDSelect
                          notFoundContent="Không tìm thấy dữ liệu"
                          reload
                          showSearch
                          placeholder="Chọn"
                          fetchOptions={async keyword => {
                            const res = await requestPOST<IPaginationResponse<DotXetSangKienOption[]>>(`dotxetsangkiens/search`, {
                              pageNumber: 1,
                              pageSize: 1000,
                              keyword: keyword,
                            });
                            return (
                              res.data?.data?.map(item => ({
                                ...item,
                                label: item?.ten,
                                value: item?.id,
                              })) ?? []
                            );
                          }}
                          onChange={(value, current) => {
                            const selected = getSingleOption(current);
                            if (value) {
                              setSearchData(prev => ({
                                ...prev,
                                dotXetSangKienId: selected?.id ?? null,
                              }));
                            } else {
                              setSearchData(prev => ({
                                ...prev,
                                dotXetSangKienId: null,
                              }));
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-xl-3 col-lg-3">
                      <Form.Item label="Đơn vị" name="donViDuocYeuCau">
                        <OrganizationUnitTreeSelect
                          useCurrentUserDefault={false}
                          placeholder="Chọn"
                          onChange={value => {
                            setSearchData(prev => ({
                              ...prev,
                              donViDuocYeuCauId: value || null,
                            }));
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-xl-3 col-lg-3">
                      <Form.Item label="Lĩnh vực" name="linhVuc">
                        <TDSelect
                          notFoundContent="Không tìm thấy dữ liệu"
                          reload
                          showSearch
                          placeholder="Chọn"
                          fetchOptions={async keyword => {
                            const res = await requestPOST<IPaginationResponse<CategoryOption[]>>(`categories/search`, {
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
                          onChange={(value, current) => {
                            const selected = getSingleOption(current);
                            if (value) {
                              setSearchData(prev => ({
                                ...prev,
                                linhVucId: selected?.id ?? null,
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
                    <div className="col-xl-3 col-lg-3">
                      <Form.Item label="Trạng thái" name="trangThai">
                        <TDSelect
                          notFoundContent="Không tìm thấy dữ liệu"
                          reload
                          placeholder="Chọn"
                          fetchOptions={async () =>
                            TRANG_THAI_HO_SO_SANG_KIEN.map(item => ({
                              id: item.id,
                              label: item.name,
                              value: item.id,
                            }))
                          }
                          onChange={(value, current) => {
                            const selected = getSingleOption(current);
                            if (value) {
                              setSearchData(prev => ({
                                ...prev,
                                trangThai: selected?.id ?? null,
                              }));
                            } else {
                              setSearchData(prev => ({
                                ...prev,
                                trangThai: null,
                              }));
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </Form>
                <div className='row'>
                  <div className='col-xl-12 col-lg-12 d-flex justify-content-center'>
                    <div
                      className='btn btn-sm btn-primary'
                      onClick={() => {
                        setSelectedRowKeys([]);
                        setSearchData(prev => ({
                          ...prev,
                          searching: true,
                        }));
                      }}
                    >
                      <i className='fa fa-search'></i>&nbsp;
                      Thống kê
                    </div>
                    <div
                      className={`btn btn-sm btn-success ms-2 ${isExporting ? 'disabled' : ''}`}
                      onClick={isExporting ? undefined : handleExport}
                    >
                      <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-file-export'} me-2`}></i>
                      Xuất danh sách
                    </div>
                    <div
                      className={`btn btn-sm btn-info ms-2 ${isExportingResult ? 'disabled' : ''}`}
                      onClick={isExportingResult ? undefined : handleExportResult}
                    >
                      <i className={`fa-regular ${isExportingResult ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                      Xuất đánh giá
                    </div>
                    <div
                      className='btn btn-sm btn-secondary ms-2'
                      onClick={() => {
                        form.resetFields();
                        setSelectedRowKeys([]);
                        setSearchData({
                          searching: false,
                        });
                      }}
                    >
                      <i className="fa-regular fa-xmark me-2"></i>
                      Xóa bộ lọc
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <ThongKeBaoCaoTable searchData={searchData} selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys} />
        </div>
      </Content >
    </>
  );
};

