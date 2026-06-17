import React, { useState } from 'react';
import { Select, DatePicker } from 'antd';
import { ProjectStepExecutionNotificationTable } from './components/ProjectStepExecutionNotificationTable';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { useAuth } from '@/app/modules/auth';
import { StepExecutionNotificationType, NotificationStatus } from '@/models/ke-hoach-von';
import { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const getNotificationTypeLabel = (notificationType: StepExecutionNotificationType): string => {
  switch (notificationType) {
    case StepExecutionNotificationType.Upcoming:
      return 'Sắp đến hạn';
    case StepExecutionNotificationType.Due:
      return 'Đến hạn';
    case StepExecutionNotificationType.Overdue:
      return 'Quá hạn';
    default:
      return '';
  }
};

export const ThongBaoCapNhatXuLyChoBuocThucHienDuAnPage = () => {
  const { currentUser } = useAuth();
  const [searchData, setSearchData] = useState<SearchData | undefined>({
    recipientUserId: currentUser?.id,
  });

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value;
    setSearchData(prev => ({
      ...prev,
      keyword: keyword || undefined,
      recipientUserId: currentUser?.id,
    }));
  };

  const handleNotificationTypeChange = (value: string | undefined) => {
    setSearchData((prev) => ({
      ...prev,
      notificationType: value || undefined,
      recipientUserId: currentUser?.id,
    }));
  };

  const handleStatusChange = (value: string | undefined) => {
    setSearchData((prev) => ({
      ...prev,
      status: value || undefined,
      recipientUserId: currentUser?.id,
    }));
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (dates) {
      setSearchData((prev) => ({
        ...prev,
        fromDate: dates[0]?.format('YYYY-MM-DD') || undefined,
        toDate: dates[1]?.format('YYYY-MM-DD') || undefined,
        recipientUserId: currentUser?.id,
      }));
    } else {
      setSearchData((prev) => ({
        ...prev,
        fromDate: undefined,
        toDate: undefined,
        recipientUserId: currentUser?.id,
      }));
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Thông báo cập nhật xử lý cho bước thực hiện dự án'}</h3>
            <div className="card-toolbar d-flex align-items-center gap-3 flex-wrap">
              <div className="btn-group me-2 w-250px">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  placeholder="Nhập từ khoá tìm kiếm" 
                  onChange={handleKeywordChange} 
                />
              </div>
              <div className="d-flex align-items-center me-2">
                <Select
                  placeholder="Loại thông báo"
                  allowClear
                  style={{ width: 150 }}
                  onChange={handleNotificationTypeChange}
                >
                  <Option value={StepExecutionNotificationType.Upcoming}>
                    {getNotificationTypeLabel(StepExecutionNotificationType.Upcoming)}
                  </Option>
                  <Option value={StepExecutionNotificationType.Due}>
                    {getNotificationTypeLabel(StepExecutionNotificationType.Due)}
                  </Option>
                  <Option value={StepExecutionNotificationType.Overdue}>
                    {getNotificationTypeLabel(StepExecutionNotificationType.Overdue)}
                  </Option>
                </Select>
              </div>
              <div className="d-flex align-items-center me-2">
                <Select
                  placeholder="Trạng thái"
                  allowClear
                  style={{ width: 150 }}
                  onChange={handleStatusChange}
                >
                  <Option value={NotificationStatus.Unread}>Chưa đọc</Option>
                  <Option value={NotificationStatus.Read}>Đã đọc</Option>
                </Select>
              </div>
              <div className='d-flex align-items-center'>
                <RangePicker
                  format="DD-MM-YYYY"
                  style={{ width: '250px' }}
                  onChange={handleDateChange}
                />
              </div>
            </div>
          </div>
          <ProjectStepExecutionNotificationTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};
