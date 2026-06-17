import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsGlobal from '@/redux/global/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { KeHoachChoDuyetTable } from './components/KeHoachChoDuyetTable';
import clsx from 'clsx';
import { TrangThaiDuyet } from '@/models';
import { toast } from 'react-toastify';
import { KeHoachActionModal } from './components/KeHoachActionModal';

const statusTabs = [
  { label: 'Chờ duyệt', value: TrangThaiDuyet.ChoDuyet },
  { label: 'Đã duyệt', value: TrangThaiDuyet.DaDuyet },
  { label: 'Từ chối', value: TrangThaiDuyet.TuChoi },
];

export const KeHoachChoDuyetPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchData, setSearchData] = useState<SearchData | undefined>({ trangThai: TrangThaiDuyet.ChoDuyet });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleOpenActionModal = (type: 'approve' | 'reject') => {
    if (selectedRowKeys.length !== 1) {
      toast.warning('Vui lòng chọn một bản ghi!');
      return;
    }
    setModalType(type);
    setModalVisible(true);
  };

  const handleActionSuccess = () => {
    setSelectedRowKeys([]);
    dispatch(actionsGlobal.setRandom());
  };

  const handleStatusTabChange = (trangThai: TrangThaiDuyet): void => {
    setSearchData(prev => ({ ...prev, trangThai }));
    setSelectedRowKeys([]);
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Kế hoạch xin vốn chờ duyệt'}</h3>
            <div className="card-toolbar d-flex align-items-center gap-2">

              <div className="btn-group w-250px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              {searchData?.trangThai === TrangThaiDuyet.ChoDuyet && (
                <>
                  <button className="btn btn-sm btn-success" onClick={() => handleOpenActionModal('approve')}>
                    <i className="fa-regular fa-check me-1"></i> Duyệt
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleOpenActionModal('reject')}>
                    <i className="fa-regular fa-xmark me-1"></i> Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="card-header border-bottom p-3 pb-0">
            <div className="card-toolbar">
              <ul className="nav flex-wrap">
                {statusTabs.map(tab => (
                  <li className="nav-item" key={tab.value}>
                    <a
                      className={clsx(
                        'nav-link btn btn-color-muted btn-active btn-active-light-primary fw-bold px-4 me-1 fs-6',
                        searchData?.trangThai === tab.value && 'active'
                      )}
                      onClick={() => handleStatusTabChange(tab.value)}
                    >
                      {tab.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <KeHoachChoDuyetTable
            searchData={searchData}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
          />
        </div>
      </Content>
      {modalVisible && modalType && (
        <KeHoachActionModal
          visible={modalVisible}
          type={modalType}
          id={selectedRowKeys[0] as string}
          onClose={() => setModalVisible(false)}
          onSuccess={handleActionSuccess}
        />
      )}
    </>
  );
};

