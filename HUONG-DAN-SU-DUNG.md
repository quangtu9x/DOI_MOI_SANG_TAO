# Hướng Dẫn Sử Dụng

## 1. Giới thiệu

Đây là tài liệu hướng dẫn nhanh cho hệ thống quản lý đầu tư, ứng dụng CNTT, CĐS, KHCN trên địa bàn thành phố. Tài liệu này tập trung vào cách khởi động dự án trong môi trường phát triển và liệt kê các nhóm chức năng chính đang có trong ứng dụng.

## 2. Cách khởi động dự án

### 2.1. Yêu cầu trước khi chạy

- Cài đặt `Node.js` phiên bản phù hợp với `Vite` và `TypeScript`.
- Cài đặt `pnpm`.
- Mở dự án tại thư mục gốc: `TD.QLNVKHNew.WebClient`.

### 2.2. Cài đặt thư viện

Chạy lệnh sau tại thư mục gốc của dự án:

```bash
pnpm install
```

### 2.3. Chạy môi trường phát triển

```bash
pnpm dev
```

Sau khi khởi động, ứng dụng thường truy cập tại:

```text
http://localhost:3011
```

### 2.4. Kiểm tra bản build

Để kiểm tra dự án có biên dịch được hay không:

```bash
pnpm build
```

### 2.5. Xem bản dựng đã tạo

```bash
pnpm preview
```

### 2.6. Kiểm tra mã nguồn

```bash
pnpm lint
```

## 3. Mục lục chức năng

### 3.1. Khu vực công khai

- Trang chủ cổng thông tin.
- Nộp nhiệm vụ.
- Nộp sáng kiến.
- Nộp dự án CNTT.
- Hồ sơ cá nhân.

### 3.2. Xác thực và tài khoản

- Đăng nhập.
- Đăng ký.
- Quên mật khẩu.
- Đăng xuất.

### 3.3. Bảng điều khiển

- Trang dashboard quản trị.
- Khu vực hiển thị tổng quan theo người dùng đăng nhập.

### 3.4. Quản trị hệ thống

- Quản lý hệ thống quản trị.
- Quản lý danh mục.
- Chia sẻ dữ liệu.
- Thông báo hệ thống.

### 3.5. Nguồn lực

- Quản lý nhóm nguồn lực.

### 3.6. Nhiệm vụ

- Đăng ký nhiệm vụ.
- Xét duyệt chủ nhiệm.
- Thực hiện nhiệm vụ.
- Triển khai thực hiện.
- Quản lý tài chính.
- Nghiệm thu, thanh lý.
- Kết quả HĐKH.

### 3.7. Sáng kiến

- Đăng ký sáng kiến.
- Tiếp nhận, xử lý sáng kiến.
- Kiểm tra trùng lặp.
- Xét công nhận sáng kiến.

### 3.8. Kế hoạch vốn

- Giai đoạn xin vốn.
- Lập kế hoạch vốn.
- Quản lý tiến trình.
- Tra cứu hồ sơ.
- Theo dõi điều hành.

### 3.9. Danh mục hệ thống trong kế hoạch vốn

- Cơ quan, đơn vị.
- Chủ đầu tư.
- Tỉnh, thành phố.
- Phường, xã.
- Nhà thầu.
- Nguồn vốn đầu tư.
- Loại dự án.
- Nhóm dự án.

### 3.10. Lịch sử thao tác

- Lịch sử cập nhật thông tin dự án.
- Lịch sử cập nhật dữ liệu người dùng.
- Lịch sử sử dụng hệ thống.

### 3.11. Eform động

- Quản lý mẫu eform.
- Thiết kế eform.

## 4. Luồng truy cập chính

1. Mở ứng dụng từ trình duyệt.
2. Đăng nhập để vào khu vực nội bộ.
3. Chọn nhóm chức năng ở thanh điều hướng bên trái.
4. Chọn màn hình nghiệp vụ cụ thể trong từng nhóm.
5. Thoát hệ thống bằng chức năng đăng xuất khi kết thúc làm việc.

## 5. Ghi chú vận hành

- Dự án dùng `Vite`, `React`, `TypeScript`, `Redux`, `Redux-Saga` và `React Router`.
- Một số màn hình nghiệp vụ có kiểm tra quyền truy cập theo vai trò người dùng.
- Nếu cần thay đổi cấu hình môi trường, hãy kiểm tra các file `.env` tương ứng trong dự án.
