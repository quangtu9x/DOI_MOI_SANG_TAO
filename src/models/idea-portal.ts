// ── Idea Portal — TypeScript interfaces matching /api/v1/ideas API ──────────────

export interface IIdeaAttachment {
  fileName: string;
  originalName?: string | null;
  filePath: string;
  fileExt: string;
  fileSize: number;
  bucketName?: string;
  prefix?: string;
  thumbnailUrl?: string | null;
}

export interface IIdeaTemplate {
  id: string;
  code?: string;
  name: string;
  description?: string;
  active?: boolean;
}

/** POST /api/v1/ideas — tạo mới */
export interface IIdeaCreateRequest {
  code?: string | null;
  title: string;
  problemDescription: string;
  ideaContent: string;
  expectedBenefit?: string | null;

  templateId?: string | null;
  receiverId?: string | null;

  status?: string;          // "Bản nháp"
  sourceType?: string;      // "MANUAL" | "IMPORT"

  linhVuc?: string | null;
  mucTieu?: string | null;
  nguoiDeXuat?: string | null;
  donViCongTac?: string | null;
  phamViApDung?: string | null;
  ngayApDung?: string | null; // ISO datetime string

  attachments?: IIdeaAttachment[];
}

/** GET/PUT /api/v1/ideas/{id} */
export interface IIdea extends IIdeaCreateRequest {
  id: string;
  createdAt?: string;
  createdOn?: string;
  updatedAt?: string;
  submittedAt?: string;
  submittedOn?: string;
  createdBy?: string;
  receiverName?: string;
  statusLabel?: string;
}

/** POST /api/v1/ideas/search */
export interface IIdeaSearchRequest {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  linhVuc?: string | null;
  status?: string | null;
  submittedById?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
}

/** POST /api/v1/attachments/public — upload response item */
export interface IAttachmentUploadResult {
  fileName: string;
  originalName?: string | null;
  filePath: string;
  fileExt: string;
  fileSize: number;
  bucketName: string;
  prefix: string;
  thumbnailUrl?: string | null;
}

/** POST /api/v1/IdeaStatus/{id}/submit|receive|return|cancel */
export interface IIdeaStatusActionRequest {
  remark?: string;
}
