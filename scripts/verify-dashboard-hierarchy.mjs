import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dashboardFile = resolve(
  import.meta.dirname,
  '..',
  'src/app/pages/dashboard/DashboardWrapper.tsx',
);

const source = readFileSync(dashboardFile, 'utf8');

const checks = [
  ['has top-level grouped overview', /dashboardSections/],
  ['has resources section', /Nguồn lực/],
  ['has research tasks section', /Nhiệm vụ NCKH/],
  ['has initiatives section', /Sáng kiến/],
  ['has IT projects section', /Dự án CNTT/],
  ['has project year filter', /projectFilters\.fromYear/],
  ['has project to-year filter', /projectFilters\.toYear/],
  ['imports antd DatePicker', /import \{ DatePicker \} from ["']antd["']/],
  ['uses dayjs for year picker values', /dayjs\(\)\.year\(projectFilters\.fromYear\)/],
  ['uses antd year picker', /picker=["']year["']/],
  ['has project investor filter', /projectFilters\.investorId/],
  ['has project phase filter', /projectFilters\.phase/],
  ['keeps project yearly chart endpoint', /ProjectDashboards\/projects-by-year/],
  ['keeps project phase chart endpoint', /ProjectDashboards\/projects-by-phase/],
  ['keeps project acceptance chart endpoint', /ProjectDashboards\/project-acceptance-by-year/],
  ['uses fallback demo project yearly data', /fallbackProjectCountByYear/],
  ['uses fallback demo project phase data', /fallbackProjectCountByPhase/],
  ['uses fallback demo project acceptance data', /fallbackProjectAcceptanceByYear/],
  ['resource cards have navigation links', /link:\s*["']\/nguon-luc\/chuyen-gia-ngoai["']/],
  ['published articles card has navigation link', /link:\s*["']\/nguon-luc\/thong-tin-chung["']/],
  ['awards card has navigation link', /link:\s*["']\/nguon-luc\/giai-thuong["']/],
  ['renders metric link with router Link', /<Link to=\{item\.link\}/],
];

const forbiddenChecks = [
  ['does not show resource book column', /label:\s*["']Sách chuyên khảo["']/],
  ['does not render five-column resource layout', /resourceCards\.length === 5/],
  ['does not use numeric bootstrap inputs for project years', /<Form\.Control[\s\S]*type=["']number["'][\s\S]*projectFilters\.(fromYear|toYear)/],
];

const failures = checks
  .filter(([, pattern]) => !pattern.test(source))
  .map(([label]) => label);

for (const [label, pattern] of forbiddenChecks) {
  if (pattern.test(source)) {
    failures.push(label);
  }
}

if (failures.length > 0) {
  console.error(`Dashboard hierarchy verification failed (${failures.length} issues):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Verified dashboard hierarchy and project analytics wiring.');
