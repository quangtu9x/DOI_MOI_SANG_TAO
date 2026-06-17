import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IChuyenGiaDaoTao } from '@/models';
import { TDTable } from '@/app/components';
import { useQuaTrinhDaoTaoTable } from './useQuaTrinhDaoTaoTable';
import { QuaTrinhDaoTaoDetailModal } from './QuaTrinhDaoTaoDetailModal';
import { GENDERS } from '@/data';
import { formatName, getThumbnailUrl, toViewDateString } from '@/utils/utils';

interface DataTableProps {
  searchData?: SearchData;
}

export const QuaTrinhDaoTaoTable: React.FC<DataTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useQuaTrinhDaoTaoTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IChuyenGiaDaoTao): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`chuyengias/${record.id}/daotao`);
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

  const columns: TableProps<IChuyenGiaDaoTao>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },

    {
      title: 'Hình ảnh',
      dataIndex: 'dinhKem',
      key: 'dinhKem',
      className: 'text-center',
      width: 100,
      render: data => <Avatar shape="square" size={64} src={getThumbnailUrl(data)} />
    },
    {
      title: 'Họ tên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      width: '15%',
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
          {formatName(record.hocHamVietTat, record.hocViVietTat, record.hoTen)}

        </a>
      }
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'ngaySinh',
      key: 'ngaySinh',
      className: 'text-center',
      render: data => toViewDateString(data),
    },
    {
      title: "Giới tính",
      dataIndex: "gioiTinh",
      key: "gioiTinh",
      className: "text-center",
      render: data => GENDERS.find(g => g.id === data)?.name || '',
    },
    {
      title: "Liên hệ",
      dataIndex: "email",
      key: "email",
      className: "text-center",
      render: (email, record) => (
        <i className="">
          <span className='fw-semibold me-2'>Email:</span><span className=''>{email}</span>
          <br></br>
          <span className='fw-semibold me-2'>Điện thoại:</span><span className=''>{record.dienThoai}</span>
        </i>
      )
    },
    {
      title: "Đơn vị công tác",
      dataIndex: "donViCongTac",
      key: "donViCongTac",
      className: "text-center",
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
          <TDTable<IChuyenGiaDaoTao>
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
      {modalVisible ? <QuaTrinhDaoTaoDetailModal /> : <></>}
    </>
  );
};

