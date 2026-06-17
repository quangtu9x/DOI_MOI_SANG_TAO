import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { SearchData } from '@/types';
import { requestDownloadFile } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';

type ExportPayload = SearchData & Record<string, unknown>;

export const buildExportPayload = (searchData?: SearchData, extraData?: Record<string, unknown>): ExportPayload => ({
  pageNumber: 1,
  pageSize: 0,
  ...(searchData ?? {}),
  ...(extraData ?? {}),
});

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildPrintHtml = (rows: unknown[][], title: string): string => {
  const [headers = [], ...bodyRows] = rows;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>In ${escapeHtml(title)}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #181c32;
            margin: 0;
          }

          h2 {
            text-align: center;
            font-size: 18px;
            margin: 0 0 16px;
            text-transform: uppercase;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th,
          td {
            border: 1px solid #7e8299;
            padding: 6px;
            vertical-align: middle;
            word-break: break-word;
          }

          th {
            background: #f1f1f2;
            text-align: center;
            font-weight: 700;
          }

          td:first-child {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h2>${escapeHtml(title)}</h2>
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${bodyRows.map(row => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index])}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

const printHtml = (html: string, title: string): void => {
  const printFrame = document.createElement('iframe');
  printFrame.title = `In ${title}`;
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  printFrame.style.visibility = 'hidden';

  const cleanup = (): void => {
    if (printFrame.parentNode) {
      printFrame.parentNode.removeChild(printFrame);
    }
  };

  printFrame.onload = () => {
    const frameWindow = printFrame.contentWindow;
    if (!frameWindow) {
      cleanup();
      return;
    }

    frameWindow.focus();
    frameWindow.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(() => {
      frameWindow.print();
      setTimeout(cleanup, 60000);
    }, 100);
  };

  document.body.appendChild(printFrame);
  printFrame.srcdoc = html;
};

export const exportList = async (endpoint: string, payload: ExportPayload): Promise<boolean> => {
  try {
    const response = await requestDownloadFile(endpoint, payload);
    if (response?.status === 200) {
      saveBlobAsFile(response);
      return true;
    }

    toast.error('Xuất dữ liệu thất bại!');
    return false;
  } catch (error) {
    console.log('Failed:', error);
    toast.error('Có lỗi xảy ra!');
    return false;
  }
};

export const printList = async (endpoint: string, payload: ExportPayload, title: string): Promise<boolean> => {
  try {
    const response = await requestDownloadFile(endpoint, payload);

    if (response?.status !== 200) {
      toast.error('Tải dữ liệu in thất bại!');
      return false;
    }

    const workbook = XLSX.read(await response.data.arrayBuffer(), { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;

    if (!firstSheet) {
      toast.warning('Không có dữ liệu để in!');
      return false;
    }

    const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as unknown[][];
    if (rows.length <= 1) {
      toast.warning('Không có dữ liệu để in!');
      return false;
    }

    printHtml(buildPrintHtml(rows, title), title);
    return true;
  } catch (error) {
    console.log('Failed:', error);
    toast.error('Có lỗi xảy ra!');
    return false;
  }
};
