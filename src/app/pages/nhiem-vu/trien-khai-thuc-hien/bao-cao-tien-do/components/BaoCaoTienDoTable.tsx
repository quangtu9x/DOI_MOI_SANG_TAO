import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Popconfirm, Progress } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IBaoCaoTienDo } from '@/models';
import { TDTable } from '@/app/components';
import { useBaoCaoTienDoTable } from './useBaoCaoTienDoTable';
import { BaoCaoTienDoDetailModal } from './BaoCaoTienDoDetailModal';
import { toViewDateString } from '@/utils/utils';
import { TU_DANH_GIA } from '@/data';

interface BaoCaoTienDoTableProps {
  searchData?: SearchData;
}

export const BaoCaoTienDoTable: React.FC<BaoCaoTienDoTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useBaoCaoTienDoTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IBaoCaoTienDo): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`BaoCaoTienDos/${record.id}`);
            if (response?.data?.succeeded) {
              toast.success('Xóa thành công!');
              dispatch(actionsGlobal.setRandom());
            } else {
              toast.error(response?.data?.message || 'Xóa thất bại, vui lòng thử lại!');
            }
            break;

          default:
            break;
        }
      } catch (error) {
        console.error('Error handling action:', error);
        toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    },
    [dispatch]
  );

  const columns: TableProps<IBaoCaoTienDo>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Kế hoạch thực hiện',
      dataIndex: 'keHoachThucHienTen',
      key: 'keHoachThucHienTen',
      render: (text, record) => {
        return <a
          className="fw-bold"
          data-toggle="m-tooltip"
          title={`Bấm để xem chi tiết`}
          style={{ textAlign: "center" }}
          onClick={() => {
            dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
            dispatch(actionsModal.setModalVisible(true));
          }}
        >
          {text}
        </a>
      }
    },
    {
      title: 'Hợp đồng',
      dataIndex: 'hopDongTen',
      key: 'hopDongTen',
      className: 'text-left',
      width: '20%',
    },
    {
      title: 'Ngày báo cáo',
      dataIndex: 'ngayBaoCao',
      key: 'ngayBaoCao',
      className: 'text-center',
      width: '12%',
      render: data => toViewDateString(data),
    },

    {
      title: 'Tỷ lệ hoàn thành (%)',
      dataIndex: 'phanTramHoanThanh',
      key: 'phanTramHoanThanh',
      className: 'text-center',
      width: '12%',
      render: (value: number) => (
        <Progress
          percentPosition={{ align: 'end', type: 'outer' }}
          percent={value ?? 0}
          size="small"
          status={value >= 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Tự đánh giá tiến độ',
      dataIndex: 'tuDanhGia',
      key: 'tuDanhGia',
      className: 'text-center',
      width: '12%',
      render: data => TU_DANH_GIA.find(item => item.id === data)?.name || '',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: 140,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                handleAction(`detail`, { ...record, readOnly: true });
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Chỉnh sửa"
              onClick={() => {
                handleAction(`detail`, record);
              }}
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>
            <Popconfirm
              title="Xoá?"
              onConfirm={() => {
                handleAction(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
                <i className="fa-regular fa-trash"></i>
              </a>
            </Popconfirm>
          </div >
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IBaoCaoTienDo>
            dataSource={data}
            columns={columns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
          />
        </div>
      </div>
      {modalVisible ? <BaoCaoTienDoDetailModal totalCount={totalCount} /> : <></>}
    </>
  );
};

