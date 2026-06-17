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

const STORAGE_KEY = 'project_acceptance_column_config';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'code', title: 'Mã dự án', visible: true },
  { key: 'name', title: 'Tên dự án', visible: true },
  { key: 'projectTypeName', title: 'Loại dự án', visible: true },
  { key: 'investorName', title: 'Chủ đầu tư', visible: true },
  { key: 'totalInvestment', title: 'Tổng mức đầu tư', visible: true },
  { key: 'allocatedCapital', title: 'Vốn đã phân bổ', visible: true },
  { key: 'disbursedCapital', title: 'Vốn đã giải ngân', visible: true },
  { key: 'expectedEndDate', title: 'Ngày kết thúc dự kiến', visible: true },
  { key: 'actualEndDate', title: 'Ngày kết thúc thực tế', visible: true },
  { key: 'currentPhase', title: 'Giai đoạn', visible: true },
  { key: 'status', title: 'Trạng thái', visible: true },
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
      if (status === 3) {
        return 'Nghiệm thu hoàn thành';
      }
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

export const exportProjectAcceptanceToExcel = async (
  projects: IProject[],
  searchData?: any
): Promise<void> => {
  const columnConfig = getColumnConfig();
  const visibleColumns = columnConfig.filter(col => col.visible);

  // Tạo data rows với header là key
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

  // Tạo workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const colWidths = visibleColumns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nghiệm thu hoàn thành');

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `Danh_sach_nghiem_thu_hoan_thanh_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, filename);
};

export const exportProjectAcceptanceToPDF = async (
  projects: IProject[],
  searchData?: any
): Promise<void> => {
  const columnConfig = getColumnConfig();
  const visibleColumns = columnConfig.filter(col => col.visible);

  // Tạo HTML table với tiếng Việt
  const tableContainer = document.createElement('div');
  tableContainer.style.position = 'absolute';
  tableContainer.style.left = '-9999px';
  tableContainer.style.top = '0';
  tableContainer.style.width = '297mm'; // A4 landscape width
  tableContainer.style.padding = '20px';
  tableContainer.style.backgroundColor = 'white';
  tableContainer.style.fontFamily = 'Arial, sans-serif';
  tableContainer.style.fontSize = '10px';

  let tableHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: bold;">DANH SÁCH DỰ ÁN NGHIỆM THU HOÀN THÀNH</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          ${visibleColumns.map(col => `<th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center;">${col.title}</th>`).join('')}
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
          cellValue = col.key === 'status' 
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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `Danh_sach_nghiem_thu_hoan_thanh_${timestamp}.pdf`;

    // Download file
    pdf.save(filename);
  } finally {
    // Cleanup
    document.body.removeChild(tableContainer);
  }
};
