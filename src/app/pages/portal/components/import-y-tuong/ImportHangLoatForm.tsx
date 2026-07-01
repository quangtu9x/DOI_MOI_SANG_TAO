import { useState } from 'react';
import { Button, Upload, Card, Table, Space, Tag, message, Tabs, Progress, Alert } from 'antd';
import { DownloadOutlined, InboxOutlined, LinkOutlined, FileExcelOutlined, FileProtectOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';
import { zipSync } from 'fflate';
import dayjs from 'dayjs';
import { requestPOST } from '@/utils/baseAPI';

const { Dragger } = Upload;

export interface ImportedRecord {
  key: string;
  tenYTuong: string;
  linhVuc: string;
  moTaVanDe: string;
  noiDungDeXuat: string;
  mucTieu: string;
  nguoiDeXuat: string;
  donViCongTac: string;
  phamViApDung: string;
  loiIchDuKien: string;
  [key: string]: any;
}

interface SendResult {
  key: string;
  tenYTuong: string;
  status: 'success' | 'error';
  message: string;
}

// Internal keys khớp với ImportedRecord — dùng để nhận dạng row 2 trong file mẫu
const TEMPLATE_FIELD_NAMES = new Set([
  'tenYTuong', 'linhVuc', 'moTaVanDe', 'noiDungDeXuat',
  'mucTieu', 'nguoiDeXuat', 'donViCongTac', 'phamViApDung', 'loiIchDuKien',
]);

const isFieldNamesRow = (row: any): boolean => {
  const values = Object.values(row).filter((v) => v !== '');
  return values.length > 0 && values.every((v) => TEMPLATE_FIELD_NAMES.has(v as string));
};

const EXPECTED_HEADERS = [
  'Tên ý tưởng (*)',
  'Lĩnh vực',
  'Mô tả hiện trạng / vấn đề',
  'Nội dung ý tưởng đề xuất',
  'Mục tiêu và giá trị kỳ vọng',
  'Người đề xuất',
  'Đơn vị công tác',
  'Phạm vi áp dụng',
  'Lợi ích dự kiến',
];

const COLUMN_MAP: Record<string, string> = {
  'tên ý tưởng': 'tenYTuong',
  'tên ý tưởng (*)': 'tenYTuong',
  'tenytuong': 'tenYTuong',
  'lĩnh vực': 'linhVuc',
  'lĩnh vực (*)': 'linhVuc',
  'linhvuc': 'linhVuc',
  'mô tả hiện trạng/vấn đề': 'moTaVanDe',
  'mô tả hiện trạng': 'moTaVanDe',
  'motavande': 'moTaVanDe',
  'nội dung ý tưởng đề xuất': 'noiDungDeXuat',
  'nội dung đề xuất': 'noiDungDeXuat',
  'noidungdexuat': 'noiDungDeXuat',
  'mục tiêu và giá trị kỳ vọng': 'mucTieu',
  'mục tiêu': 'mucTieu',
  'muctieu': 'mucTieu',
  'người đề xuất': 'nguoiDeXuat',
  'nguoidx': 'nguoiDeXuat',
  'nguoidexuat': 'nguoiDeXuat',
  'đơn vị công tác': 'donViCongTac',
  'đơn vị': 'donViCongTac',
  'donvi': 'donViCongTac',
  'donvicongtac': 'donViCongTac',
  'phạm vi áp dụng': 'phamViApDung',
  'pham vi ap dung': 'phamViApDung',
  'phamviapdung': 'phamViApDung',
  'lợi ích dự kiến': 'loiIchDuKien',
  'lợi ích': 'loiIchDuKien',
  'loiichdukien': 'loiIchDuKien',
};

// ── XLSX builder (fflate ZIP + raw OOXML) ────────────────────────────────────
// Tạo file .xlsx chuẩn với font TNR, border, màu nền — không cần package ngoài ngoài fflate

const xmlEsc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const buildTemplateXlsx = (): Uint8Array => {
  const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const WORKBOOK = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="MauNhapLieu" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const WORKBOOK_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // Styles:
  //   Font  0 = TNR 11 normal black
  //   Font  1 = TNR 12 bold white        → row 1 header
  //   Font  2 = TNR 10 bold navy         → row 2 field names
  //   Font  3 = TNR 11 bold black        → data cells A/B (tên + lĩnh vực)
  //   Fill  0 = none (required)
  //   Fill  1 = gray125 (required)
  //   Fill  2 = solid #003087 navy       → row 1
  //   Fill  3 = solid #DCE6F1 lightblue  → row 2
  //   Border 0 = no border
  //   Border 1 = thin black all sides
  //   CellXf 0 = default
  //   CellXf 1 = header   (font1, fill2, border1, center+wrap)
  //   CellXf 2 = fieldname (font2, fill3, border1, center+wrap)
  //   CellXf 3 = data normal (font0, fill0, border1, left+wrap)
  //   CellXf 4 = data bold   (font3, fill0, border1, left+wrap)
  const thinBorder = `<left style="thin"><color rgb="FF000000"/></left>
      <right style="thin"><color rgb="FF000000"/></right>
      <top style="thin"><color rgb="FF000000"/></top>
      <bottom style="thin"><color rgb="FF000000"/></bottom>`;
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Times New Roman"/></font>
    <font><sz val="12"/><b/><color rgb="FFFFFFFF"/><name val="Times New Roman"/></font>
    <font><sz val="10"/><b/><color rgb="FF003087"/><name val="Times New Roman"/></font>
    <font><sz val="11"/><b/><name val="Times New Roman"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF003087"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCE6F1"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>${thinBorder}<diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="5">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
  </cellXfs>
</styleSheet>`;

  const COLS = ['A','B','C','D','E','F','G','H','I'];
  const cell = (col: string, row: number, val: string, s: number) =>
    `<c r="${col}${row}" s="${s}" t="inlineStr"><is><t>${xmlEsc(val)}</t></is></c>`;

  const makeRow = (r: number, vals: string[], ht: number, styles: number[]) =>
    `<row r="${r}" ht="${ht}" customHeight="1">${
      vals.map((v, i) => cell(COLS[i], r, v, styles[i])).join('')
    }</row>`;

  const S_HDR  = Array(9).fill(1);
  const S_FLD  = Array(9).fill(2);
  const S_DATA = (i: number) => i < 2 ? 4 : 3;  // A/B bold, rest normal

  const ROW1 = ['Tên ý tưởng (*)','Lĩnh vực','Mô tả hiện trạng / vấn đề',
    'Nội dung ý tưởng đề xuất','Mục tiêu và giá trị kỳ vọng',
    'Người đề xuất','Đơn vị công tác','Phạm vi áp dụng','Lợi ích dự kiến'];
  const ROW2 = ['tenYTuong','linhVuc','moTaVanDe','noiDungDeXuat','mucTieu',
    'nguoiDeXuat','donViCongTac','phamViApDung','loiIchDuKien'];
  const ROW3 = [
    'Triển khai kiosk check-in tự phục vụ tại sân bay',
    'Chuyển đổi số - Dịch vụ hành khách',
    'Nhân viên check-in nhập thủ công nhiều thông tin, gây chậm trễ giờ cao điểm và dễ xảy ra sai sót.',
    'Lắp đặt màn hình tự phục vụ (self-service kiosk) tích hợp DCS, cho phép hành khách tự làm thủ tục check-in.',
    'Giảm 40% thời gian chờ; tăng năng suất nhân viên 30%; cải thiện điểm hài lòng hành khách.',
    'Nguyễn Văn An','Ban Dịch vụ Mặt đất','Toàn bộ sân bay khai thác của VNA',
    'Tiết kiệm ~30% chi phí nhân công; nâng NPS hành khách lên +15 điểm.',
  ];
  const ROW4 = [
    'AI dự đoán nhu cầu nhiên liệu tối ưu theo tuyến bay',
    'Khai thác kỹ thuật - Tối ưu chi phí',
    'Dự toán nhiên liệu dựa trên kinh nghiệm phi công và bảng tính cố định, chưa tính biến động thời tiết thực tế.',
    'Xây dựng module AI tích hợp dữ liệu thời tiết và lịch sử chuyến bay để tính toán lượng nhiên liệu tối ưu tự động.',
    'Giảm 3–5% nhiên liệu dư thừa mỗi chuyến; tiết kiệm hàng tỷ đồng/năm; giảm phát thải CO₂.',
    'Trần Minh Hoàng','Ban Kỹ thuật Bay','Đội bay nội địa và quốc tế',
    'Ước tính tiết kiệm 5–8 triệu USD/năm; giảm phát thải CO₂ ~3,000 tấn/năm.',
  ];

  const SHEET = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="2" topLeftCell="A3" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="38" customWidth="1"/>
    <col min="2" max="2" width="26" customWidth="1"/>
    <col min="3" max="3" width="48" customWidth="1"/>
    <col min="4" max="4" width="48" customWidth="1"/>
    <col min="5" max="5" width="42" customWidth="1"/>
    <col min="6" max="6" width="22" customWidth="1"/>
    <col min="7" max="7" width="24" customWidth="1"/>
    <col min="8" max="8" width="28" customWidth="1"/>
    <col min="9" max="9" width="42" customWidth="1"/>
  </cols>
  <sheetData>
    ${makeRow(1, ROW1, 36, S_HDR)}
    ${makeRow(2, ROW2, 24, S_FLD)}
    ${makeRow(3, ROW3, 55, ROW3.map((_, i) => S_DATA(i)))}
    ${makeRow(4, ROW4, 55, ROW4.map((_, i) => S_DATA(i)))}
  </sheetData>
</worksheet>`;

  const enc = new TextEncoder();
  const zip = zipSync({
    '[Content_Types].xml':       enc.encode(CONTENT_TYPES),
    '_rels/.rels':                enc.encode(RELS),
    'xl/workbook.xml':            enc.encode(WORKBOOK),
    'xl/_rels/workbook.xml.rels': enc.encode(WORKBOOK_RELS),
    'xl/worksheets/sheet1.xml':   enc.encode(SHEET),
    'xl/styles.xml':              enc.encode(STYLES),
  }, { level: 0 });

  return zip;
};

interface ImportHangLoatFormProps {
  onBack: () => void;
  onSubmit: (records: ImportedRecord[]) => void;
}

export const ImportHangLoatForm = ({ onBack, onSubmit }: ImportHangLoatFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('file');
  const [importedData, setImportedData] = useState<ImportedRecord[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [importing, setImporting] = useState(false);

  // Send progress state
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [sendDone, setSendDone] = useState(false);

  const downloadTemplate = () => {
    try {
      const zip  = buildTemplateXlsx();
      const blob = new Blob([zip], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = 'Mau_Import_Y_Tuong.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      message.success('Đã tải xuống file mẫu!');
    } catch {
      message.error('Không tạo được file mẫu!');
    }
  };

  const normalizeHeaders = (headers: string[]): string[] => {
    return headers.map(h => {
      const normalized = h.trim().toLowerCase().replace(/^\s+|\s+$/g, '');
      return COLUMN_MAP[normalized] || normalized;
    });
  };

  const parseExcelFile = (file: File): Promise<ImportedRecord[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet, { defval: '' });

          if (jsonData.length === 0) { reject(new Error('File không có dữ liệu!')); return; }

          const dataRows = jsonData.length > 0 && isFieldNamesRow(jsonData[0]) ? jsonData.slice(1) : jsonData;
          const rawHeaders = Object.keys(dataRows[0] ?? jsonData[0]);
          const mappedHeaders = normalizeHeaders(rawHeaders);

          const records: ImportedRecord[] = dataRows.map((row: any, idx: number) => {
            const record: any = { key: `row-${idx}` };
            rawHeaders.forEach((header, hIdx) => {
              const mappedKey = mappedHeaders[hIdx];
              if (mappedKey && COLUMN_MAP[header.trim().toLowerCase()]) {
                record[COLUMN_MAP[header.trim().toLowerCase()]] = (row[header] || '').toString().trim();
              }
            });
            return record as ImportedRecord;
          });

          resolve(records);
        } catch {
          reject(new Error('Không thể đọc file. Vui lòng kiểm tra định dạng!'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi đọc file!'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSVFile = (file: File): Promise<ImportedRecord[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) { reject(new Error('File CSV không có dữ liệu hoặc chỉ có header!')); return; }

          const firstLine = lines[0];
          const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
          const rawHeaders = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
          const mappedHeaders = normalizeHeaders(rawHeaders);

          const secondLineValues = lines[1]?.split(delimiter).map(v => v.trim().replace(/^"|"$/g, '')) ?? [];
          const secondLineObj = Object.fromEntries(rawHeaders.map((h, i) => [h, secondLineValues[i] ?? '']));
          const dataLines = isFieldNamesRow(secondLineObj) ? lines.slice(2) : lines.slice(1);

          const records: ImportedRecord[] = dataLines.map((line, idx) => {
            const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            const record: any = { key: `row-${idx}` };
            rawHeaders.forEach((header, hIdx) => {
              if (COLUMN_MAP[header.trim().toLowerCase()]) {
                record[COLUMN_MAP[header.trim().toLowerCase()]] = values[hIdx] || '';
              }
            });
            return record as ImportedRecord;
          });

          resolve(records);
        } catch {
          reject(new Error('Không thể đọc file CSV!'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi đọc file!'));
      reader.readAsText(file);
    });
  };

  const handleFileImport = async (file: File) => {
    try {
      message.loading({ content: 'Đang xử lý file...', key: 'importing' });
      let records: ImportedRecord[];

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        records = await parseExcelFile(file);
      } else if (fileName.endsWith('.csv')) {
        records = await parseCSVFile(file);
      } else {
        message.error({ content: 'Định dạng file không hỗ trợ! Chỉ chấp nhận .xlsx, .xls, .csv', key: 'importing' });
        return false;
      }

      if (records.length === 0) {
        message.error({ content: 'Không tìm thấy dữ liệu trong file!', key: 'importing' });
        return false;
      }

      setImportedData(records);
      setIsPreviewVisible(true);
      setSendResults([]);
      setSendDone(false);
      message.success({ content: `Đã đọc thành công ${records.length} ý tưởng từ file!`, key: 'importing' });
      return false;
    } catch (error: any) {
      message.error({ content: error.message || 'Lỗi xử lý file!', key: 'importing' });
      return false;
    }
  };

  const handleApiImport = async () => {
    if (!apiUrl.trim()) { message.warning('Vui lòng nhập URL API!'); return; }
    setImporting(true);
    try {
      const response = await fetch(apiUrl.trim());
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();

      const mapItem = (item: any, idx: number): ImportedRecord => ({
        key: `api-${idx}`,
        tenYTuong: item.tenYTuong || item.title || item.name || '',
        linhVuc: item.linhVuc || item.field || item.category || '',
        moTaVanDe: item.moTaVanDe || item.description || item.problem || '',
        noiDungDeXuat: item.noiDungDeXuat || item.solution || item.content || '',
        mucTieu: item.mucTieu || item.goal || item.objective || '',
        nguoiDeXuat: item.nguoiDeXuat || item.author || item.creator || '',
        donViCongTac: item.donViCongTac || item.department || item.unit || '',
        phamViApDung: item.phamViApDung || item.scope || '',
        loiIchDuKien: item.loiIchDuKien || item.benefit || '',
      });

      const raw = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      const records = raw.map(mapItem);

      if (records.length === 0) { message.warning('API không trả về dữ liệu hợp lệ!'); return; }

      setImportedData(records);
      setIsPreviewVisible(true);
      setSendResults([]);
      setSendDone(false);
      message.success(`Đã lấy thành công ${records.length} ý tưởng từ API!`);
    } catch (error: any) {
      message.error(`Lỗi kết nối API: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleSubmitBatch = async () => {
    if (validRecords.length === 0) { message.warning('Không có ý tưởng hợp lệ nào để gửi!'); return; }

    setSending(true);
    setSentCount(0);
    setSendResults([]);
    setSendDone(false);

    const results: SendResult[] = [];

    for (let i = 0; i < validRecords.length; i++) {
      const rec = validRecords[i];
      const body = {
        code: `YT-${dayjs().format('YYMMDDHHmmss')}-${i + 1}`,
        title: rec.tenYTuong,
        problemDescription: rec.moTaVanDe || '',
        ideaContent: rec.noiDungDeXuat || '',
        expectedBenefit: rec.loiIchDuKien || '',
        templateId: null,
        receiverId: null,
        status: 'DRAFT',
        sourceType: 'IMPORT',
        importBatchId: null,
        linhVuc: rec.linhVuc,
        mucTieu: rec.mucTieu || '',
        nguoiDeXuat: rec.nguoiDeXuat || '',
        donViCongTac: rec.donViCongTac || '',
        phamViApDung: rec.phamViApDung || '',
        ngayApDung: null,
      };

      const res = await requestPOST('ideas', body);
      if (res.status >= 200 && res.status < 300) {
        results.push({ key: rec.key, tenYTuong: rec.tenYTuong, status: 'success', message: 'Thành công' });
      } else {
        const errMsg = (res.data as any)?.message || res.statusText || `HTTP ${res.status}`;
        results.push({ key: rec.key, tenYTuong: rec.tenYTuong, status: 'error', message: errMsg });
      }

      setSentCount(i + 1);
      setSendResults([...results]);
    }

    setSending(false);
    setSendDone(true);

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    if (errorCount === 0) {
      message.success(`Đã gửi thành công ${successCount} ý tưởng!`);
      onSubmit(validRecords);
    } else {
      message.warning(`Gửi xong: ${successCount} thành công, ${errorCount} thất bại.`);
    }
  };

  const columns: ColumnsType<ImportedRecord> = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'stt',
      width: 60,
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: 'Tên ý tưởng',
      dataIndex: 'tenYTuong',
      key: 'tenYTuong',
      width: 200,
      render: (val: string) => val || <span className="text-red-400 italic">(trống)</span>,
    },
    {
      title: 'Lĩnh vực',
      dataIndex: 'linhVuc',
      key: 'linhVuc',
      width: 150,
    },
    {
      title: 'Người đề xuất',
      dataIndex: 'nguoiDeXuat',
      key: 'nguoiDeXuat',
      width: 150,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donViCongTac',
      key: 'donViCongTac',
      width: 150,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_: any, record: ImportedRecord) => {
        const isValid = record.tenYTuong && record.linhVuc;
        return isValid ? <Tag color="green">Hợp lệ</Tag> : <Tag color="red">Thiếu dữ liệu</Tag>;
      },
    },
  ];

  const resultColumns: ColumnsType<SendResult> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: 'Tên ý tưởng',
      dataIndex: 'tenYTuong',
      key: 'tenYTuong',
    },
    {
      title: 'Kết quả',
      key: 'result',
      width: 120,
      render: (_: any, record: SendResult) =>
        record.status === 'success'
          ? <Tag icon={<CheckCircleOutlined />} color="success">Thành công</Tag>
          : <Tag icon={<CloseCircleOutlined />} color="error">Thất bại</Tag>,
    },
    {
      title: 'Chi tiết',
      dataIndex: 'message',
      key: 'message',
      render: (val: string, record: SendResult) =>
        record.status === 'error' ? <span className="text-red-500 text-xs">{val}</span> : <span className="text-green-600 text-xs">{val}</span>,
    },
  ];

  const validRecords = importedData.filter(r => r.tenYTuong && r.linhVuc);
  const invalidRecords = importedData.filter(r => !r.tenYTuong || !r.linhVuc);

  const percent = validRecords.length > 0 ? Math.round((sentCount / validRecords.length) * 100) : 0;
  const successCount = sendResults.filter(r => r.status === 'success').length;
  const errorCount = sendResults.filter(r => r.status === 'error').length;

  const uploadProps: UploadProps = {
    multiple: false,
    accept: '.xlsx,.xls,.csv',
    showUploadList: false,
    beforeUpload: (file) => handleFileImport(file),
    fileList: [],
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">📦 Import ý tưởng hàng loạt</h3>
        <p className="text-gray-500 text-sm">
          Nhập nhiều ý tưởng cùng lúc qua file Excel/CSV hoặc kết nối API từ hệ thống khác.
        </p>
      </div>

      {/* Progress panel — hiển thị khi đang hoặc đã gửi */}
      {(sending || sendDone) && (
        <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-800">
              {sending ? '⏳ Đang gửi dữ liệu lên hệ thống...' : '✅ Hoàn tất gửi dữ liệu'}
            </span>
            <span className="text-sm text-gray-500">
              {sentCount} / {validRecords.length} bản ghi
            </span>
          </div>

          <Progress
            percent={percent}
            status={sending ? 'active' : errorCount > 0 ? 'exception' : 'success'}
            strokeColor={sending ? '#1677ff' : errorCount > 0 ? '#ff4d4f' : '#52c41a'}
          />

          {sendDone && (
            <div className="flex gap-4 mt-3">
              <span className="text-sm text-green-600 font-medium">✓ {successCount} thành công</span>
              {errorCount > 0 && (
                <span className="text-sm text-red-500 font-medium">✗ {errorCount} thất bại</span>
              )}
            </div>
          )}

          {sendResults.length > 0 && (
            <div className="mt-4">
              <Table
                dataSource={sendResults}
                columns={resultColumns}
                rowKey="key"
                size="small"
                pagination={{ pageSize: 5, showSizeChanger: false, showTotal: (total) => `Tổng ${total} bản ghi` }}
                scroll={{ y: 220 }}
              />
            </div>
          )}

          {sendDone && errorCount === 0 && (
            <Alert
              className="mt-4"
              type="success"
              showIcon
              message={`Đã gửi thành công ${successCount} ý tưởng lên hệ thống!`}
            />
          )}
          {sendDone && errorCount > 0 && (
            <Alert
              className="mt-4"
              type="warning"
              showIcon
              message={`${successCount} thành công, ${errorCount} thất bại. Kiểm tra chi tiết bên trên.`}
            />
          )}
        </div>
      )}

      {!sending && !sendDone && (
        <>
          <Card className="mb-6">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'file',
                  label: <span className="px-2"><FileExcelOutlined /> Import từ Excel / CSV</span>,
                  children: (
                    <div className="py-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">Tải file mẫu</p>
                          <p className="text-sm text-gray-500">
                            Tải file Excel mẫu (đã có 2 ví dụ), điền thêm ý tưởng từ dòng 3 trở đi.
                          </p>
                        </div>
                        <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Tải file mẫu</Button>
                      </div>

                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">2</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-1">Tải lên file dữ liệu</p>
                          <p className="text-sm text-gray-500 mb-4">Kéo thả hoặc chọn file Excel (.xlsx, .xls) hoặc CSV (.csv) đã điền dữ liệu.</p>
                          <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                            <p className="ant-upload-text">Nhấp hoặc kéo file vào đây</p>
                            <p className="ant-upload-hint">Hỗ trợ .xlsx, .xls, .csv · Tối đa 1000 bản ghi</p>
                          </Dragger>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'api',
                  label: <span className="px-2"><LinkOutlined /> Import từ API</span>,
                  children: (
                    <div className="py-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL API (trả về JSON)</label>
                        <div className="flex gap-3">
                          <input
                            type="url"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/api/y-tuong"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                          />
                          <Button type="primary" icon={<LinkOutlined />} loading={importing} onClick={handleApiImport}>
                            Lấy dữ liệu
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          API cần trả về mảng JSON hoặc object có chứa trường "data".
                        </p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'integration',
                  label: <span className="px-2"><FileProtectOutlined /> Tích hợp hệ thống</span>,
                  children: (
                    <div className="py-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <i className="fa-solid fa-cloud-arrow-up text-4xl text-blue-400 mb-4 block" />
                        <h4 className="font-semibold text-blue-800 mb-2">Tích hợp hệ thống qua API</h4>
                        <p className="text-blue-600 text-sm mb-4">
                          Hệ thống hỗ trợ tích hợp với các hệ thống bên ngoài qua REST API.
                          Vui lòng liên hệ quản trị viên để được cấp API key và tài liệu tích hợp.
                        </p>
                        <div className="bg-white rounded p-4 text-left border border-blue-100">
                          <p className="text-xs text-gray-500 font-mono mb-2">POST /api/v1/ideas/import-batch</p>
                          <p className="text-xs text-gray-500 font-mono mb-2">Content-Type: application/json</p>
                          <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
{`{
  "apiKey": "your-api-key",
  "items": [
    {
      "tenYTuong": "Tên ý tưởng (*)",
      "linhVuc": "Lĩnh vực (*)",
      "moTaVanDe": "Mô tả hiện trạng",
      "noiDungDeXuat": "Nội dung đề xuất",
      "mucTieu": "Mục tiêu kỳ vọng",
      "nguoiDeXuat": "Họ tên người đề xuất",
      "donViCongTac": "Đơn vị công tác",
      "phamViApDung": "Phạm vi áp dụng",
      "loiIchDuKien": "Lợi ích dự kiến"
    }
  ]
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* Preview imported data */}
          {importedData.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-semibold text-gray-800">Dữ liệu đã import</span>
                  <Tag className="ml-2" color="blue">{importedData.length} bản ghi</Tag>
                  <Tag className="ml-1" color="green">{validRecords.length} hợp lệ</Tag>
                  {invalidRecords.length > 0 && (
                    <Tag className="ml-1" color="red">{invalidRecords.length} thiếu dữ liệu</Tag>
                  )}
                </div>
                <Space>
                  <Button onClick={() => { setImportedData([]); setSendResults([]); setSendDone(false); }}>
                    Xóa dữ liệu
                  </Button>
                  <Button type="primary" onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
                    {isPreviewVisible ? 'Ẩn bảng' : 'Xem trước dữ liệu'}
                  </Button>
                </Space>
              </div>

              {isPreviewVisible && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table
                    dataSource={importedData}
                    columns={columns}
                    scroll={{ x: 900, y: 400 }}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} bản ghi` }}
                    size="small"
                  />
                </div>
              )}

              {invalidRecords.length > 0 && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-sm text-orange-700">
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                    Có <strong>{invalidRecords.length}</strong> bản ghi thiếu tên ý tưởng hoặc lĩnh vực (bắt buộc).
                    Các bản ghi này sẽ được bỏ qua khi gửi.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between mt-4">
        <Space>
          <Button onClick={onBack} disabled={sending}>Quay lại</Button>
        </Space>
        {!sendDone && importedData.length > 0 && (
          <Button
            type="primary"
            loading={sending}
            icon={<i className="fa-regular fa-paper-plane mr-1"></i>}
            onClick={handleSubmitBatch}
            disabled={validRecords.length === 0}
          >
            {sending ? `Đang gửi... (${sentCount}/${validRecords.length})` : `Gửi ${validRecords.length} ý tưởng hợp lệ`}
          </Button>
        )}
        {sendDone && errorCount === 0 && (
          <Button type="primary" onClick={() => onSubmit(validRecords)}>
            Hoàn tất
          </Button>
        )}
        {sendDone && errorCount > 0 && (
          <Space>
            <Button onClick={() => { setSendDone(false); setSendResults([]); setSentCount(0); }}>
              Thử lại
            </Button>
            <Button type="primary" onClick={() => onSubmit(validRecords)}>
              Hoàn tất
            </Button>
          </Space>
        )}
      </div>

      {!sending && !sendDone && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">📋 Yêu cầu dữ liệu</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Các cột <strong>bắt buộc</strong>: Tên ý tưởng, Lĩnh vực</li>
            <li>Các cột <strong>khuyến khích</strong>: Người đề xuất, Đơn vị công tác, Mô tả vấn đề, Nội dung đề xuất, Mục tiêu, Phạm vi áp dụng, Lợi ích dự kiến</li>
            <li>Hỗ trợ nhập tối đa <strong>1000 bản ghi</strong> trong một lần</li>
            <li>Định dạng file hỗ trợ: <Tag>.xlsx</Tag> <Tag>.xls</Tag> <Tag>.csv</Tag></li>
            <li>Mỗi bản ghi sẽ được kiểm tra tính hợp lệ trước khi gửi</li>
            <li>Có thể tải file mẫu để tham khảo cấu trúc dữ liệu chuẩn</li>
          </ul>
        </div>
      )}
    </div>
  );
};
