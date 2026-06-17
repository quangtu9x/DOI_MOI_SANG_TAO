import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '../src/app/pages/admins/catalogs');

const walk = dir =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const tableFiles = walk(root).filter(path => path.endsWith('Table.tsx'));
const modalFiles = walk(root).filter(path => path.endsWith('DetailModal.tsx'));
const failures = [];

for (const file of tableFiles) {
  const source = readFileSync(file, 'utf8');
  const checks = [
    ['has view action', /title="Xem chi tiết"/],
    ['has edit action', /title="Chỉnh sửa"/],
    ['has delete action', /title="Xoá"/],
    ['handles delete action', /case 'delete':/],
    ['uses view icon', /fa-regular fa-eye/],
    ['uses edit icon', /fa-regular fa-pen-to-square/],
    ['uses delete icon', /fa-regular fa-trash/],
    ['view opens read-only detail', /readOnly:\s*true/],
    ['edit opens editable detail', /title="Chỉnh sửa"[\s\S]*handleAction\((['`])detail\1, record\)/],
  ];

  for (const [label, pattern] of checks) {
    if (!pattern.test(source)) {
      failures.push(`${file}: ${label}`);
    }
  }
}

for (const file of modalFiles) {
  const source = readFileSync(file, 'utf8');
  const checks = [
    ['uses read-only title', /dataModal\?\.readOnly\s*\?\s*'Chi tiết'/],
    ['disables form when read-only', /disabled=\{dataModal\?\.readOnly \?\? false\}/],
    ['hides save button when read-only', /!\s*dataModal\?\.readOnly\s*&&/],
    ['uses sample save button footer pattern', /<Modal\.Footer[\s\S]*?>\s*\{!dataModal\?\.readOnly && \(\s*<div className="d-flex justify-content-center  align-items-center">[\s\S]*?<Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick=\{onFinish\} disabled=\{buttonLoading\}>/],
  ];

  for (const [label, pattern] of checks) {
    if (!pattern.test(source)) {
      failures.push(`${file}: ${label}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Catalog action verification failed (${failures.length} issues):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Verified ${tableFiles.length} catalog tables and ${modalFiles.length} detail modals.`);
