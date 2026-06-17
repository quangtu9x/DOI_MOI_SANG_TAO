import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { DeXuatDeTaiTable } from './components/DeXuatDeTaiTable';
import { requestDownloadFile } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';

const buildExportPayload = (searchData?: SearchData) => ({
  pageNumber: 1,
  pageSize: 0,
  ...(searchData ?? {}),
});

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildPrintHtml = (rows: unknown[][]): string => {
  const [headers = [], ...bodyRows] = rows;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>In danh sách đề xuất đề tài</title>
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

          td:nth-child(1),
          td:nth-child(4),
          td:nth-child(5),
          td:nth-child(6) {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h2>Danh sách đề xuất đề tài</h2>
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${bodyRows
              .map(row => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index])}</td>`).join('')}</tr>`)
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

const printHtml = (html: string): void => {
  const printFrame = document.createElement('iframe');
  printFrame.title = 'In danh sách đề xuất đề tài';
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

export const TraCuuDeXuatDeTaiPage = () => {
  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const response = await requestDownloadFile(`DeXuatDeTais/export`, buildExportPayload(searchData));
      if (response?.status == 200) {
        saveBlobAsFile(response);
      } else {
        toast.error('Xuất dữ liệu thất bại!');
      }
    } catch (error) {
      console.log('Failed:', error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async (): Promise<void> => {
    try {
      setIsPrinting(true);
      const response = await requestDownloadFile(`DeXuatDeTais/export`, buildExportPayload(searchData));

      if (response?.status !== 200) {
        toast.error('Tải dữ liệu in thất bại!');
        return;
      }

      const workbook = XLSX.read(await response.data.arrayBuffer(), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;

      if (!firstSheet) {
        toast.warning('Không có dữ liệu để in!');
        return;
      }

      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as unknown[][];
      if (rows.length <= 1) {
        toast.warning('Không có dữ liệu để in!');
        return;
      }

      printHtml(buildPrintHtml(rows));
    } catch (error) {
      console.log('Failed:', error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Tra cứu Đề xuất đề tài, nhiệm vụ khoa học'}</h3>
            <div className="card-toolbar">
              <div className="d-flex align-items-center">
                <div className="btn-group me-2 w-250px">
                  <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                </div>
                <button
                  className="btn btn-success btn-sm py-2 me-2"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <span>
                    <i className={`fa-regular ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                    <span>Xuất danh sách</span>
                  </span>
                </button>
                <button
                  className="btn btn-primary btn-sm py-2"
                  onClick={handlePrint}
                  disabled={isPrinting}
                >
                  <span>
                    <i className={`fa-regular ${isPrinting ? 'fa-spinner fa-spin' : 'fa-print'} me-2`}></i>
                    <span>In danh sách</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <DeXuatDeTaiTable searchData={searchData} />
        </div>
      </Content>
    </>
  );
};
