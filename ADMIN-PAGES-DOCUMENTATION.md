# Admin Pages & Features Documentation

## Overview
This document describes all the admin pages and features created for the QLNVKHNew demo system.

## 1. Idea Management Page (`/admin/y-tuong/`)

### Location
- **File:** `src/app/pages/y-tuong/quan-ly-y-tuong/QuanLyYTuongPage.tsx`
- **Route:** `/admin/y-tuong/*`
- **Routing File:** `src/app/routing/PrivateRoutes.tsx`

### Features

#### 1.1 Search & Filter
- **Search by:** Idea code or name
- **Filter by:** Status (Trạng thái)
- **Real-time:** Updates table as you type

#### 1.2 Data Table
Displays all submitted ideas with columns:
- **Mã hồ sơ** (Idea Code): Format `YT-YYMMDDHHMMSS`
- **Tên ý tưởng** (Idea Name): Main title
- **Lĩnh vực** (Field): Category/domain
- **Cán bộ tiếp nhận** (Receiving Officer): Name of assigned staff
- **Ngày nộp** (Submission Date): When idea was submitted
- **Trạng thái** (Status): Color-coded status badge
- **Thao tác** (Actions): View button

#### 1.3 Status Codes
```
Enum: TrangThaiYTuong
1  - Đang soạn thảo (Draft)
2  - Chờ duyệt lần 1 (Awaiting 1st Review)
3  - Trả lại soạn thảo (Return to Draft)
4  - Đã duyệt lần 1 (Approved 1st Review)
5  - Chờ duyệt lần 2 (Awaiting 2nd Review)
6  - Trả lại lần 2 (Return - 2nd Review)
7  - Đã duyệt lần 2 (Approved 2nd Review)
8  - Được công nhận (Recognized/Approved)
9  - Không được công nhận (Not Recognized)
```

#### 1.4 Detail Modal
Click "Xem" to open detail modal showing:
- Idea code and basic info
- All fields: name, field, description, proposed solution, goals
- Receiving officer assignment
- Submission date
- File attachment count
- **Status Dropdown:** Change status and save (currently mock, needs backend integration)

### UI Components Used
- **Ant Design Table:** Display list of ideas
- **Ant Design Input:** Search functionality
- **Ant Design Select:** Status filter
- **Ant Design Modal:** Detail view
- **Ant Design Descriptions:** Detail layout
- **Ant Design Tag:** Status badges
- **Ant Design Badge:** File count display
- **Metronic Content:** Container styling

### Mock Data
Sample ideas are defined in the component:
```javascript
MOCK_Y_TUONG_DATA: IYTuong[] = [
  // 4 sample ideas with various statuses
]
```

### Next Steps (Backend Integration)
1. Replace mock data with API calls to fetch ideas
2. Implement status update API
3. Add file download functionality
4. Add feedback/comments section
5. Implement bulk actions (export, reassign, etc.)

---

## 2. Portal Idea Submission Page (`/portal/y-tuong`)

### Location
- **File:** `src/app/pages/portal/NopYTuongPage.tsx`
- **Route:** `/portal/y-tuong`
- **Routing File:** `src/app/routing/PortalRoutes.tsx`

### Features

#### 2.1 5-Step Workflow

**Step 1: Choose Creation Method**
- Option A: Create new idea from scratch
- Option B: Create from template (pre-filled forms)
  - Mẫu cải tiến QT nội bộ
  - Mẫu ứng dụng số hóa
  - Mẫu tối ưu hóa chi phí

**Step 2: Enter Idea Information**
Required fields:
- Tên ý tưởng (Idea Name)
- Lĩnh vực (Field/Category)
- Mô tả hiện trạng/vấn đề (Problem Description)
- Nội dung ý tưởng đề xuất (Proposed Solution)
- Mục tiêu và giá trị kỳ vọng (Goals & Expected Value)

Features:
- All fields validated (required)
- **Lưu nháp** (Save Draft) button with cyan styling
- Saves to localStorage with timestamp
- Shows "Bản nháp được lưu lúc: [time]" message
- Form recovers data on page reload
- Character count for text areas

**Step 3: Attach Documents & Select Officer**
- File upload (max 3 files)
- Supported formats: PDF, Word, Excel
- Shows: File name, size, upload status
- Officer selection from dropdown:
  - Nguyễn Văn A (Phòng Đổi mới)
  - Trần Thị B (Phòng Kỹ thuật)
  - Lê Văn C (Phòng Tổ chức)
- Summary box showing:
  - Idea name
  - Field
  - Number of attachments
  - Selected officer

**Step 4: Preview Before Submission**
- Displays all info in read-only Descriptions component
- Shows all fields with values
- Yellow warning banner: "After submission, you cannot edit. Please verify carefully"
- Red submit button with airplane icon

**Step 5: Success Confirmation**
- Displays ticket code: `YT-{YYMMDDHHmmss}` format
- Green success message
- Options:
  - Create another idea
  - Return to home

#### 2.2 State Management
```javascript
// Component state
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({
  creationMethod, templateId, tenYTuong, linhVuc,
  moTaVanDe, noiDungDeXuat, mucTieu, canBoQuanLy
});
const [fileList, setFileList] = useState([]);
const [previewData, setPreviewData] = useState(null);
const [draftData, setDraftData] = useState(null);
```

#### 2.3 Draft Persistence
- Uses browser localStorage with key: `ytuong_draft_[userId]`
- Format: JSON with timestamp and all form fields
- Automatically loads on component mount
- Cleared after successful submission

#### 2.4 Validation Rules
- All text fields required (trimmed, min 1 char)
- File upload: max 3 files, specific mime types
- Officer selection required
- Must accept terms before submission

### UI Components Used
- **Ant Design Steps:** 5-step progress indicator
- **Ant Design Form:** Form validation and layout
- **Ant Design Input:** Text fields
- **Ant Design TextArea:** Multi-line text fields
- **Ant Design Select:** Dropdown selections
- **Ant Design Upload:** File attachment
- **Ant Design Descriptions:** Preview display
- **Ant Design Alert:** Status messages and warnings
- **Ant Design Button:** Actions
- **Ant Design Result:** Success confirmation

### Key Functions
```javascript
saveDraft()  // Validates and saves to localStorage
handlePreview() // Validates and moves to preview step
onFinish() // Clears localStorage and generates ticket
```

### Next Steps (Backend Integration)
1. Replace localStorage with API persistence
2. Connect to real backend endpoints
3. Integrate with actual user authentication
4. Add real officer list from API
5. Implement file upload to storage (MinIO/S3)
6. Add email notifications
7. Add workflow status updates

---

## 3. Innovation Management Pages

### 3.1 Innovation Registration (`/admin/sang-kien/dang-ky-sang-kien/`)
- **File:** `src/app/pages/sang-kien/dang-ky-sang-kien/DangKySangKienDetailModal.tsx`
- **Features:** 3-step modal for registering innovations
  - Choose source (new or from portal)
  - Select from portal ideas if applicable
  - Fill detailed form with organization, authors, participants
- **Status:** Already implemented and working

### 3.2 Innovation Management Tabs (`/admin/sang-kien/`)
- **Features:** View innovations by status
  - Draft (Nháp)
  - Awaiting submission (Chờ nộp)
  - Received (Đã tiếp nhận)
  - etc.
- **Status:** Already implemented

---

## 4. Admin Sidebar Menu Integration

### Menu Structure
The admin y-tuong page is integrated into the sidebar as:
```
Sang Kiến (Innovation) Menu
├─ Đăng ký sáng kiến (Register Innovation)
├─ Tiếp nhận xử lý (Receive & Process)
├─ Kiểm tra trùng lặp (Duplicate Check)
└─ Xét công nhận (Approval Review)
```

### Future: Dedicated Y-Tưởng Menu
Could create a separate menu like `SidebarYTuongMenu` for:
```
Y Tưởng (Ideas) Menu
├─ Quản lý ý tưởng (Manage Ideas) - /admin/y-tuong/
├─ Duyệt ý tưởng (Review Ideas)
├─ Thống kê (Statistics)
└─ Báo cáo (Reports)
```

---

## 5. Data Models & Types

### YTuong Interface
```typescript
interface IYTuong {
  id: string;
  ma: string; // Idea code (YT-...)
  tenYTuong: string;
  linhVuc: string;
  moTaVanDe: string;
  noiDungDeXuat: string;
  mucTieu: string;
  canBoQuanLy: string; // Officer ID
  canBoQuanLyTen?: string; // Officer Name
  ngayNop?: string; // Submission date
  trangThai: TrangThaiYTuong; // Status
  tguiYeuCau?: string;
  fileCount?: number; // Number of attachments
}
```

### Status Enum
```typescript
enum TrangThaiYTuong {
  DangSoanThao = 1,
  ChoDuyetLan1 = 2,
  // ... 7 more statuses
  KhongDuocCongNhan = 9,
}
```

---

## 6. Integration Points

### Required API Endpoints (NOT YET IMPLEMENTED)
```
GET   /api/y-tuong           - Get all ideas
GET   /api/y-tuong/{id}      - Get idea detail
POST  /api/y-tuong           - Create new idea
PUT   /api/y-tuong/{id}      - Update idea
PUT   /api/y-tuong/{id}/status - Update status
POST  /api/y-tuong/{id}/files - Upload files
DELETE /api/y-tuong/{id}/files/{fileId} - Delete file
```

### Required Services
```
QLNVKHService.submitIdea()    - Submit to backend
QLNVKHService.getIdeasList()  - Fetch all ideas
QLNVKHService.getOfficers()   - Get officer list
QLNVKHService.uploadFiles()   - Upload attachments
```

---

## 7. Testing Workflows

### Workflow 1: Submit New Idea
1. Go to `/portal/y-tuong`
2. Select "Create New"
3. Fill all fields
4. Click "Save Draft" to verify localStorage works
5. Click "Next" to move through steps
6. Upload files (optional)
7. Select officer
8. Preview and submit
9. Verify success page shows ticket code

### Workflow 2: Review Submitted Ideas (Admin)
1. Go to `/admin/y-tuong/`
2. Search for idea by code or name
3. Filter by status
4. Click "Xem" to view details
5. Change status in modal
6. Verify changes would be saved

### Workflow 3: From Idea to Innovation
1. Submit idea via portal
2. Admin reviews in `/admin/y-tuong/`
3. Admin navigates to `/admin/sang-kien/dang-ky-sang-kien/`
4. Creates innovation from portal idea
5. Fills extended form with more details
6. Submits to higher level

---

## 8. Current Limitations & TODO

### Known Issues
1. Mock data only - no backend persistence
2. Status updates in modal don't persist
3. No email notifications
4. No file actual upload to storage
5. No workflow automation
6. Officer list is hardcoded

### High Priority Improvements
- [ ] Connect to backend API
- [ ] Implement real persistence
- [ ] Add notification system
- [ ] Integrate file storage
- [ ] Add workflow rules engine
- [ ] Implement approval workflow
- [ ] Add audit trail/history
- [ ] Export to Excel/PDF

### Medium Priority
- [ ] Add statistics/dashboard
- [ ] Implement bulk actions
- [ ] Add advanced search
- [ ] Create custom reports
- [ ] Add email templates
- [ ] Implement SLA tracking

---

## 9. File Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── y-tuong/                          [NEW]
│   │   │   └── quan-ly-y-tuong/
│   │   │       ├── QuanLyYTuongPage.tsx      [NEW]
│   │   │       └── index.tsx                 [NEW]
│   │   └── portal/
│   │       └── NopYTuongPage.tsx             [ENHANCED]
│   └── routing/
│       ├── PrivateRoutes.tsx                 [UPDATED]
│       └── y-tuong/
│           ├── QuanLyYTuongRoutes.tsx        [NEW]
│           └── index.ts                     [NEW]
```

---

## 10. Performance & Optimization

### Current
- All data loaded at once (mock data)
- Filtering done in-memory
- No pagination for large datasets

### Recommended
- Implement server-side pagination
- Add lazy loading for tables
- Cache frequently accessed data
- Implement virtual scrolling for large lists
- Add request debouncing for search

---

**Last Updated:** 2024-06-17  
**Status:** Development  
**Next Review:** When backend integration begins
