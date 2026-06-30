# Tiến Độ Thực Hiện — Demo Đổi Mới Sáng Tạo

> Cập nhật lần cuối: 2026-06-29

---

## ĐÃ HOÀN THÀNH

### Bước 1 — Chốt phạm vi demo (100%)

- Xác định luồng ưu tiên: Ý tưởng → Giải pháp/Sáng kiến → Knowledge Hub
- Chốt danh sách 14 trường form ý tưởng
- Xác định 4 tài khoản demo: `nhanvien.demo`, `quanly.demo`, `hoidong.demo`, `admin.demo`
- Phân loại rõ: hạng mục demo xử lý thật vs chỉ demo giao diện

---

### Bước 2 — Luồng ý tưởng (100%)

**FE — `src/app/pages/doi-moi-sang-tao/quan-ly-y-tuong/`**

| File | Nội dung |
|------|----------|
| `QuanLyYTuongDMSTPage.tsx` | Danh sách ý tưởng, tìm kiếm, lọc theo trạng thái, phân trang |
| `TaoYTuongPage.tsx` | Form khởi tạo + chỉnh sửa, lưu nháp, đính kèm tài liệu, chọn cán bộ tiếp nhận, xem trước |
| `ChiTietYTuongPage.tsx` | Chi tiết ý tưởng, workflow nộp → khóa chỉnh sửa, thông báo xác nhận, hồ sơ công nhận |

**BE — `src/Core/Application/` + `src/Host/Controllers/`**
- CRUD ý tưởng, workflow trạng thái (Nháp → Đã nộp → Tiếp nhận → Trả về → Đóng)
- Upload đính kèm qua MinIO/S3

---

### Bước 6 — Knowledge Hub (100% FE foundation)

#### Models & Services (mới trong session này)

| File | Nội dung |
|------|----------|
| `src/app/models/knowledge-hub.ts` | TypeScript interfaces đầy đủ: ITaiLieu, IChuyenGia, ICongDong, IBaiViet, IBinhLuan, IYeuCauTuVan, INhanXetChuyenGia, ITag, INewsFeedItem + enums (TrangThaiTaiLieu, LoaiTaiLieu, LoaiBaiViet, LoaiDoiTuong, TrangThaiTuVan) |
| `src/app/services/khoTriThucApi.ts` | 50 API endpoints khớp 1-1 Postman Collection: TaiLieus, TimKiems, ChuyenGias, CongDongs, BaiViets, BinhLuans, LuotThichs, NewsFeed, TaiLieuPhienBans, YeuCauTuVans, NhanXetChuyenGias, Tags |

#### Pages (mới trong session này)

| File | Tính năng chính |
|------|----------------|
| `kho-tri-thuc/KhoTriThucPage.tsx` | Shell/layout với tab nav + landing page 4 module |
| `kho-tri-thuc/thu-vien/ThuVienTaiLieuPage.tsx` | Danh sách + lọc, bảng xếp hạng, chi tiết + phiên bản, approval workflow (Nộp / Phê duyệt / Từ chối), tải xuống, CRUD |
| `kho-tri-thuc/chuyen-gia/DanhBaChuyenGiaPage.tsx` | Hồ sơ chuyên gia, tài liệu, gửi yêu cầu tư vấn (4 trạng thái), nhận xét đánh giá sao |
| `kho-tri-thuc/cong-dong/CongDongPage.tsx` | Danh sách cộng đồng, tham gia/rời, bài viết (ThaoCuan/HoiDap/ChiaSe), bình luận, lượt thích toggle |
| `kho-tri-thuc/news-feed/NewsFeedPage.tsx` | News feed cá nhân hóa, infinite scroll, like/unlike, refresh |

#### Routing

- `DoiMoiSangTaoRoutes.tsx` — thêm nested routes cho 4 sub-pages Knowledge Hub:
  - `/doi-moi-sang-tao/kho-tri-thuc/thu-vien`
  - `/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia`
  - `/doi-moi-sang-tao/kho-tri-thuc/cong-dong`
  - `/doi-moi-sang-tao/kho-tri-thuc/news-feed`

---

## CHƯA LÀM / TIẾP THEO CẦN LÀM

> Ưu tiên theo thứ tự trong `KE-HOACH-DEMO-SANG-KIEN.md`

---

### Bước 3 — Luồng giải pháp và sáng kiến (0%)

**Giải pháp (`/sang-kien/giai-phap/`):**
- [ ] Danh sách giải pháp — tìm kiếm, lọc
- [ ] Chi tiết giải pháp
- [ ] Form tạo + gửi đăng ký áp dụng giải pháp
- [ ] Chỉnh sửa giải pháp
- [ ] Xem hồ sơ công nhận
- [ ] Tải hồ sơ nhận thưởng

**Sáng kiến (`/sang-kien/dang-ky-sang-kien/`):**
- [ ] Danh sách sáng kiến — tìm kiếm, lọc
- [ ] Chi tiết sáng kiến
- [ ] Form tạo + gửi yêu cầu công nhận (**tích hợp AI kiểm tra trùng lặp**)
- [ ] Chỉnh sửa sáng kiến
- [ ] Xem hồ sơ nhận thưởng
- [ ] Tải hồ sơ nhận thưởng
- [ ] Gửi báo cáo xét duyệt thù lao

> Lưu ý: màn hình kiểm tra trùng lặp AI (`/sang-kien/kiem-tra-trung-lap/`) đã có thư mục trong FE, cần nối với BE AI endpoint.

---

### Bước 4 — Quy trình xử lý nhiều cấp và ký số (0%)

**Quy trình xử lý (`quy-trinh-duyet/`):**
- [ ] Tùy biến quy trình nhiều cấp (cấu hình bước, điều kiện rẽ nhánh)
- [ ] Phân loại và áp quy trình theo loại hồ sơ
- [ ] Phân công người xử lý tại từng bước
- [ ] Ghi nhận kết quả xử lý (Đồng ý / Trả về / Từ chối)

**Ký số:**
- [ ] Màn hình danh sách tài liệu chờ ký
- [ ] Ký số trực tiếp trên tài liệu điện tử (tích hợp USB token / VNPT CA)
- [ ] Ký nhiều cấp trong quy trình
- [ ] Kiểm tra toàn vẹn tài liệu sau ký (lock sửa đổi)

---

### Bước 5 — SLA và cảnh báo (0%)

- [ ] Cấu hình thời gian xử lý SLA theo từng bước
- [ ] Ghi nhận thời gian xử lý thực tế
- [ ] Hiển thị trạng thái SLA (đúng hạn / sắp quá hạn / quá hạn)
- [ ] Cảnh báo sắp quá hạn (thông báo in-app + email)
- [ ] Tự động leo thang khi quá hạn
- [ ] Gia hạn thời gian xử lý

---

### Bước 6 — AI Engine và Knowledge Hub (còn lại)

**Knowledge Hub — phần chưa làm:**
- [ ] Tìm kiếm toàn văn nâng cao (`/kho-tri-thuc/tim-kiem`) — gọi `TimKiems` API, autocomplete
- [ ] Quản trị nội dung tri thức (Admin) — phê duyệt hàng loạt, quản lý Tags
- [ ] Upload file tài liệu thực (tích hợp với MinIO/S3, hiện chỉ lưu URL)

**AI Engine (hiện chỉ là giao diện, chưa có logic thật):**
- [ ] II.1 Phát hiện trùng lặp — gọi AI endpoint, hiển thị kết quả tương đồng %
- [ ] II.2 Gợi ý sáng kiến liên quan — sidebar/widget trên trang chi tiết
- [ ] II.3 Tạo Business Case tự động — wizard + gọi AI generate
- [ ] II.4 Gợi ý cải thiện nội dung — inline suggestion trên form
- [ ] II.5 Tìm kiếm tri thức thông minh — semantic search
- [ ] II.6 Chatbot hỗ trợ — widget nổi, kết nối AI endpoint

---

### Bước 7 — Innovation Project Hub / Sandbox (0%)

- [ ] Import dữ liệu chương trình/dự án từ file Excel
- [ ] Danh sách + chi tiết + khởi tạo + cập nhật chương trình/dự án
- [ ] Quản lý vòng đời sáng kiến → dự án thử nghiệm
- [ ] Quản lý mốc triển khai (milestone) và tiến độ
- [ ] Quản lý rủi ro và vấn đề
- [ ] Phân bổ nguồn lực và ngân sách
- [ ] Tìm kiếm, lọc, cảnh báo tiến độ
- [ ] Đánh giá sau triển khai

---

### Bước 7 — Dashboard và báo cáo (0%)

- [ ] Dashboard theo vai trò (nhân viên / quản lý / hội đồng / admin)
- [ ] Tùy biến Dashboard: chỉ số, biểu đồ, phạm vi thời gian
- [ ] Báo cáo tiến độ CĐS, R&D, Sandbox
- [ ] Báo cáo chi thưởng
- [ ] Báo cáo chi tiết hiệu quả triển khai
- [ ] Báo cáo chi phí/nguồn lực
- [ ] Xuất báo cáo sang Excel / PDF / CSV

---

## MÀN HÌNH NÊN LÀM NGAY CHO DEMO (ưu tiên cao nhất)

Nếu cần demo trong thời gian ngắn, tập trung theo thứ tự:

1. **Giải pháp: danh sách + chi tiết + tạo đăng ký** (Bước 3 — ~1 ngày)
2. **Sáng kiến: danh sách + chi tiết + tạo công nhận + AI trùng lặp** (Bước 3 — ~1.5 ngày)
3. **Kho tri thức: tìm kiếm nâng cao + upload file thật** (Bước 6 còn lại — ~0.5 ngày)
4. **Quy trình duyệt nhiều cấp** (Bước 4 — ~2 ngày)

---

## CHÚ THÍCH KỸ THUẬT

### Cấu trúc thư mục FE quan trọng

```
src/app/
  models/
    knowledge-hub.ts          ← types cho toàn bộ Knowledge Hub
  services/
    khoTriThucApi.ts           ← 50 API endpoints
    ideaPortalApi.ts           ← API ý tưởng (đã có sẵn)
  pages/doi-moi-sang-tao/
    quan-ly-y-tuong/           ← Luồng ý tưởng (done)
    kho-tri-thuc/
      KhoTriThucPage.tsx       ← Shell + landing
      thu-vien/                ← Thư viện tài liệu (done)
      chuyen-gia/              ← Danh bạ chuyên gia (done)
      cong-dong/               ← Cộng đồng (done)
      news-feed/               ← News feed (done)
  routing/doi-moi-sang-tao/
    DoiMoiSangTaoRoutes.tsx    ← Cập nhật nested routes KTT
```

### API Base URL pattern

```
GET/POST  /api/v1/<Resource>/search
GET       /api/v1/<Resource>/{id}
POST      /api/v1/<Resource>
PUT       /api/v1/<Resource>/{id}
DELETE    /api/v1/<Resource>/{id}
POST      /api/v1/<Resource>/{id}/<action>   ← workflow actions
```

### Environment file cần bổ sung

File `knowledge-hub.postman_environment.json` cần có:
- `baseUrl`: `http://localhost:5000`
- `userEmail` / `userPassword`
- `tenantId`: `tandan`
