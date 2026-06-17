import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  IProjectDifficulty,
  ProjectDifficultyType,
  ProjectDifficultyLevel,
  ResolutionStatus,
} from '@/models/ke-hoach-von';

interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
}

const STORAGE_KEY = 'project_situation_column_config';

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'projectCode', title: 'Mã dự án', visible: true },
  { key: 'projectName', title: 'Tên dự án', visible: true },
  { key: 'title', title: 'Tiêu đề', visible: true },
  { key: 'type', title: 'Loại', visible: true },
  { key: 'level', title: 'Mức độ', visible: true },
  { key: 'occurredDate', title: 'Ngày phát sinh', visible: true },
  { key: 'resolutionStatus', title: 'Trạng thái xử lý', visible: true },
  { key: 'resolvedDate', title: 'Ngày xử lý', visible: false },
  { key: 'resolutionResult', title: 'Kết quả xử lý', visible: false },
  { key: 'content', title: 'Nội dung', visible: false },
  { key: 'note', title: 'Ghi chú', visible: false },
];

const getTypeLabel = (type?: ProjectDifficultyType): string => {
  switch (type) {
    case ProjectDifficultyType.Technical:
      return 'Kỹ thuật';
    case ProjectDifficultyType.Financial:
      return 'Tài chính';
    case ProjectDifficultyType.Legal:
      return 'Pháp lý';
    case ProjectDifficultyType.Other:
      return 'Khác';
    default:
      return 'Không xác định';
  }
};

const getLevelLabel = (level?: ProjectDifficultyLevel): string => {
  switch (level) {
    case ProjectDifficultyLevel.Low:
      return 'Thấp';
    case ProjectDifficultyLevel.Medium:
      return 'Trung bình';
    case ProjectDifficultyLevel.High:
      return 'Cao';
    case ProjectDifficultyLevel.Critical:
      return 'Nghiêm trọng';
    default:
      return 'Không xác định';
  }
};

const getResolutionStatusLabel = (status?: ResolutionStatus): string => {
  switch (status) {
    case ResolutionStatus.Pending:
      return 'Chờ xử lý';
    case ResolutionStatus.InProgress:
      return 'Đang xử lý';
    case ResolutionStatus.Resolved:
      return 'Đã xử lý';
    case ResolutionStatus.Unresolved:
      return 'Không thể xử lý';
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

export const exportProjectSituationsToExcel = async (
  situations: IProjectDifficulty[],
  searchData?: any
): Promise<void> => {
  const columnConfig = getColumnConfig();
  const visibleColumns = columnConfig.filter(col => col.visible);

  // Tạo data rows với header là key
  const rows = situations.map(situation => {
    const row: any = {};
    visibleColumns.forEach(col => {
      switch (col.key) {
        case 'type':
          row[col.title] = getTypeLabel(situation.type);
          break;
        case 'level':
          row[col.title] = getLevelLabel(situation.level);
          break;
        case 'resolutionStatus':
          row[col.title] = getResolutionStatusLabel(situation.resolutionStatus);
          break;
        case 'occurredDate':
        case 'resolvedDate':
          row[col.title] = situation[col.key as keyof IProjectDifficulty]
            ? new Date(situation[col.key as keyof IProjectDifficulty] as string).toLocaleDateString('vi-VN')
            : '-';
          break;
        default:
          row[col.title] = situation[col.key as keyof IProjectDifficulty] || '-';
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

  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách tình hình thực hiện');

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `Danh_sach_tinh_hinh_thuc_hien_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, filename);
};

export const exportProjectSituationsToPDF = async (
  situations: IProjectDifficulty[],
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
      <h2 style="font-size: 18px; font-weight: bold;">DANH SÁCH TÌNH HÌNH THỰC HIỆN DỰ ÁN</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          ${visibleColumns.map(col => `<th style="border: 1px solid #ddd; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center;">${col.title}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  situations.forEach((situation, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
    tableHTML += `<tr style="background-color: ${bgColor};">`;
    visibleColumns.forEach(col => {
      let cellValue = '-';
      let textAlign = 'left';
      
      switch (col.key) {
        case 'type':
          cellValue = getTypeLabel(situation.type);
          textAlign = 'center';
          break;
        case 'level':
          cellValue = getLevelLabel(situation.level);
          textAlign = 'center';
          break;
        case 'resolutionStatus':
          cellValue = getResolutionStatusLabel(situation.resolutionStatus);
          textAlign = 'center';
          break;
        case 'occurredDate':
        case 'resolvedDate':
          cellValue = situation[col.key as keyof IProjectDifficulty]
            ? new Date(situation[col.key as keyof IProjectDifficulty] as string).toLocaleDateString('vi-VN')
            : '-';
          textAlign = 'center';
          break;
        default:
          cellValue = String(situation[col.key as keyof IProjectDifficulty] || '-');
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
    const filename = `Danh_sach_tinh_hinh_thuc_hien_${timestamp}.pdf`;

    // Download file
    pdf.save(filename);
  } finally {
    // Cleanup
    document.body.removeChild(tableContainer);
  }
};
