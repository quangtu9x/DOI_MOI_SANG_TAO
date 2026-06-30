import { requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile } from '@/utils/baseAPI';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  IIdea,
  IIdeaCreateRequest,
  IIdeaSearchRequest,
  IIdeaStatusActionRequest,
  IIdeaTemplate,
  IAttachmentUploadResult,
} from '@/models/idea-portal';
import { IPaginationResponse, IResult } from '@/models';

// ── Ideas ────────────────────────────────────────────────────────────────────

export const createIdea = (data: IIdeaCreateRequest) =>
  requestPOST<IResult<IIdea>>('ideas', data);

export const updateIdea = (id: string, data: IIdeaCreateRequest) =>
  requestPUT<IResult<IIdea>>(`ideas/${id}`, { ...data, Id: id });

export const getIdeaDetail = (id: string) =>
  requestGET<IIdea>(`ideas/${id}`);

export const searchIdeas = (data: IIdeaSearchRequest) =>
  requestPOST<IPaginationResponse<IIdea[]>>('ideas/search', data);

// ── Status transitions ────────────────────────────────────────────────────────

export const submitIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/submit`, { remark } as IIdeaStatusActionRequest);

export const receiveIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/receive`, { remark } as IIdeaStatusActionRequest);

export const returnIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/return`, { remark } as IIdeaStatusActionRequest);

export const cancelIdea = (id: string, remark = '') =>
  requestPOST<IResult<unknown>>(`IdeaStatus/${id}/cancel`, { remark } as IIdeaStatusActionRequest);

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
