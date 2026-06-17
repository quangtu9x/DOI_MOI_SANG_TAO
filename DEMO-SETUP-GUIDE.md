# Hướng dẫn Thiết lập Demo - Sáng Kiến

Tài liệu này hướng dẫn cách thiết lập môi trường demo cho hệ thống Quản lý Ý tưởng và Sáng kiến.

## 📋 Yêu cầu trước khi chạy demo

### 1. **Môi trường**
- Node.js v18+ được cài đặt
- pnpm được cài đặt (`npm install -g pnpm`)
- Backend API chạy trên `http://localhost:5001`
- Frontend chạy trên `http://localhost:3011`

### 2. **Khởi động ứng dụng**

```bash
# Cài đặt dependencies
pnpm install

# Khởi động dev server (port 3011)
pnpm dev

# Trong terminal khác, chạy linting để kiểm tra
pnpm lint

# Hoặc build production
pnpm build
```

## 🎯 Demo Workflow - Ý tưởng (Idea)

### Bước 1: Khởi tạo ý tưởng
**URL:** `http://localhost:3011/portal/y-tuong`

**Tính năng:**
1. Chọn cách khởi tạo:
   - Cách 1: Tạo mới từ form trống
   - Cách 2: Tạo từ mẫu có sẵn (Mẫu cải tiến QT nội bộ, Mẫu ứng dụng số hóa, Mẫu tối ưu hóa chi phí)

2. Nhập thông tin ý tưởng:
   - Tên ý tưởng (bắt buộc)
   - Lĩnh vực (bắt buộc)
   - Mô tả hiện trạng/vấn đề (bắt buộc)
   - Nội dung ý tưởng đề xuất (bắt buộc)
   - Mục tiêu và giá trị kỳ vọng (bắt buộc)

3. **Lưu nháp:**
   - Click nút "Lưu nháp" để lưu hồ sơ sang localStorage
   - Thông báo thời gian lưu được hiển thị
   - Dữ liệu có thể được tải lại khi quay trở lại

4. Đính kèm tài liệu & Chọn người tiếp nhận:
   - Upload tối đa 3 tập tin
   - Chọn cán bộ quản lý từ danh sách

5. Xem trước trước khi nộp:
   - Kiểm tra tất cả thông tin
   - Cảnh báo về việc không thể chỉnh sửa sau khi nộp

6. Nộp ý tưởng:
   - Tạo mã hồ sơ tạm `YT-{YYMMDDHHmmss}`
   - Hiển thị thông báo thành công
   - Cho phép tạo ý tưởng mới hoặc quay về trang chủ

### Bước 2: Quản lý ý tưởng (Admin)
**Tính năng cần phát triển:**
- Xem danh sách ý tưởng được nộp
- Tìm kiếm theo từ khoá
- Lọc theo trạng thái (Nháp, Chờ tiếp nhận, Đã tiếp nhận, v.v.)
- Xem chi tiết ý tưởng
- Cập nhật trạng thái
- Gửi phản hồi cho tác giả

## 🎯 Demo Workflow - Sáng kiến (Innovation)

### Bước 1: Đăng ký sáng kiến
**URL:** `http://localhost:3011/admin/sang-kien/dang-ky-sang-kien/don-dang-ky`

**Tính năng:**
1. Danh sách hồ sơ sáng kiến (Trạng thái: Nháp, Chờ nộp)
2. Tìm kiếm hồ sơ
3. Thêm mới sáng kiến:
   - Step 1: Chọn nguồn (Tạo mới hoặc Chọn từ cổng)
   - Step 2: Chọn hồ sơ từ cổng (nếu chọn cách 2)
   - Step 3: Nhập thông tin chi tiết
     - Đơn vị được yêu cầu công nhận
     - Đợt xét sáng kiến
     - Tên sáng kiến
     - Chủ đầu tư
     - Lĩnh vực
     - Ngày áp dụng thử
     - Mô tả, thông tin bảo mật, điều kiện, lợi ích
     - Ngày nộp hồ sơ
     - Người nộp hồ sơ
     - Đính kèm tài liệu
     - Thông tin tác giả/nhóm tác giả (bảng động)
     - Thông tin người tham gia áp dụng thử (bảng động)
     - Phiếu đánh giá
     - Ý kiến cấp cơ sở/cấp thành phố

4. Lưu nháp hoặc Nộp
5. Nộp hồ sơ sang cấp thành phố

### Bước 2: Quản lý hồ sơ sáng kiến  
**URL:** `http://localhost:3011/admin/sang-kien/dang-ky-sang-kien/ho-so-dang-ky`

**Tính năng:**
- Danh sách hồ sơ theo trạng thái (Nháp, Chờ tiếp nhận, Yêu cầu bổ sung, Đã tiếp nhận, Từ chối, Đang thẩm định, Được công nhận, Không công nhận)
- Chuyển đổi giữa các tab trạng thái
- Tìm kiếm hồ sơ
- Nộp hồ sơ đã soạn thảo (bulk action)

## 🔐 Demo Accounts

### Cấu trúc tài khoản
```
Loại tài khoản: username
- Admin: admin.demo (Quản lý hệ thống)
- Chuyên gia: expert.demo (Đánh giá sáng kiến)
- Quản lý: manager.demo (Tiếp nhận hồ sơ)
- Nhân viên: staff.demo (Nộp ý tưởng/sáng kiến)
- Hội đồng: council.demo (Xem danh sách sáng kiến)
```

### Hướng dẫn đăng nhập
1. Truy cập `http://localhost:3011/auth/login`
2. Nhập tài khoản demo (username: `admin.demo`, password: `Demo@123`)
3. Chọn vai trò nếu được hỏi
4. Hệ thống sẽ điều hướng đến trang chủ

## 📊 Dữ liệu mẫu

### Sample Data cần chuẩn bị
```
Ý tưởng:
  - YT-001: Trạng thái Nháp, Người nộp: staff.demo
  - YT-002: Trạng thái Đã nộp, Người nộp: staff.demo

Sáng kiến:
  - SK-001: Trạng thái Nháp
  - SK-002: Trạng thái Đã nộp, có tác giả
  - SK-003: Trạng thái Được công nhận

Đơn vị:
  - Phòng Đổi mới (Đơn vị 1)
  - Phòng Kỹ thuật (Đơn vị 2)
  - Phòng Tổ chức (Đơn vị 3)

Cán bộ:
  - Nguyễn Văn A (Phòng Đổi mới)
  - Trần Thị B (Phòng Kỹ thuật)
  - Lê Văn C (Phòng Tổ chức)
```

### Cách tạo sample data
1. **Via API (Backend):** Gọi các endpoint để tạo dữ liệu
2. **Via UI:** Manual input thông qua giao diện
3. **Via SQL (Nếu có script):** Chạy migration script

## 🧪 Kịch bản kiểm thử (Test Scenarios)

### Scenario 1: Tạo ý tưởng mới và lưu nháp
1. Truy cập `/portal/y-tuong`
2. Chọn "Tạo ý tưởng mới"
3. Nhập tất cả thông tin bắt buộc
4. Click "Lưu nháp"
5. Kiểm tra localStorage (DevTools > Application > LocalStorage)
6. Refresh trang và xác nhận dữ liệu được phục hồi

### Scenario 2: Tạo ý tưởng từ mẫu
1. Truy cập `/portal/y-tuong`
2. Chọn "Tạo từ mẫu có sẵn"
3. Chọn một mẫu từ danh sách
4. Hệ thống nên populate một số trường
5. Xem trước và nộp

### Scenario 3: Đăng ký sáng kiến cấp thành phố
1. Đăng nhập với `staff.demo`
2. Truy cập `/admin/sang-kien/dang-ky-sang-kien/don-dang-ky`
3. Click "Thêm mới"
4. Chọn "Tạo mới"
5. Điền đầy đủ thông tin
6. Thêm tác giả
7. Thêm người tham gia áp dụng
8. Click "Lưu nháp" rồi "Nộp sáng kiến"

### Scenario 4: Xem danh sách hồ sơ sáng kiến theo trạng thái
1. Đăng nhập với `manager.demo`
2. Truy cập `/admin/sang-kien/dang-ky-sang-kien/ho-so-dang-ky`
3. Chuyển đổi giữa các tab (Nháp, Chờ tiếp nhận, Đã tiếp nhận, v.v.)
4. Kiểm tra số lượng hồ sơ ở mỗi trạng thái

## 📱 Giao diện chính

### Portal Pages
- **Trang chủ:** `/portal/home`
- **Nộp ý tưởng:** `/portal/y-tuong`
- **Nộp sáng kiến:** `/portal/sang-kien`
- **Nộp nhiệm vụ:** `/portal/nhiem-vu`
- **Nộp dự án CNTT:** `/portal/du-an`

### Admin Pages
- **Dashboard:** `/`
- **Quản lý sáng kiến:** `/admin/sang-kien/`
  - Đăng ký: `/admin/sang-kien/dang-ky-sang-kien/`
  - Tiếp nhận xử lý: `/admin/sang-kien/tiep-nhan-xu-ly/`
  - Kiểm tra trùng lặp: `/admin/sang-kien/` (thường là/)
  - Xét công nhận: `/admin/sang-kien/xet-cong-nhan/`

## 🐛 Troubleshooting

### Lỗi: "VITE_APP_API_URL is not set"
**Giải pháp:** Kiểm tra file `.env.development` có biến `VITE_APP_API_URL=http://localhost:5001`

### Lỗi: "Không thể kết nối tới backend"
**Giải pháp:** 
- Kiểm tra backend có chạy trên port 5001
- Kiểm tra CORS configuration trên backend
- Xem console (F12) để xem chi tiết lỗi

### Lỗi: "Form validation failed"
**Giải pháp:** Kiểm tra tất cả trường bắt buộc (có dấu *) đã được điền

### localStorage không lưu draft
**Giải pháp:**
- Xóa cache trình duyệt
- Kiểm tra trong DevTools > Application > LocalStorage
- Đảm bảo không chạy ở chế độ Private/Incognito

## 📝 Ghi chú

1. **Demo hiện tại là mock:** Các dữ liệu được lưu vào localStorage và không persist qua phiên làm việc khác
2. **Backend cần sẵn sàng:** Backend API phải chạy và có các endpoint thích hợp
3. **Không có authentication cứng:** Trong demo, các tài khoản có thể đăng nhập tự do
4. **Dữ liệu test:** Sử dụng dữ liệu test để tránh ảnh hưởng dữ liệu thực

## 📞 Liên hệ

Để báo cáo vấn đề hoặc đề xuất cải tiến, vui lòng liên hệ đội phát triển.

---

**Phiên bản:** v1.0  
**Cập nhật lần cuối:** 2024-06-17
