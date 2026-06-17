import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { requestPOST } from '@/utils/baseAPI';
import { ICategoryGroup, IPaginationResponse } from '@/models';
import { DonViCongNhanTable } from './components/DonViCongNhanTable';
import { Select } from 'antd';
import { CATEGORY_GROUP_CODE } from '@/data';

export const DonViCongNhanPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [categoryGroups, setCategoryGroups] = useState<ICategoryGroup[]>([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await requestPOST<IPaginationResponse<ICategoryGroup[]>>(`categorygroups/search`, {
          advancedSearch: {
            fields: ["name", "code"],
            keyword: null,
          },
          code: CATEGORY_GROUP_CODE.DON_VI_CONG_NHAN_SANG_KIEN,
          pageNumber: 1,
          pageSize: 1000,
        });
        if (response.data) {
          const { data } = response.data;
          setCategoryGroups(data ?? []);
        } else {
          setCategoryGroups([]);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
        setCategoryGroups([]);
      }

    };
    fetchData();
  }, []);

  useEffect(() => {
    if (categoryGroups.length > 0) {
      setSearchData(prev => ({
        ...prev,
        categoryGroupId: categoryGroups[0]?.id,
      }));
    }
  }, [categoryGroups]);

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Danh mục đơn vị công nhận sáng kiến'}</h3>
            <div className="card-toolbar">
              <div hidden className="btn-group align-items-center me-2">
                <Select
                  showSearch
                  placeholder="Nhóm danh mục"
                  filterOption={(input, option: any) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  value={searchData?.categoryGroupId}
                  style={{
                    width: 300,
                    marginLeft: 20,
                  }}
                  options={categoryGroups.map((item) => ({
                    ...item,
                    label: item.name,
                    value: item.id,
                  }))}
                />
              </div>
              <div className="btn-group me-2 w-250px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>

              <button className="btn btn-primary btn-sm py-2 me-2" onClick={handleAddNew}>
                <span>
                  <i className="fa-regular fa-plus me-2"></i>
                  <span className="">Thêm mới</span>
                </span>
              </button>
            </div>
          </div>
          <DonViCongNhanTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};

