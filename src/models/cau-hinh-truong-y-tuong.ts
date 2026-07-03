// ── Cấu hình trường thông tin ý tưởng ─────────────────────────────────────

export interface IIdeaFieldConfig {
  id: string;
  readOnly?: boolean;
  fieldCode: string;       // Mã trường: "tenYTuong", "linhVuc", "moTaVanDe", ...
  fieldName: string;       // Tên hiển thị: "Tên ý tưởng", "Lĩnh vực", ...
  dataType: string;        // text | textarea | select | file
  isRequired: boolean;     // Bắt buộc?
  isActive: boolean;       // Có sử dụng?
  sortOrder: number;       // Thứ tự hiển thị
  description?: string;    // Mô tả / hướng dẫn
  placeholder?: string;    // Placeholder text
  options?: string;        // JSON string cho select options
  maxLength?: number;      // Độ dài tối đa
  defaultValue?: string;   // Giá trị mặc định
}

/* Danh sách các trường có thể cấu hình */
export const IDEA_FIELD_DEFAULTS: Omit<IIdeaFieldConfig, 'id'>[] = [
  { fieldCode: 'tenYTuong',     fieldName: 'Tên ý tưởng',           dataType: 'text',     isRequired: true,  isActive: true, sortOrder: 1,  placeholder: 'Nhập tên ý tưởng ngắn gọn, rõ ràng...',         maxLength: 500 },
  { fieldCode: 'linhVuc',       fieldName: 'Lĩnh vực',               dataType: 'select',   isRequired: true,  isActive: true, sortOrder: 2,  placeholder: 'Chọn lĩnh vực' },
  { fieldCode: 'moTaVanDe',     fieldName: 'Mô tả vấn đề hiện tại',  dataType: 'textarea', isRequired: true,  isActive: true, sortOrder: 3,  placeholder: 'Mô tả vấn đề, thực trạng hiện tại...',            maxLength: 1000 },
  { fieldCode: 'noiDungDeXuat', fieldName: 'Nội dung ý tưởng / Giải pháp đề xuất', dataType: 'textarea', isRequired: true, isActive: true, sortOrder: 4, placeholder: 'Mô tả chi tiết giải pháp, cách thức thực hiện...', maxLength: 2000 },
  { fieldCode: 'mucTieu',       fieldName: 'Mục tiêu cụ thể',        dataType: 'textarea', isRequired: true,  isActive: true, sortOrder: 5,  placeholder: 'Các mục tiêu cụ thể, có thể đo lường được...',    maxLength: 1000 },
  { fieldCode: 'loiIch',        fieldName: 'Lợi ích dự kiến',        dataType: 'textarea', isRequired: false, isActive: true, sortOrder: 6,  placeholder: 'Lợi ích mang lại cho tổ chức, cộng đồng...',       maxLength: 1000 },
  { fieldCode: 'phamViApDung',  fieldName: 'Phạm vi áp dụng',        dataType: 'text',     isRequired: false, isActive: true, sortOrder: 7,  placeholder: 'Phạm vi áp dụng của ý tưởng...',                   maxLength: 500 },
  { fieldCode: 'donViCongTac',  fieldName: 'Đơn vị công tác',        dataType: 'text',     isRequired: false, isActive: true, sortOrder: 8,  placeholder: 'Đơn vị công tác của người đề xuất...',              maxLength: 300 },
  { fieldCode: 'nguoiDeXuat',   fieldName: 'Người đề xuất',          dataType: 'text',     isRequired: false, isActive: true, sortOrder: 9,  placeholder: 'Họ tên người đề xuất...',                           maxLength: 200 },
  { fieldCode: 'ghiChu',        fieldName: 'Ghi chú thêm',           dataType: 'textarea', isRequired: false, isActive: true, sortOrder: 10, placeholder: 'Các thông tin bổ sung nếu có...',                  maxLength: 500 },
  { fieldCode: 'fileDinhKem',   fieldName: 'Tài liệu đính kèm',      dataType: 'file',     isRequired: false, isActive: true, sortOrder: 11, placeholder: 'Đính kèm tài liệu minh họa...',                     maxLength: 0 },
];