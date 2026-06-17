import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const clientRoot = resolve(repoRoot, 'TD.QLNVKHNew.WebClient');
const apiRoot = resolve(repoRoot, 'TD.QLNVKHNew.WebAPI');

const checks = [
  {
    file: resolve(clientRoot, 'src/app/pages/nhiem-vu/dang-ky-nhiem-vu/tra-cuu-de-xuat-de-tai/TraCuuDeXuatDeTaiPage.tsx'),
    patterns: [
      ['imports requestDownloadFile', /requestDownloadFile/],
      ['imports saveBlobAsFile', /saveBlobAsFile/],
      ['has export loading state', /isExporting/],
      ['calls export endpoint', /requestDownloadFile\(`DeXuatDeTais\/export`/],
      ['sends current search data', /\.\.\.\(searchData \?\? \{\}\)/],
      ['has export button label', /Xuất danh sách/],
    ],
  },
  {
    file: resolve(apiRoot, 'src/Host/Controllers/NhiemVu/DangKyNhiemVu/DeXuatDeTaisController.cs'),
    patterns: [
      ['has export route', /\[HttpPost\("export"\)\]/],
      ['returns excel file', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/],
      ['sends export request', /ExportDeXuatDeTaisRequest/],
    ],
  },
  {
    file: resolve(apiRoot, 'src/Core/Application/NhiemVu/DangKyNhiemVu/DeXuatDeTais/ExportDeXuatDeTaisRequest.cs'),
    patterns: [
      ['uses pagination filter shape', /class ExportDeXuatDeTaisRequest\s*:\s*PaginationFilter/],
      ['keeps status filter', /public TrangThaiDeXuat\? TrangThai/],
      ['maps to search request', /new SearchDeXuatDeTaisRequest/],
      ['uses same search spec', /new DeXuatDeTaisBySearchRequestSpec\(searchRequest\)/],
      ['applies current user org filter', /GetOrganizationUnit\(\)/],
      ['creates workbook', /new XLWorkbook\(\)/],
    ],
  },
];

const failures = [];

for (const check of checks) {
  if (!existsSync(check.file)) {
    failures.push(`${check.file}: missing file`);
    continue;
  }

  const source = readFileSync(check.file, 'utf8');
  for (const [label, pattern] of check.patterns) {
    if (!pattern.test(source)) {
      failures.push(`${check.file}: ${label}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`DeXuat export verification failed (${failures.length} issues):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Verified DeXuatDeTai export wiring.');
