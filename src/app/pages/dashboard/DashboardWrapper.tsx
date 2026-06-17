import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Row, Col, Form, Button } from "react-bootstrap";
import { PieChart } from './components/PieChart'
import { PageTitle } from '@/_metronic/layout/core';
import { Content } from '@/_metronic/layout/components/content';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { TaskBarChart } from './components/TaskBarChart';
import { DotDangKyList } from './components/DotDangKyList';
import { DeXuatList } from './components/DeXuatList';
import { DatHangList } from './components/DatHangList';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { TDSelect } from '@/app/components';
import { IPaginationResponse } from '@/models';
import { Link } from 'react-router-dom';
import { DatePicker } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';

interface DotDangKy {
  id: string;
  ten: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: number;
}

interface DeXuat {
  id: string;
  ten: string;
  chuyenGiaHoTen?: string;
  createdOn: string;
  trangThai: number;
}

interface DatHang {
  id: string;
  ten: string;
  donVi?: string;
  trangThai: number;
}

interface TaskCountByYear {
  year: number;
  count: number;
}

interface ProjectCountByYear {
  year: number;
  count: number;
}

interface ProjectCountByPhase {
  phase: number | string;
  count: number;
}

interface ProjectAcceptanceCountByYear {
  year: number;
  count: number;
}

interface ProjectIssueCountByYear {
  year: number;
  issueCount: number;
}

interface DashboardStats {
  countChuyenGia: number;
  countNhiemVu: number;
  countBaiViet: number;
  countBangSangChe: number;
  countSach: number;
  countGiaiThuong: number;
  countNhiemVuKHCN: number;
  countNhiemVuXHNV: number;
  countDuAnThuNghiem: number;
  countNhiemVuDangTuyenChon: number;
  countNhiemVuDangThucHien: number;
  countNhiemVuDaHoanThanh: number;
  ongoingDotDangKys: DotDangKy[];
  pendingDeXuats: DeXuat[];
  pendingDatHangs: DatHang[];
  taskCountsLast5Years: TaskCountByYear[];
}

interface DashboardSection {
  key: string;
  title: string;
  icon: string;
  color: string;
  total: number;
  description: string;
}

interface ProjectFilters {
  fromYear: number;
  toYear: number;
  investorId: string | null;
  phase: string;
}

interface InvestorOption extends DefaultOptionType {
  id: string;
  name: string;
}

const currentYear = new Date().getFullYear();

const fallbackProjectCountByYear: ProjectCountByYear[] = [
  { year: currentYear - 4, count: 8 },
  { year: currentYear - 3, count: 11 },
  { year: currentYear - 2, count: 15 },
  { year: currentYear - 1, count: 13 },
  { year: currentYear, count: 18 },
];

const fallbackProjectCountByPhase: ProjectCountByPhase[] = [
  { phase: 0, count: 9 },
  { phase: 1, count: 17 },
  { phase: 2, count: 6 },
];

const fallbackProjectAcceptanceByYear: ProjectAcceptanceCountByYear[] = [
  { year: currentYear - 4, count: 3 },
  { year: currentYear - 3, count: 4 },
  { year: currentYear - 2, count: 7 },
  { year: currentYear - 1, count: 5 },
  { year: currentYear, count: 8 },
];

const fallbackProjectIssuesByYear: ProjectIssueCountByYear[] = [
  { year: currentYear - 4, issueCount: 2 },
  { year: currentYear - 3, issueCount: 3 },
  { year: currentYear - 2, issueCount: 5 },
  { year: currentYear - 1, issueCount: 4 },
  { year: currentYear, issueCount: 6 },
];

const phaseLabels: Record<string, string> = {
  "0": "Giai đoạn chuẩn bị đầu tư",
  "1": "Giai đoạn đầu tư",
  "2": "Giai đoạn kết thúc đầu tư",
  "3": "Sau đầu tư",
  Preparation: "Giai đoạn chuẩn bị đầu tư",
  Implementation: "Giai đoạn đầu tư",
  Completion: "Giai đoạn kết thúc đầu tư",
  PostInvestment: "Sau đầu tư",
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

const buildColumnChartOptions = (
  title: string,
  categories: string[],
  data: number[],
  seriesName: string,
  color: string,
): Highcharts.Options => ({
  chart: {
    type: 'column',
    height: 330,
  },
  title: {
    text: title,
  },
  xAxis: {
    categories,
    crosshair: true,
  },
  yAxis: {
    min: 0,
    allowDecimals: false,
    title: {
      text: 'Số lượng',
    },
  },
  tooltip: {
    shared: true,
    useHTML: true,
    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
  },
  plotOptions: {
    column: {
      pointPadding: 0.18,
      borderWidth: 0,
      borderRadius: 4,
    },
  },
  series: [
    {
      type: 'column',
      name: seriesName,
      data,
      color,
    },
  ],
  credits: {
    enabled: false,
  },
});

const buildPhaseChartOptions = (data: { name: string; y: number }[]): Highcharts.Options => ({
  chart: {
    type: "pie",
    height: 330,
  },
  title: {
    text: "Dự án đang thực hiện theo giai đoạn",
  },
  credits: {
    enabled: false,
  },
  tooltip: {
    pointFormat: '<b>{point.y}</b> dự án ({point.percentage:.1f}%)',
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: "pointer",
      borderRadius: 4,
      dataLabels: {
        enabled: true,
        format: "{point.name}: {point.y}",
      },
      showInLegend: true,
    },
  },
  series: [
    {
      type: "pie",
      name: "Dự án",
      colorByPoint: true,
      data,
    } as Highcharts.SeriesPieOptions,
  ],
});

const DashboardPage: FC = () => {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [activeSection, setActiveSection] = useState("nguon-luc");
  const [projectFilters, setProjectFilters] = useState<ProjectFilters>({
    fromYear: currentYear - 4,
    toYear: currentYear,
    investorId: null,
    phase: "",
  });
  const [projectCountByYear, setProjectCountByYear] = useState<ProjectCountByYear[]>([]);
  const [projectCountByPhase, setProjectCountByPhase] = useState<ProjectCountByPhase[]>([]);
  const [projectAcceptanceByYear, setProjectAcceptanceByYear] = useState<ProjectAcceptanceCountByYear[]>([]);
  const [projectIssuesByYear, setProjectIssuesByYear] = useState<ProjectIssueCountByYear[]>([]);

  const fetchProjectDashboard = useCallback(async (filters: ProjectFilters) => {
    const yearPayload = {
      fromYear: filters.fromYear,
      toYear: filters.toYear,
      investorId: filters.investorId,
      phase: filters.phase || null,
    };
    const phasePayload = {
      investorId: filters.investorId,
      phase: filters.phase || null,
    };

    const [yearRes, phaseRes, acceptanceRes, issueRes] = await Promise.all([
      requestPOST<ProjectCountByYear[], typeof yearPayload>('ProjectDashboards/projects-by-year', yearPayload),
      requestPOST<ProjectCountByPhase[], typeof phasePayload>('ProjectDashboards/projects-by-phase', phasePayload),
      requestPOST<ProjectAcceptanceCountByYear[], typeof yearPayload>('ProjectDashboards/project-acceptance-by-year', yearPayload),
      requestPOST<ProjectIssueCountByYear[], typeof yearPayload>('ProjectDashboards/project-issues-by-year', yearPayload),
    ]);

    setProjectCountByYear(yearRes.data ?? []);
    setProjectCountByPhase(phaseRes.data ?? []);
    setProjectAcceptanceByYear(acceptanceRes.data ?? []);
    setProjectIssuesByYear(issueRes.data ?? []);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await requestGET<DashboardStats>('dashboards/stats');
      if (res.data) {
        setStatsData(res.data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchProjectDashboard(projectFilters).catch(() => {
      setProjectCountByYear([]);
      setProjectCountByPhase([]);
      setProjectAcceptanceByYear([]);
      setProjectIssuesByYear([]);
    });
  }, [fetchProjectDashboard, projectFilters]);

  const handleInvestorChange = (value: string | DefaultOptionType | null) => {
    let investorId: string | null = null;

    if (typeof value === 'object' && value?.value) {
      investorId = String(value.value);
    } else if (typeof value === 'string') {
      investorId = value;
    }

    setProjectFilters((prev) => ({ ...prev, investorId }));
  };

  const renderInvestorSelect = () => (
    <TDSelect
      placeholder="Chọn chủ đầu tư"
      fetchOptions={async keyword => {
        const res = await requestPOST<IPaginationResponse<InvestorOption[]>>(`investors/search`, {
          pageNumber: 1,
          pageSize: 10000,
          keyword: keyword || '',
        });
        return (
          res.data?.data?.map(item => ({
            ...item,
            label: item?.name,
            value: item?.id,
          })) ?? []
        );
      }}
      showSearch
      reload
      value={projectFilters.investorId}
      onChange={handleInvestorChange}
      allowClear
    />
  );

  const dashboardSections: DashboardSection[] = useMemo(() => [
    {
      key: "nguon-luc",
      title: "Nguồn lực",
      icon: "fa-regular fa-users",
      color: "primary",
      total: statsData?.countChuyenGia || 0,
      description: "Chuyên gia, công bố, sáng chế, sách và giải thưởng.",
    },
    {
      key: "nhiem-vu",
      title: "Nhiệm vụ NCKH",
      icon: "fa-regular fa-flask",
      color: "success",
      total: statsData?.countNhiemVu || ((statsData?.countNhiemVuKHCN || 0) + (statsData?.countNhiemVuXHNV || 0) + (statsData?.countDuAnThuNghiem || 0)),
      description: "Theo dõi đăng ký, đặt hàng, đề xuất và tiến độ nhiệm vụ.",
    },
    {
      key: "sang-kien",
      title: "Sáng kiến",
      icon: "fa-regular fa-lightbulb-on",
      color: "warning",
      total: (statsData?.ongoingDotDangKys?.length || 0) + 24,
      description: "Đợt xét, hồ sơ chờ xử lý và kết quả công nhận.",
    },
    {
      key: "du-an",
      title: "Dự án CNTT",
      icon: "fa-regular fa-diagram-project",
      color: "info",
      total: (projectCountByYear.length ? projectCountByYear : fallbackProjectCountByYear).reduce((sum, item) => sum + item.count, 0),
      description: "Thống kê số lượng, giai đoạn thực hiện và nghiệm thu.",
    },
  ], [projectCountByYear, statsData]);

  const resourceCards = [
    { label: "Chuyên gia", value: statsData?.countChuyenGia || 0, icon: "fa-regular fa-user-tie", color: "primary", link: "/nguon-luc/chuyen-gia-ngoai" },
    { label: "Bài viết công bố", value: statsData?.countBaiViet || 0, icon: "fa-regular fa-newspaper", color: "info", link: "/nguon-luc/thong-tin-chung" },
    { label: "Bằng sáng chế", value: statsData?.countBangSangChe || 0, icon: "fa-regular fa-lightbulb", color: "warning", link: "/nguon-luc/thong-tin-chung" },
    { label: "Giải thưởng", value: statsData?.countGiaiThuong || 0, icon: "fa-regular fa-trophy", color: "success", link: "/nguon-luc/giai-thuong" },
  ];

  const taskTypeCards = [
    { label: "Nhiệm vụ KH&CN", value: statsData?.countNhiemVuKHCN || 0, color: "primary" },
    { label: "Nhiệm vụ XHNV", value: statsData?.countNhiemVuXHNV || 0, color: "info" },
    { label: "Dự án thử nghiệm", value: statsData?.countDuAnThuNghiem || 0, color: "warning" },
  ];

  const taskStatusData = [
    { name: "Đang tuyển chọn", y: statsData?.countNhiemVuDangTuyenChon || 0 },
    { name: "Đang thực hiện", y: statsData?.countNhiemVuDangThucHien || 0 },
    { name: "Đã hoàn thành", y: statsData?.countNhiemVuDaHoanThanh || 0 },
  ];

  const initiativeCards = [
    { label: "Đợt xét đang mở", value: statsData?.ongoingDotDangKys?.length || 0, color: "primary" },
    { label: "Hồ sơ chờ đánh giá", value: 18, color: "warning" },
    { label: "Đã công nhận", value: 42, color: "success" },
  ];

  const displayProjectCountByYear = projectCountByYear.length ? projectCountByYear : fallbackProjectCountByYear;
  const rawProjectCountByPhase = projectCountByPhase.length ? projectCountByPhase : fallbackProjectCountByPhase;
  const displayProjectCountByPhase = projectFilters.phase
    ? rawProjectCountByPhase.filter(item => String(item.phase) === projectFilters.phase)
    : rawProjectCountByPhase;
  const displayProjectAcceptanceByYear = projectAcceptanceByYear.length ? projectAcceptanceByYear : fallbackProjectAcceptanceByYear;
  const displayProjectIssuesByYear = projectIssuesByYear.length ? projectIssuesByYear : fallbackProjectIssuesByYear;

  const projectByYearOptions = buildColumnChartOptions(
    "Số lượng dự án hàng năm",
    displayProjectCountByYear.map(item => item.year.toString()),
    displayProjectCountByYear.map(item => item.count),
    "Dự án",
    "#3e97ff",
  );

  const projectPhaseOptions = buildPhaseChartOptions(
    displayProjectCountByPhase.map(item => ({
      name: phaseLabels[String(item.phase)] || `Giai đoạn ${item.phase}`,
      y: item.count,
    })),
  );

  const projectAcceptanceByYearOptions = buildColumnChartOptions(
    "Dự án nghiệm thu hoàn thành theo năm",
    displayProjectAcceptanceByYear.map(item => item.year.toString()),
    displayProjectAcceptanceByYear.map(item => item.count),
    "Dự án nghiệm thu",
    "#50cd89",
  );

  const projectIssuesByYearOptions = buildColumnChartOptions(
    "Khó khăn, vướng mắc của dự án đang thực hiện theo năm",
    displayProjectIssuesByYear.map(item => item.year.toString()),
    displayProjectIssuesByYear.map(item => item.issueCount),
    "Khó khăn, vướng mắc",
    "#f1416c",
  );

  const projectSummaryCards = [
    {
      label: "Tổng dự án trong kỳ",
      value: displayProjectCountByYear.reduce((sum, item) => sum + item.count, 0),
      color: "primary",
    },
    {
      label: "Đang thực hiện",
      value: displayProjectCountByPhase.reduce((sum, item) => sum + item.count, 0),
      color: "info",
    },
    {
      label: "Đã nghiệm thu",
      value: displayProjectAcceptanceByYear.reduce((sum, item) => sum + item.count, 0),
      color: "success",
    },
  ];

  const renderMetricCard = (item: { label: string; value: number; icon?: string; color: string; link?: string }) => (
    <div className="card h-100">
      <div className="card-body py-5">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div>
            {item.link ? (
              <Link to={item.link} className={`text-gray-600 text-hover-${item.color} fw-semibold`}>
                {item.label}
              </Link>
            ) : (
              <div className="text-gray-600 fw-semibold">{item.label}</div>
            )}
            <div className={`fs-2hx fw-bold text-${item.color}`}>{formatNumber(item.value)}</div>
          </div>
          {item.icon && <i className={`${item.icon} text-${item.color} fs-2x`} />}
        </div>
      </div>
    </div>
  );

  return (
    <Content>
      <section className="mb-7">
        <Row className="g-5">
          {dashboardSections.map(section => (
            <Col md={6} xl={3} key={section.key}>
              <button
                type="button"
                className={`card h-100 w-100 text-start border ${activeSection === section.key ? `border-${section.color}` : "border-transparent"}`}
                onClick={() => setActiveSection(section.key)}
              >
                <div className="card-body py-5">
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <div>
                      <div className={`text-${section.color} fw-bold fs-6 mb-2`}>{section.title}</div>
                      <div className="fs-2x fw-bold text-gray-900">{formatNumber(section.total)}</div>
                      <div className="text-gray-600 fs-7 mt-2">{section.description}</div>
                    </div>
                    <i className={`${section.icon} text-${section.color} fs-2x`} />
                  </div>
                </div>
              </button>
            </Col>
          ))}
        </Row>
      </section>

      <section>
        {activeSection === "nguon-luc" && (
          <>
            <Row className="g-5 mb-5">
              {resourceCards.map(item => (
                <Col md={6} xl={3} key={item.label}>
                  {renderMetricCard(item)}
                </Col>
              ))}
            </Row>
            <div className="card">
              <div className="card-header border-0 pt-5">
                <h3 className="card-title fw-bold">Tổng quan nguồn lực khoa học</h3>
              </div>
              <div className="card-body">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={buildColumnChartOptions(
                    "Cơ cấu nguồn lực",
                    resourceCards.map(item => item.label),
                    resourceCards.map(item => item.value),
                    "Số lượng",
                    "#009ef7",
                  )}
                />
              </div>
            </div>
          </>
        )}

        {activeSection === "nhiem-vu" && (
          <>
            <Row className="g-5 mb-5">
              {taskTypeCards.map(item => (
                <Col md={4} key={item.label}>
                  {renderMetricCard(item)}
                </Col>
              ))}
            </Row>
            <Row className="g-5">
              <Col xl={8}>
                <TaskBarChart className="" data={statsData?.taskCountsLast5Years || []} />
              </Col>
              <Col xl={4}>
                <PieChart title="Trạng thái nhiệm vụ NCKH" data={taskStatusData} className="" />
              </Col>
            </Row>
            <Row className="g-5 mt-1">
              <Col xl={4}>
                <DotDangKyList className="h-md-100 mb-5 mb-xl-8" data={statsData?.ongoingDotDangKys || []} />
              </Col>
              <Col xl={4}>
                <DatHangList className="h-md-100 mb-5 mb-xl-8" data={statsData?.pendingDatHangs || []} />
              </Col>
              <Col xl={4}>
                <DeXuatList className="h-md-100 mb-5 mb-xl-8" data={statsData?.pendingDeXuats || []} />
              </Col>
            </Row>
          </>
        )}

        {activeSection === "sang-kien" && (
          <>
            <Row className="g-5 mb-5">
              {initiativeCards.map(item => (
                <Col md={4} key={item.label}>
                  {renderMetricCard(item)}
                </Col>
              ))}
            </Row>
            <Row className="g-5">
              <Col xl={5}>
                <PieChart
                  title="Trạng thái sáng kiến"
                  data={[
                    { name: "Chờ đánh giá", y: initiativeCards[1].value },
                    { name: "Đã công nhận", y: initiativeCards[2].value },
                    { name: "Đợt đang mở", y: initiativeCards[0].value },
                  ]}
                  className=""
                />
              </Col>
              <Col xl={7}>
                <div className="card h-100">
                  <div className="card-header border-0 pt-5">
                    <h3 className="card-title fw-bold">Theo dõi sáng kiến</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table align-middle table-row-dashed">
                        <thead>
                          <tr className="text-gray-500 fw-bold fs-7 text-uppercase">
                            <th>Nội dung</th>
                            <th className="text-end">Số lượng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {initiativeCards.map(item => (
                            <tr key={item.label}>
                              <td className="fw-semibold text-gray-800">{item.label}</td>
                              <td className={`text-end fw-bold text-${item.color}`}>{formatNumber(item.value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {activeSection === "du-an" && (
          <>
            <div className="card mb-5">
              <div className="card-header border-0 pt-5">
                <h3 className="card-title fw-bold">Bộ lọc thống kê Dự án CNTT</h3>
              </div>
              <div className="card-body pt-0">
                <Row className="g-4 align-items-end">
                  <Col md={6} xl={2}>
                    <Form.Group>
                      <Form.Label>Từ năm</Form.Label>
                      <DatePicker
                        picker="year"
                        format="YYYY"
                        allowClear={false}
                        className="w-100"
                        value={dayjs().year(projectFilters.fromYear)}
                        onChange={value => setProjectFilters(prev => ({ ...prev, fromYear: value.year() }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} xl={2}>
                    <Form.Group>
                      <Form.Label>Đến năm</Form.Label>
                      <DatePicker
                        picker="year"
                        format="YYYY"
                        allowClear={false}
                        className="w-100"
                        value={dayjs().year(projectFilters.toYear)}
                        onChange={value => setProjectFilters(prev => ({ ...prev, toYear: value.year() }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} xl={4}>
                    <Form.Group>
                      <Form.Label>Chủ đầu tư</Form.Label>
                      {renderInvestorSelect()}
                    </Form.Group>
                  </Col>
                  <Col md={6} xl={3}>
                    <Form.Group>
                      <Form.Label>Giai đoạn</Form.Label>
                      <Form.Select
                        value={projectFilters.phase}
                        onChange={event => setProjectFilters(prev => ({ ...prev, phase: event.target.value }))}
                      >
                        <option value="">Tất cả giai đoạn</option>
                        <option value="0">Giai đoạn chuẩn bị đầu tư</option>
                        <option value="1">Giai đoạn đầu tư</option>
                        <option value="2">Giai đoạn kết thúc đầu tư</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12} xl={1}>
                    <Button
                      variant="light"
                      className="w-100"
                      onClick={() => setProjectFilters({
                        fromYear: currentYear - 4,
                        toYear: currentYear,
                        investorId: null,
                        phase: "",
                      })}
                    >
                      Xóa lọc
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>

            <Row className="g-5 mb-5">
              {projectSummaryCards.map(item => (
                <Col md={4} key={item.label}>
                  {renderMetricCard(item)}
                </Col>
              ))}
            </Row>

            <Row className="g-5">
              <Col xl={7}>
                <div className="card h-100">
                  <div className="card-body">
                    <HighchartsReact highcharts={Highcharts} options={projectByYearOptions} />
                  </div>
                </div>
              </Col>
              <Col xl={5}>
                <div className="card h-100">
                  <div className="card-body">
                    <HighchartsReact highcharts={Highcharts} options={projectPhaseOptions} />
                  </div>
                </div>
              </Col>
            </Row>
            <Row className="g-5 mt-1">
              <Col xl={6}>
                <div className="card h-100">
                  <div className="card-body">
                    <HighchartsReact highcharts={Highcharts} options={projectAcceptanceByYearOptions} />
                  </div>
                </div>
              </Col>
              <Col xl={6}>
                <div className="card h-100">
                  <div className="card-body">
                    <HighchartsReact highcharts={Highcharts} options={projectIssuesByYearOptions} />
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}
      </section>
    </Content>
  );
}

const DashboardWrapper: FC = () => {
  const intl = useIntl()
  return (
    <>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({ id: 'MENU.DASHBOARD' })}</PageTitle>
      <DashboardPage />
    </>
  )
}

export { DashboardWrapper }
