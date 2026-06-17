import React, { useState } from 'react';
import { DatePicker, Select } from 'antd';
import { toast } from 'react-toastify';
import { UserUpdateLogTable } from './components/UserUpdateLogTable';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { TDSelect } from '@/app/components';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IUserDto, IUserUpdateLog, UserUpdateActionType } from '@/models';
import { Dayjs } from 'dayjs';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { RangePicker } = DatePicker;
const { Option } = Select;

const getActionTypeLabel = (actionType: string): string => {
  switch (actionType) {
    case UserUpdateActionType.ProfileUpdated:
      return 'Cập nhật profile';
    case UserUpdateActionType.PasswordChanged:
      return 'Đổi mật khẩu';
    case UserUpdateActionType.PermissionsUpdated:
      return 'Cập nhật quyền';
    case UserUpdateActionType.RolesUpdated:
      return 'Cập nhật vai trò';
    default:
      return actionType;
  }
};

export const LichSuCapNhatDuLieuNguoiDungPage = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value;
    setSearchData(prev => ({
      ...prev,
      keyword: keyword || undefined,
    }));
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (dates) {
      setSearchData((prev) => ({
        ...prev,
        fromDate: dates[0]?.format('YYYY-MM-DD') || undefined,
        toDate: dates[1]?.format('YYYY-MM-DD') || undefined,
      }));
    } else {
      setSearchData((prev) => ({
        ...prev,
        fromDate: undefined,
        toDate: undefined,
      }));
    }
  };

  const handleActionTypeChange = (value: string | undefined) => {
    setSearchData((prev) => ({
      ...prev,
      actionType: value || undefined,
    }));
  };

  const fetchAllLogs = async (): Promise<IUserUpdateLog[]> => {
    let allLogs: IUserUpdateLog[] = [];
    let currentPage = 1;
    const pageSize = 1000; // Fetch từng batch 1000 records
    const maxRecords = 100000; // Giới hạn 100000 bản ghi
    let hasMore = true;

    while (hasMore && allLogs.length < maxRecords) {
      const response = await requestPOST<IPaginationResponse<IUserUpdateLog[]>>('users/update-logs', {
        pageNumber: currentPage,
        pageSize,
        ...searchData,
      }, 'neutral');
      if (response.data) {
        const { data: responseData, totalCount } = response.data;

        if (responseData && responseData.length > 0) {
          allLogs = [...allLogs, ...responseData];

          // Kiểm tra xem còn dữ liệu không
          if (allLogs.length >= totalCount || responseData.length < pageSize || allLogs.length >= maxRecords) {
            hasMore = false;
          } else {
            currentPage++;
          }
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    return allLogs?.slice(0, maxRecords) ?? [];
  };
  const handleExportExcel = async () => {
    try {
      toast.info('Đang tải dữ liệu để xuất Excel...');

      const allLogs = await fetchAllLogs();

      if (allLogs.length > 0) {
        // Tạo data rows cho Excel
        const rows = allLogs.map((log, index) => ({
          'STT': index + 1,
          'Người dùng': log.fullName || log.userName || '',
          'Tài khoản': log.userName || '',
          'Loại hành động': getActionTypeLabel(log.actionType),
          'Mô tả': log.description || '',
          'Người thực hiện': log.createdByName || '',
          'Thời gian': log.createdOn ? dayjs(log.createdOn).format('DD/MM/YYYY HH:mm:ss') : '',
        }));

        // Tạo workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);

        // Set column widths
        ws['!cols'] = [
          { wch: 8 },  // STT
          { wch: 25 },  // Người dùng
          { wch: 20 },  // Tài khoản
          { wch: 20 },  // Loại hành động
          { wch: 40 },  // Mô tả
          { wch: 25 },  // Người thực hiện
          { wch: 20 },  // Thời gian
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử cập nhật');

        // Generate filename
        const timestamp = dayjs().format('YYYYMMDD_HHmmss');
        const filename = `Lich_su_cap_nhat_du_lieu_nguoi_dung_${timestamp}.xlsx`;

        // Download file
        XLSX.writeFile(wb, filename);

        toast.success(`Xuất file Excel thành công! Đã xuất ${allLogs.length} bản ghi.`);
      } else {
        toast.error('Không có dữ liệu để xuất!');
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Có lỗi xảy ra khi xuất file. Vui lòng thử lại!');
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Đang tải dữ liệu để xuất PDF...');

      const allLogs = await fetchAllLogs();

      if (allLogs.length > 0) {
        // Tạo HTML table với tiếng Việt
        const tableContainer = document.createElement('div');
        tableContainer.style.position = 'absolute';
        tableContainer.style.left = '-9999px';
        tableContainer.style.top = '0';
        tableContainer.style.width = '297mm'; // A4 landscape width
        tableContainer.style.padding = '20px';
        tableContainer.style.backgroundColor = 'white';
        tableContainer.style.fontFamily = 'Arial, sans-serif';
        tableContainer.style.fontSize = '9px';

        let tableHTML = `
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 18px; font-weight: bold;">LỊCH SỬ CẬP NHẬT DỮ LIỆU NGƯỜI DÙNG</h2>
            <p style="font-size: 12px; margin-top: 5px;">Tổng số: ${allLogs.length} bản ghi</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 5%;">STT</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 15%;">Người dùng</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 12%;">Tài khoản</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 15%;">Loại hành động</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 20%;">Mô tả</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 15%;">Người thực hiện</th>
                <th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 15%;">Thời gian</th>
              </tr>
            </thead>
            <tbody>
        `;

        allLogs.forEach((log, index) => {
          const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
          tableHTML += `<tr style="background-color: ${bgColor};">`;
          tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${index + 1}</td>`;
          tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${log.fullName || log.userName || '-'}</td>`;
          tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${log.userName || '-'}</td>`;
          tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${getActionTypeLabel(log.actionType)}</td>`;
          tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${log.description || '-'}</td>`;
          tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: left;">${log.createdByName || '-'}</td>`;
          tableHTML += `<td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${log.createdOn ? dayjs(log.createdOn).format('DD/MM/YYYY HH:mm:ss') : '-'}</td>`;
          tableHTML += '</tr>';
        });

        tableHTML += `
            </tbody>
          </table>
        `;

        tableContainer.innerHTML = tableHTML;
        document.body.appendChild(tableContainer);

        try {
          // Convert HTML to canvas
          const canvas = await html2canvas(tableContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            width: tableContainer.offsetWidth,
            height: tableContainer.offsetHeight,
          });

          // Calculate PDF dimensions
          const imgWidth = 297; // A4 landscape width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
          });

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

          // Generate filename
          const timestamp = dayjs().format('YYYYMMDD_HHmmss');
          const filename = `Lich_su_cap_nhat_du_lieu_nguoi_dung_${timestamp}.pdf`;

          // Download file
          pdf.save(filename);

          toast.success(`Xuất file PDF thành công! Đã xuất ${allLogs.length} bản ghi.`);
        } finally {
          // Cleanup
          document.body.removeChild(tableContainer);
        }
      } else {
        toast.error('Không có dữ liệu để xuất!');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại!');
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Lịch sử cập nhật dữ liệu người dùng'}</h3>
            <div className="card-toolbar d-flex align-items-center gap-3 flex-wrap">
              <button
                className="btn btn-success btn-sm py-2 me-2"
                onClick={handleExportExcel}
                title="Xuất Excel (tối đa 100,000 bản ghi)"
              >
                <span>
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  <span className="">Xuất Excel</span>
                </span>
              </button>
              <button
                className="btn btn-danger btn-sm py-2 me-2"
                onClick={handleExportPDF}
                title="Xuất PDF (tối đa 100,000 bản ghi)"
              >
                <span>
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  <span className="">Xuất PDF</span>
                </span>
              </button>
              <div className="btn-group me-2 w-250px">
                <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
              </div>
              <div className="d-flex align-items-center me-2">
                <TDSelect
                  notFoundContent="Không tìm thấy dữ liệu"
                  reload
                  showSearch
                  placeholder="Chọn người dùng"
                  allowClear
                  fetchOptions={async keyword => {
                    const res = await requestPOST<IPaginationResponse<IUserDto[]>>(`users/search`, {
                      pageNumber: 1,
                      pageSize: 1000,
                      keyword: keyword
                    }, 'neutral');
                    return (
                      res.data?.data?.map(item => ({
                        ...item,
                        label: item?.userName,
                        value: item?.id,
                      })) ?? []
                    );
                  }}
                  style={{
                    width: 200,
                  }}
                  onChange={(value, current: any) => {
                    if (value) {
                      setSelectedUserId(value.value);
                      setSearchData(prev => ({
                        ...prev,
                        userId: value.value,
                      }));
                    } else {
                      setSelectedUserId(undefined);
                      setSearchData(prev => ({
                        ...prev,
                        userId: null,
                      }));
                    }
                  }}
                />
              </div>
              <div className="d-flex align-items-center me-2">
                <Select
                  placeholder="Loại hành động"
                  allowClear
                  style={{ width: 200 }}
                  onChange={handleActionTypeChange}
                >
                  <Option value={UserUpdateActionType.ProfileUpdated}>
                    {getActionTypeLabel(UserUpdateActionType.ProfileUpdated)}
                  </Option>
                  <Option value={UserUpdateActionType.PasswordChanged}>
                    {getActionTypeLabel(UserUpdateActionType.PasswordChanged)}
                  </Option>
                  <Option value={UserUpdateActionType.PermissionsUpdated}>
                    {getActionTypeLabel(UserUpdateActionType.PermissionsUpdated)}
                  </Option>
                  <Option value={UserUpdateActionType.RolesUpdated}>
                    {getActionTypeLabel(UserUpdateActionType.RolesUpdated)}
                  </Option>
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
          <UserUpdateLogTable searchData={searchData} userId={selectedUserId} />
        </div>
      </Content>
    </>
  );
};
