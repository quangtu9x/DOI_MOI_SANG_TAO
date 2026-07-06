import { requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile, requestDownloadFile } from '@/utils/baseAPI';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  IIdea,
  IIdeaAttachment,
  IIdeaCreateRequest,
  IIdeaSearchRequest,
  IIdeaStatusActionRequest,
  IIdeaTemplate,
  IIdeaHistory,
  IIdeaDashboard,
  IIdeaContributionReport,
  IAttachmentUploadResult,
  ICauHinhXuLyYTuong,
} from '@/models/idea-portal';
import { IPaginationResponse, IResult } from '@/models';

// ── Ideas ────────────────────────────────────────────────────────────────────

export const createIdea = (data: IIdeaCreateRequest) =>
  requestPOST<IResult<IIdea>>('ideas', data);

export const updateIdea = (id: string, data: IIdeaCreateRequest) =>
  requestPUT<IResult<IIdea>>(`ideas/${id}`, { ...data, Id: id });

export const getIdeaDetail = (id: string) =>
  requestGET<IIdea>(`ideas/${id}`);

/** Thêm tài liệu đính kèm vào ý tưởng đã có (vd: hồ sơ/quyết định công nhận) */
export const addIdeaAttachments = (id: string, attachments: IIdeaAttachment[]) =>
  requestPUT<IResult<string>>(`ideas/${id}/attachments`, attachments);

export const searchIdeas = (data: IIdeaSearchRequest) =>
  requestPOST<IPaginationResponse<IIdea[]>>('ideas/search', data);

/** Lịch sử xử lý của ý tưởng (mới nhất trước) */
export const getIdeaHistories = (ideaId: string) =>
  requestGET<IResult<IIdeaHistory[]>>(`IdeaHistories/by-idea/${ideaId}`);

// ── Báo cáo / Dashboard ĐMST ─────────────────────────────────────────────────

/** Khoảng thời gian tùy chọn (ưu tiên hơn `nam` nếu có) — định dạng yyyy-MM-dd */
export interface IKhoangThoiGian {
  tuNgay?: string;
  denNgay?: string;
}

const rangeQuery = (range?: IKhoangThoiGian) => {
  const q = new URLSearchParams();
  if (range?.tuNgay) q.append('tuNgay', range.tuNgay);
  if (range?.denNgay) q.append('denNgay', range.denNgay);
  return q;
};

/** Dashboard điều hành ĐMST (số liệu thật từ dữ liệu ý tưởng) */
export const getIdeaDashboard = (nam?: number, slaGio = 72, range?: IKhoangThoiGian) => {
  const q = rangeQuery(range);
  q.append('slaGio', String(slaGio));
  if (nam) q.append('nam', String(nam));
  return requestGET<IResult<IIdeaDashboard>>(`IdeaReports/dashboard?${q}`);
};

/** Cấu hình xử lý hồ sơ ý tưởng: người tiếp nhận mặc định, thời hạn tiếp nhận / kiểm duyệt công nhận (ngày) */
export const getCauHinhXuLyYTuong = () =>
  requestGET<IResult<ICauHinhXuLyYTuong>>('Ideas/cau-hinh-xu-ly');

/** Bảng xếp hạng đóng góp cá nhân/đơn vị theo kỳ */
export const getIdeaContributions = (params: { nam?: number; quy?: number; thang?: number; top?: number } & IKhoangThoiGian) => {
  const q = rangeQuery(params);
  if (params.nam) q.append('nam', String(params.nam));
  if (params.quy) q.append('quy', String(params.quy));
  if (params.thang) q.append('thang', String(params.thang));
  if (params.top) q.append('top', String(params.top));
  return requestGET<IResult<IIdeaContributionReport>>(`IdeaReports/contributions?${q}`);
};

/** Xuất báo cáo ĐMST tổng hợp (CSV mở bằng Excel) */
export const exportIdeaReport = (nam?: number, range?: IKhoangThoiGian) => {
  const q = rangeQuery(range);
  if (nam) q.append('nam', String(nam));
  return requestDownloadFile(`IdeaReports/export?${q}`, {});
};

/** Xuất báo cáo ĐMST tổng hợp ra file Excel (.xlsx) */
export const exportIdeaReportExcel = (nam?: number, range?: IKhoangThoiGian) => {
  const q = rangeQuery(range);
  if (nam) q.append('nam', String(nam));
  return requestDownloadFile(`IdeaReports/export-excel?${q}`, {});
};

/** Xuất báo cáo ĐMST tổng hợp ra file PDF */
export const exportIdeaReportPdf = (nam?: number, range?: IKhoangThoiGian) => {
  const q = rangeQuery(range);
  if (nam) q.append('nam', String(nam));
  return requestDownloadFile(`IdeaReports/export-pdf?${q}`, {});
};

/** Xuất báo cáo ĐMST tổng hợp ra file Word (.docx) */
export const exportIdeaReportWord = (nam?: number, range?: IKhoangThoiGian) => {
  const q = rangeQuery(range);
  if (nam) q.append('nam', String(nam));
  return requestDownloadFile(`IdeaReports/export-word?${q}`, {});
};

// ── Status transitions ────────────────────────────────────────────────────────

export const submitIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/submit`, { remark } as IIdeaStatusActionRequest);

export const receiveIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/receive`, { remark } as IIdeaStatusActionRequest);

export const returnIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/return`, { remark } as IIdeaStatusActionRequest);

export const cancelIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/cancel`, { remark } as IIdeaStatusActionRequest);

/** Công nhận ý tưởng (Đã tiếp nhận → Được công nhận); remark = thông tin công nhận */
export const recognizeIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/recognize`, { remark } as IIdeaStatusActionRequest);

// Thu hồi ý tưởng đã nộp (Chờ tiếp nhận → Bản nháp / Hủy)
export const recallIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/recall`, { remark } as IIdeaStatusActionRequest);

export const deleteIdea = (id: string) =>
  requestDELETE<IResult<unknown>>(`ideas/${id}`);

export const markIdeaAsTemplate = (id: string) =>
  requestPUT<IResult<unknown>>(`IdeaStatus/${id}/la-y-tuong-mau`, true);

// ── Templates ─────────────────────────────────────────────────────────────────

export const getIdeaTemplates = () =>
  requestGET<IIdeaTemplate[]>('IdeaTemplates');

export const createIdeaTemplate = (data: { code: string; name: string; description?: string; active?: boolean }) =>
  requestPOST<IResult<IIdeaTemplate>>('IdeaTemplates', data);

// ── Attachments ───────────────────────────────────────────────────────────────

/**
 * Upload files to /api/v1/attachments/public
 * Returns array of IAttachmentUploadResult
 */
export const uploadIdeaFiles = async (
  files: UploadFile[],
  onProgress?: (pct: number) => void,
): Promise<IAttachmentUploadResult[]> => {
  const form = new FormData();
  for (const f of files) {
    if (f.originFileObj) form.append('files', f.originFileObj as File);
  }
  form.append('bucketName', 'my-bucket');
  form.append('prefix', 'public');
  form.append('generateThumbnail', 'true');
  form.append('thumbnailWidth', '150');
  form.append('thumbnailHeight', '150');

  const res = await requestUploadFile<any>(
    'attachments/public',
    form,
    'private',
    onProgress,
  );

  const raw = res.data;
  if (!raw) return [];
  // Response là mảng trực tiếp
  if (Array.isArray(raw)) return raw as IAttachmentUploadResult[];
  // Response wrap trong IResult: { succeeded, data: [...] }
  if (raw.data !== undefined) {
    return Array.isArray(raw.data) ? raw.data : (raw.data ? [raw.data] : []);
  }
  return [];
};
