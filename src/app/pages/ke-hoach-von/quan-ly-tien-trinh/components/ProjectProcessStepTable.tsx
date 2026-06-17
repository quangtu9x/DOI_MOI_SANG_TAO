/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectProcessStep, StepType } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteProjectProcessStep } from '@/services/projectProcessStep.service';
import { useProjectProcessStepTable } from './useProjectProcessStepTable';

interface ProjectProcessStepTableProps {
  searchData?: SearchData;
}

export const ProjectProcessStepTable: React.FC<ProjectProcessStepTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectProcessStepTable({ searchData });
  const random = useSelector((state: RootState) => state.global.random);

  const handleAction = async (type: string, record: IProjectProcessStep): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModalCapMot(record));
          dispatch(actionsModal.setModalVisibleCapMot(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModalCapMot({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapMot(true));
          break;
        case 'delete':
          await deleteProjectProcessStep(record.id!);
          toast.success('Xóa thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const getStepTypeLabel = (type?: StepType) => {
    switch (type) {
      case StepType.PreFeasibilityReport:
        return 'Báo cáo nghiên cứu tiền khả thi dự án';
      case StepType.InvestmentPolicyProposal:
        return 'Báo cáo đề xuất chủ trương đầu tư dự án';
      case StepType.InvestmentPolicyDecision:
        return 'Quyết định chủ trương đầu tư dự án';
      case StepType.SurveyTask:
        return 'Nhiệm vụ khảo sát';
      case StepType.FeasibilityReport:
        return 'Báo cáo nghiên cứu khả thi dự án';
      case StepType.BasicDesignPreparation:
        return 'Hồ sơ thiết kế cơ sở - Lập hồ sơ';
      case StepType.BasicDesignAppraisal:
        return 'Hồ sơ thiết kế cơ sở - Thẩm định';
      case StepType.TechnicalEconomicReport:
        return 'Báo cáo kinh tế kỹ thuật';
      case StepType.InvestmentDecision:
        return 'Quyết định đầu tư dự án';
      case StepType.DetailedDesignPreparation:
        return 'Hồ sơ thiết kế chi tiết và dự toán - Lập hồ sơ';
      case StepType.DetailedDesignAppraisal:
        return 'Hồ sơ thiết kế chi tiết và dự toán - Thẩm định';
      case StepType.BiddingContractorSelection:
        return 'Đấu thầu, lựa chọn nhà thầu';
      case StepType.ProductTesting:
        return 'Kiểm thử sản phẩm';
      case StepType.TrialOperation:
        return 'Vận hành thử sản phẩm';
      case StepType.AcceptanceHandover:
        return 'Nghiệm thu, bàn giao sản phẩm';
      case StepType.PaymentSettlement:
        return 'Thanh toán, quyết toán dự án';
      case StepType.PostInvestmentMonitoring:
        return 'Giám sát, đánh giá sau đầu tư';
      default:
        return '';
    }
  };

  const allColumns: TableProps<IProjectProcessStep>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Quy trình',
      dataIndex: 'projectProcessName',
      key: 'projectProcessName',
      width: '30%',
      render: (text, record) => text || record.projectProcessCode || '-',
    },
    {
      title: 'Mã bước',
      dataIndex: 'code',
      key: 'code',
      width: '20%',
    },
    {
      title: 'Tên bước',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Loại bước thực hiện',
      dataIndex: 'stepType',
      key: 'stepType',
      width: '20%',
      render: (text, record) => getStepTypeLabel(record.stepType),
    },
    {
      width: 150,
      title: 'Thao tác',
      key: 'actions',
      className: 'text-center',
      render: (text, record) => {
        return (
          <div className="d-flex justify-content-center gap-2">
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('view', record)}
              title="Xem chi tiết"
            >
              <i className="fa-regular fa-eye"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('edit', record)}
              title="Sửa"
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa bước quy trình này?"
              onConfirm={() => handleAction('delete', record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm" title="Xóa">
                <i className="fa-regular fa-trash"></i>
              </a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IProjectProcessStep>
            dataSource={data}
            columns={allColumns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
            rowKey="id"
          />
        </div>
      </div>
    </>
  );
};
