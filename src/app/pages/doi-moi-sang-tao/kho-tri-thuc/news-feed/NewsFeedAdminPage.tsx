/**
 * NewsFeedAdminPage — Quản trị News Feed cá nhân hóa (chỉ Admin)
 *
 * 1. Cấu hình trọng số thuật toán xếp hạng (Relevance Score) — lưu AppConfig
 *    NewsFeed_TrongSo; có thể thay bộ tính điểm bằng AI Recommendation Engine
 *    sau này mà không đổi API.
 * 2. Dashboard hiệu quả: CTR, lượt xem, tương tác, người dùng hoạt động,
 *    diễn biến theo ngày — tính từ nhật ký hành vi (HanhViNguoiDungs).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Slider, Button, DatePicker, Spin, message, Empty } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import ReactApexChart from 'react-apexcharts';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  getNewsFeedTrongSo, saveNewsFeedTrongSo, getNewsFeedHieuQua,
} from '@/app/services/khoTriThucApi';
import type { INewsFeedTrongSo, INewsFeedHieuQua } from '@/app/services/khoTriThucApi';

const { RangePicker } = DatePicker;

const VNA_BLUE = '#003087';

const TRONG_SO_META: { key: keyof INewsFeedTrongSo; label: string; desc: string; icon: string }[] = [
  { key: 'cungDonVi', label: 'Cùng đơn vị', desc: 'Nội dung của đơn vị công tác người dùng', icon: 'fa-building' },
  { key: 'dungLinhVuc', label: 'Đúng lĩnh vực quan tâm', desc: 'Lĩnh vực đã đăng ký hoặc học từ hành vi', icon: 'fa-layer-group' },
  { key: 'daTuongTac', label: 'Đã tương tác tương tự', desc: 'Nội dung/tác giả người dùng từng xem, thích, bình luận', icon: 'fa-hand-pointer' },
  { key: 'vaiTro', label: 'Phù hợp vai trò', desc: 'Vd: nội dung chờ duyệt ưu tiên cho người có quyền duyệt', icon: 'fa-user-shield' },
  { key: 'trending', label: 'Đang nổi bật (Trending)', desc: 'Lượt xem, thích, bình luận cao', icon: 'fa-fire' },
  { key: 'moiDang', label: 'Mới đăng', desc: 'Ưu tiên nội dung mới, suy giảm dần trong 30 ngày', icon: 'fa-clock' },
  { key: 'chienDich', label: 'Chiến dịch đã tham gia', desc: 'Dự phòng — kích hoạt khi có module chiến dịch', icon: 'fa-bullhorn' },
];

const DEFAULT_TRONG_SO: INewsFeedTrongSo = {
  cungDonVi: 25, dungLinhVuc: 25, daTuongTac: 20, vaiTro: 10, trending: 20, moiDang: 25, chienDich: 15,
};

export const NewsFeedAdminPage: React.FC = () => {
  const [trongSo, setTrongSo] = useState<INewsFeedTrongSo>(DEFAULT_TRONG_SO);
  const [loadingTs, setLoadingTs] = useState(true);
  const [saving, setSaving] = useState(false);

  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().add(-30, 'day'), dayjs()]);
  const [hieuQua, setHieuQua] = useState<INewsFeedHieuQua | null>(null);
  const [loadingHq, setLoadingHq] = useState(false);

  useEffect(() => {
    getNewsFeedTrongSo()
      .then(res => {
        const d = (res as any)?.data;
        const ts = d?.data ?? d;
        if (ts && typeof ts.cungDonVi === 'number') setTrongSo(ts);
      })
      .catch(() => { /* dùng mặc định */ })
      .finally(() => setLoadingTs(false));
  }, []);

  const loadHieuQua = useCallback((r = range) => {
    setLoadingHq(true);
    getNewsFeedHieuQua(r[0].format('YYYY-MM-DD'), r[1].format('YYYY-MM-DD'))
      .then(res => {
        const d = (res as any)?.data;
        setHieuQua(d?.data ?? null);
      })
      .catch(() => setHieuQua(null))
      .finally(() => setLoadingHq(false));
  }, [range]);

  useEffect(() => { loadHieuQua(); }, [loadHieuQua]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveNewsFeedTrongSo(trongSo);
      const ok = (res as any)?.status < 400 && (res as any)?.data?.succeeded !== false;
      if (ok) message.success('Đã lưu trọng số — feed "Dành cho bạn" áp dụng ngay lần tải kế tiếp');
      else message.error('Không lưu được trọng số');
    } catch {
      message.error('Lỗi khi lưu trọng số');
    } finally {
      setSaving(false);
    }
  };

  const KPIS = hieuQua ? [
    { label: 'Lượt hiển thị feed', value: hieuQua.soHienThi, icon: 'fa-eye', color: VNA_BLUE },
    { label: 'Lượt nhấp xem (CTR)', value: `${hieuQua.soXem} (${hieuQua.ctr}%)`, icon: 'fa-arrow-pointer', color: '#17C653' },
    { label: 'Lượt thích', value: hieuQua.soThich, icon: 'fa-heart', color: '#F1416C' },
    { label: 'Bình luận', value: hieuQua.soBinhLuan, icon: 'fa-comment', color: '#F59F00' },
    { label: 'Chia sẻ / Lưu / Theo dõi', value: hieuQua.soChiaSe + hieuQua.soLuu + hieuQua.soTheoDoi, icon: 'fa-share-nodes', color: '#7239EA' },
    { label: 'Tham gia / Đề xuất', value: hieuQua.soThamGia + hieuQua.soDeXuat, icon: 'fa-flag', color: '#0BB783' },
    { label: 'Người dùng hoạt động', value: hieuQua.soNguoiDungHoatDong, icon: 'fa-users', color: '#009EF7' },
    { label: 'Tương tác TB/người', value: hieuQua.tuongTacTrungBinhMoiNguoi, icon: 'fa-chart-line', color: '#B5179E' },
  ] : [];

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Bảng tin', path: '/doi-moi-sang-tao/kho-tri-thuc/news-feed', isActive: false, isSeparator: false },
      ]}>Quản trị News Feed</PageTitle>

      <Content>
        <div className="row g-4">
          {/* ── Trọng số thuật toán ── */}
          <div className="col-xl-5">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-5">
                <div className="fw-bold fs-4 text-gray-800 mb-1">
                  <i className="fa-regular fa-sliders text-primary me-2" />Trọng số thuật toán xếp hạng
                </div>
                <div className="text-muted fs-7 mb-4">
                  Điểm phù hợp = tổng các tiêu chí khớp × trọng số. Kéo để điều chỉnh mức ưu tiên (0–50).
                </div>

                <Spin spinning={loadingTs}>
                  {TRONG_SO_META.map(m => (
                    <div key={m.key} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold fs-7 text-gray-700">
                          <i className={`fa-regular ${m.icon} me-2 text-primary`} />{m.label}
                        </span>
                        <span className="fw-bold fs-7" style={{ color: VNA_BLUE }}>{trongSo[m.key]}</span>
                      </div>
                      <div className="text-muted fs-9 mb-1">{m.desc}</div>
                      <Slider
                        min={0}
                        max={50}
                        value={trongSo[m.key]}
                        onChange={v => setTrongSo(prev => ({ ...prev, [m.key]: v as number }))}
                      />
                    </div>
                  ))}

                  <div className="d-flex gap-2 mt-4">
                    <Button type="primary" loading={saving} onClick={handleSave}>
                      <i className="fa-regular fa-floppy-disk me-1" />Lưu trọng số
                    </Button>
                    <Button onClick={() => setTrongSo(DEFAULT_TRONG_SO)}>Khôi phục mặc định</Button>
                  </div>

                  <div className="mt-4 p-3 rounded-3 bg-light fs-8 text-muted">
                    <i className="fa-regular fa-circle-info me-1" />
                    Kiến trúc mở: bộ tính điểm tuyến tính hiện tại có thể thay bằng AI Recommendation
                    Engine / ML (đọc cùng nhật ký hành vi, trả cùng DTO) mà không đổi API hay giao diện.
                  </div>
                </Spin>
              </div>
            </div>
          </div>

          {/* ── Dashboard hiệu quả ── */}
          <div className="col-xl-7">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-5">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                  <div className="fw-bold fs-4 text-gray-800">
                    <i className="fa-regular fa-chart-mixed text-warning me-2" />Hiệu quả News Feed
                  </div>
                  <RangePicker
                    value={range as any}
                    allowClear={false}
                    format="DD/MM/YYYY"
                    onChange={d => {
                      if (d && d[0] && d[1]) { setRange([d[0], d[1]]); }
                    }}
                  />
                </div>

                <Spin spinning={loadingHq}>
                  {!hieuQua ? (
                    <Empty description="Chưa có dữ liệu hành vi trong khoảng thời gian này" />
                  ) : (
                    <>
                      <div className="row g-2 mb-4">
                        {KPIS.map((k, i) => (
                          <div key={i} className="col-6 col-md-3">
                            <div className="card card-flush h-100" style={{ borderLeft: `3px solid ${k.color}` }}>
                              <div className="card-body py-2 px-3">
                                <div className="fs-9 fw-semibold text-gray-600 text-truncate">
                                  <i className={`fa-regular ${k.icon} me-1`} style={{ color: k.color }} />{k.label}
                                </div>
                                <div className="fs-4 fw-bold" style={{ color: k.color }}>{k.value}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {hieuQua.theoNgay.length > 0 && (
                        <ReactApexChart
                          type="area"
                          height={280}
                          series={[
                            { name: 'Hiển thị', data: hieuQua.theoNgay.map(x => x.soHienThi) },
                            { name: 'Nhấp xem', data: hieuQua.theoNgay.map(x => x.soXem) },
                            { name: 'Tương tác', data: hieuQua.theoNgay.map(x => x.soTuongTac) },
                          ]}
                          options={{
                            chart: { toolbar: { show: false }, fontFamily: 'inherit' },
                            colors: [VNA_BLUE, '#17C653', '#F59F00'],
                            stroke: { curve: 'smooth', width: 2 },
                            fill: { type: 'gradient', gradient: { opacityFrom: 0.25, opacityTo: 0.02 } },
                            dataLabels: { enabled: false },
                            xaxis: {
                              categories: hieuQua.theoNgay.map(x => dayjs(x.ngay).format('DD/MM')),
                              labels: { style: { fontSize: '10px' } },
                            },
                            grid: { strokeDashArray: 4 },
                            legend: { position: 'top' },
                          }}
                        />
                      )}

                      <div className="mt-3 p-3 rounded-3 bg-light fs-8 text-muted">
                        <i className="fa-regular fa-circle-info me-1" />
                        CTR = lượt nhấp xem chi tiết / lượt hiển thị feed. Thời gian đọc, tỷ lệ tham gia
                        chiến dịch và mức độ hài lòng sẽ bổ sung khi có module chiến dịch & khảo sát.
                      </div>
                    </>
                  )}
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </>
  );
};
