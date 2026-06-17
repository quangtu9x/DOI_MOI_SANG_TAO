import React, { useEffect, useState } from 'react';
import { Empty, Modal, Table, Tag } from 'antd';
import { toast } from 'react-toastify';
import { IHoSoSangKien, IHoSoSangKienTrungLap, IResult } from '@/models';
import { requestGET } from '@/utils/baseAPI';
import { TableProps } from 'antd/es/table';

interface TrungLapHoSoModalProps {
  record: IHoSoSangKien | null;
  visible: boolean;
  onClose: () => void;
}

export const TrungLapHoSoModal: React.FC<TrungLapHoSoModalProps> = ({ record, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<IHoSoSangKienTrungLap[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!visible || !record?.id) {
        setItems([]);
        return;
      }

      try {
        setLoading(true);
        const response = await requestGET<IResult<IHoSoSangKienTrungLap[]>>(`HoSoSangKiens/trung-lap/${record.id}`);
        if (response?.data?.succeeded) {
          setItems((response.data.data ?? []).filter(item => item.id !== record.id));
        } else {
          setItems([]);
          toast.error(response?.data?.message || 'Kiểm tra trùng lặp thất bại!');
        }
      } catch (error) {
        console.error('Failed to check duplicated ho so:', error);
        setItems([]);
        toast.error('Có lỗi xảy ra khi kiểm tra trùng lặp!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [record?.id, visible]);

  const columns: TableProps<IHoSoSangKienTrungLap>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Tên sáng kiến',
      dataIndex: 'ten',
      key: 'ten',
      render: value => <span className="fw-semibold">{value}</span>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donViDuocYeuCauTen',
      key: 'donViDuocYeuCauTen',
      width: 220,
      render: value => value || '--',
    },
    {
      title: 'Trùng tên',
      dataIndex: 'tyLeTrungTen',
      key: 'tyLeTrungTen',
      width: 120,
      className: 'text-center',
      render: value => <Tag color={value >= 80 ? 'red' : 'default'}>{value}%</Tag>,
    },
    {
      title: 'Trùng mô tả',
      dataIndex: 'tyLeTrungMoTa',
      key: 'tyLeTrungMoTa',
      width: 120,
      className: 'text-center',
      render: value => <Tag color={value >= 80 ? 'red' : 'default'}>{value}%</Tag>,
    },
    {
      title: 'Lý do',
      dataIndex: 'lyDoTrungLap',
      key: 'lyDoTrungLap',
      width: 150,
    },
  ];

  return (
    <Modal
      title="Danh sách sáng kiến trùng lặp"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1100}
      destroyOnClose
    >
      <div className="mb-3">
        <div className="fw-semibold text-gray-800">{record?.ten}</div>
        {record?.id && <div className="text-muted fs-7">Mã hồ sơ: {record.id}</div>}
      </div>
      <Table<IHoSoSangKienTrungLap>
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={false}
        locale={{ emptyText: <Empty description="Không có sáng kiến trùng lặp" /> }}
      />
    </Modal>
  );
};
