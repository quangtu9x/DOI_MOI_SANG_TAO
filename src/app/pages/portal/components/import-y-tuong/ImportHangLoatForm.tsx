import { useState } from 'react';
import { Button, Upload, Card, Table, Space, Tag, message, Tabs } from 'antd';
import { DownloadOutlined, InboxOutlined, LinkOutlined, FileExcelOutlined, FileProtectOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;
const { TabPane } = Tabs;

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

const EXPECTED_HEADERS = [
  'Tên ý tưởng',
  'Lĩnh vực',
  'Mô tả hiện trạng/vấn đề',
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

  const downloadTemplate = () => {
    const wsData = [EXPECTED_HEADERS];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 30 }, { wch: 25 }, { wch: 40 },
      { wch: 40 }, { wch: 35 }, { wch: 25 },
      { wch: 25 }, { wch: 25 }, { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'MauNhapLieu');
    XLSX.writeFile(wb, 'Mau_Import_Y_Tuong.xlsx');
    message.success('Đã tải xuống file mẫu!');
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

          if (jsonData.length === 0) {
            reject(new Error('File không có dữ liệu!'));
            return;
          }

          const rawHeaders = Object.keys(jsonData[0]);
          const mappedHeaders = normalizeHeaders(rawHeaders);

          const records: ImportedRecord[] = jsonData.map((row: any, idx: number) => {
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
        } catch (error) {
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
          if (lines.length < 2) {
            reject(new Error('File CSV không có dữ liệu hoặc chỉ có header!'));
            return;
          }

          const firstLine = lines[0];
          const commaCount = (firstLine.match(/,/g) || []).length;
          const semicolonCount = (firstLine.match(/;/g) || []).length;
          const delimiter = semicolonCount > commaCount ? ';' : ',';

          const rawHeaders = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
          const mappedHeaders = normalizeHeaders(rawHeaders);

          const records: ImportedRecord[] = lines.slice(1).map((line, idx) => {
            const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            const record: any = { key: `row-${idx}` };
            rawHeaders.forEach((header, hIdx) => {
              const mappedKey = COLUMN_MAP[header.trim().toLowerCase()] || mappedHeaders[hIdx];
              if (COLUMN_MAP[header.trim().toLowerCase()]) {
                record[COLUMN_MAP[header.trim().toLowerCase()]] = values[hIdx] || '';
              }
            });
            return record as ImportedRecord;
          });

          resolve(records);
        } catch (error) {
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
      message.success({ content: `Đã đọc thành công ${records.length} ý tưởng từ file!`, key: 'importing' });
      return false;
    } catch (error: any) {
      message.error({ content: error.message || 'Lỗi xử lý file!', key: 'importing' });
      return false;
    }
  };

  const handleApiImport = async () => {
    if (!apiUrl.trim()) {
      message.warning('Vui lòng nhập URL API!');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(apiUrl.trim());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      let records: ImportedRecord[] = [];
      if (Array.isArray(data)) {
        records = data.map((item: any, idx: number) => ({
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
        }));
      } else if (data.data && Array.isArray(data.data)) {
        records = data.data.map((item: any, idx: number) => ({
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
        }));
      }

      if (records.length === 0) {
        message.warning('API không trả về dữ liệu hợp lệ!');
        return;
      }

      setImportedData(records);
      setIsPreviewVisible(true);
      message.success(`Đã lấy thành công ${records.length} ý tưởng từ API!`);
    } catch (error: any) {
      message.error(`Lỗi kết nối API: ${error.message}`);
    } finally {
      setImporting(false);
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
        return isValid
          ? <Tag color="green">Hợp lệ</Tag>
          : <Tag color="red">Thiếu dữ liệu</Tag>;
      },
    },
  ];

  const validRecords = importedData.filter(r => r.tenYTuong && r.linhVuc);
  const invalidRecords = importedData.filter(r => !r.tenYTuong || !r.linhVuc);

  const handleSubmitBatch = () => {
    if (validRecords.length === 0) {
      message.warning('Không có ý tưởng hợp lệ nào để gửi!');
      return;
    }
    onSubmit(validRecords);
  };

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

      <Card className="mb-6">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={<span className='px-2'><FileExcelOutlined /> Import từ Excel / CSV</span>}
            key="file"
          >
            <div className="py-6">
              {/* Bước 1: Tải file mẫu */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Tải file mẫu</p>
                  <p className="text-sm text-gray-500">Tải file Excel mẫu, điền thông tin ý tưởng theo đúng cấu trúc.</p>
                </div>
                <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
                  Tải file mẫu
                </Button>
              </div>

              {/* Bước 2: Upload file */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">Tải lên file dữ liệu</p>
                  <p className="text-sm text-gray-500 mb-4">Kéo thả hoặc chọn file Excel (.xlsx, .xls) hoặc CSV (.csv) đã điền dữ liệu.</p>
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Nhấp hoặc kéo file vào đây</p>
                    <p className="ant-upload-hint">
                      Hỗ trợ .xlsx, .xls, .csv · Tối đa 1000 bản ghi
                    </p>
                  </Dragger>

                  {importedData.length > 0 && !isPreviewVisible && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✓ Đã đọc <strong>{importedData.length}</strong> ý tưởng từ file.
                        Bấm <strong>"Xem trước dữ liệu"</strong> để kiểm tra trước khi gửi.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={<span className='px-2'><LinkOutlined /> Import từ API</span>}
            key="api"
          >
            <div className="py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL API (trả về JSON)
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/api/y-tuong"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    loading={importing}
                    onClick={handleApiImport}
                  >
                    Lấy dữ liệu
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  API cần trả về mảng JSON hoặc object có chứa trường "data".
                  Hỗ trợ các trường: tenYTuong, linhVuc, moTaVanDe, noiDungDeXuat, mucTieu, nguoiDeXuat, donViCongTac, phamViApDung, loiIchDuKien.
                </p>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={<span className='px-2'><FileProtectOutlined /> Tích hợp hệ thống</span>}
            key="integration"
          >
            <div className="py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-blue-400 mb-4 block"></i>
                <h4 className="font-semibold text-blue-800 mb-2">Tích hợp hệ thống qua API</h4>
                <p className="text-blue-600 text-sm mb-4">
                  Hệ thống hỗ trợ tích hợp với các hệ thống bên ngoài qua REST API.
                  Vui lòng liên hệ quản trị viên để được cấp API key và tài liệu tích hợp.
                </p>
                <div className="bg-white rounded p-4 text-left border border-blue-100">
                  <p className="text-xs text-gray-500 font-mono mb-2">POST /api/v1/y-tuong/import</p>
                  <p className="text-xs text-gray-500 font-mono mb-2">Content-Type: application/json</p>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
{`{
  "apiKey": "your-api-key",
  "items": [
    {
      "tenYTuong": "Tên ý tưởng",
      "linhVuc": "Lĩnh vực",
      "moTaVanDe": "Mô tả vấn đề",
      "noiDungDeXuat": "Nội dung đề xuất",
      "mucTieu": "Mục tiêu",
      "nguoiDeXuat": "Người đề xuất",
      "donViCongTac": "Đơn vị",
      "phamViApDung": "Phạm vi áp dụng",
      "loiIchDuKien": "Lợi ích dự kiến"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
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
              <Button onClick={() => setImportedData([])}>
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

      <div className="flex items-center justify-between">
        <Space>
          <Button onClick={onBack}>Quay lại</Button>
        </Space>
        {importedData.length > 0 && (
          <Button
            type="primary"
            icon={<i className="fa-regular fa-paper-plane mr-1"></i>}
            onClick={handleSubmitBatch}
            disabled={validRecords.length === 0}
          >
            Gửi {validRecords.length} ý tưởng hợp lệ
          </Button>
        )}
      </div>

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
    </div>
  );
};