import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { IProject, ProjectStatus, ProjectPhase } from '@/models/ke-hoach-von';
import { formatNumber } from '@/utils/utils';

interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
}

const STORAGE_KEY = 'tra_cuu_project_column_config';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'code', title: 'Mã dự án', visible: true },
  { key: 'name', title: 'Tên dự án', visible: true },
  { key: 'projectTypeName', title: 'Loại dự án', visible: false },
  { key: 'projectGroupName', title: 'Nhóm dự án', visible: false },
  { key: 'investorName', title: 'Chủ đầu tư', visible: true },
  { key: 'organizationUnitName', title: 'Đơn vị quản lý', visible: false },
  { key: 'contractorName', title: 'Nhà thầu', visible: false },
  { key: 'investmentCapitalSourceName', title: 'Nguồn vốn đầu tư', visible: false },
  { key: 'provinceName', title: 'Tỉnh/Thành phố', visible: true },
  { key: 'wardName', title: 'Phường/Xã', visible: false },
  { key: 'address', title: 'Địa chỉ', visible: true },
  { key: 'totalInvestment', title: 'Tổng mức đầu tư', visible: true },
  { key: 'allocatedCapital', title: 'Vốn đã phân bổ', visible: true },
  { key: 'disbursedCapital', title: 'Vốn đã giải ngân', visible: true },
  { key: 'startDate', title: 'Ngày bắt đầu', visible: false },
  { key: 'expectedEndDate', title: 'Ngày kết thúc dự kiến', visible: false },
  { key: 'actualEndDate', title: 'Ngày kết thúc thực tế', visible: false },
  { key: 'status', title: 'Trạng thái', visible: true },
  { key: 'currentPhase', title: 'Giai đoạn', visible: true },
  { key: 'description', title: 'Mô tả', visible: false },
  { key: 'objectives', title: 'Mục tiêu', visible: false },
  { key: 'scope', title: 'Phạm vi', visible: false },
  { key: 'content', title: 'Nội dung', visible: false },
  { key: 'expectedResults', title: 'Kết quả mong đợi', visible: false },
  { key: 'note', title: 'Ghi chú', visible: false },
];

const getStatusLabel = (status?: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.Draft:
      return 'Nháp';
    case ProjectStatus.Planning:
      return 'Đang lập kế hoạch';
    case ProjectStatus.Approved:
      return 'Đã phê duyệt';
    case ProjectStatus.Executing:
      return 'Đang thực hiện';
    case ProjectStatus.Suspended:
      return 'Tạm dừng';
    case ProjectStatus.Completed:
      return 'Hoàn thành';
    case ProjectStatus.Cancelled:
      return 'Hủy bỏ';
    default:
      return 'Không xác định';
  }
};

const getPhaseLabel = (phase?: ProjectPhase): string => {
  switch (phase) {
    case ProjectPhase.Preparation:
      return 'Chuẩn bị đầu tư';
    case ProjectPhase.Implementation:
      return 'Thực hiện đầu tư';
    case ProjectPhase.Completion:
      return 'Kết thúc đầu tư';
    case ProjectPhase.PostInvestment:
      return 'Sau đầu tư';
    default:
      return 'Không xác định';
  }
};

const getColumnConfig = (): ColumnConfig[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as ColumnConfig[];
    }
  } catch (error) {
    console.error('Error loading column config:', error);
  }
  return DEFAULT_COLUMNS;
};

export const exportProjectsToExcel = async (
  projects: IProject[],
  searchData?: any
): Promise<void> => {
  // Xuất Excel theo cấu hình cột hiện tại
  const columnConfig = getColumnConfig();
  const visibleColumns = columnConfig.filter(col => col.visible);

  const rows = projects.map(project => {
    const row: any = {};
    visibleColumns.forEach(col => {
      switch (col.key) {
        case 'totalInvestment':
        case 'allocatedCapital':
        case 'disbursedCapital':
          row[col.title] = project[col.key as keyof IProject]
            ? formatNumber(project[col.key as keyof IProject] as number)
            : '-';
          break;
        case 'status':
          row[col.title] = getStatusLabel(project.status);
          break;
        case 'currentPhase':
          row[col.title] = getPhaseLabel(project.currentPhase);
          break;
        case 'startDate':
        case 'expectedEndDate':
        case 'actualEndDate':
          row[col.title] = project[col.key as keyof IProject]
            ? new Date(project[col.key as keyof IProject] as string).toLocaleDateString('vi-VN')
            : '-';
          break;
        default:
          row[col.title] = project[col.key as keyof IProject] || '-';
      }
    });
    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = visibleColumns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách dự án');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `Danh_sach_du_an_${timestamp}.xlsx`;

  XLSX.writeFile(wb, filename);
};

export const exportProjectsToPDF = async (
  projects: IProject[],
  searchData?: any
): Promise<void> => {
  // Xuất PDF theo cấu hình cột hiện tại
  const columnConfig = getColumnConfig();
  const visibleColumns = columnConfig.filter(col => col.visible);

  const tableContainer = document.createElement('div');
  tableContainer.style.position = 'absolute';
  tableContainer.style.left = '-9999px';
  tableContainer.style.top = '0';
  tableContainer.style.width = '297mm';
  tableContainer.style.padding = '20px';
  tableContainer.style.backgroundColor = 'white';
  tableContainer.style.fontFamily = 'Arial, sans-serif';
  tableContainer.style.fontSize = '10px';

  let tableHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: bold;">DANH SÁCH DỰ ÁN</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          ${visibleColumns
            .map(
              col =>
                `<th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center;">${col.title}</th>`
            )
            .join('')}
        </tr>
      </thead>
      <tbody>
  `;

  projects.forEach((project, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
    tableHTML += `<tr style="background-color: ${bgColor};">`;
    visibleColumns.forEach(col => {
      let cellValue = '-';
      let textAlign = 'left';

      switch (col.key) {
        case 'totalInvestment':
        case 'allocatedCapital':
        case 'disbursedCapital':
          cellValue = project[col.key as keyof IProject]
            ? formatNumber(project[col.key as keyof IProject] as number)
            : '-';
          textAlign = 'right';
          break;
        case 'status':
        case 'currentPhase':
          cellValue =
            col.key === 'status'
              ? getStatusLabel(project.status)
              : getPhaseLabel(project.currentPhase);
          textAlign = 'center';
          break;
        case 'startDate':
        case 'expectedEndDate':
        case 'actualEndDate':
          cellValue = project[col.key as keyof IProject]
            ? new Date(project[col.key as keyof IProject] as string).toLocaleDateString('vi-VN')
            : '-';
          textAlign = 'center';
          break;
        default:
          cellValue = String(project[col.key as keyof IProject] || '-');
      }
      tableHTML += `<td style="border: 1px solid #ddd; padding: 6px; text-align: ${textAlign};">${cellValue}</td>`;
    });
    tableHTML += '</tr>';
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = tableHTML;
  document.body.appendChild(tableContainer);

  try {
    const canvas = await html2canvas(tableContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: tableContainer.offsetWidth,
      height: tableContainer.offsetHeight,
    });

    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `Danh_sach_du_an_${timestamp}.pdf`;

    pdf.save(filename);
  } finally {
    document.body.removeChild(tableContainer);
  }
};

