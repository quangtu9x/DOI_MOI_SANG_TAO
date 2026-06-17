import { IPaginationResponse, IResult } from './response';
import { IBasePagination, IBaseSearch } from './basemodel';

export enum CapitalPlanStatus {
  Draft = 0,      // Nháp
  Submitted = 1,  // Đã nộp
  Approved = 2,   // Đã phê duyệt
  Rejected = 3,   // Từ chối
  Executing = 4,  // Đang thực hiện
  Completed = 5   // Hoàn thành
}

export interface IAnnualCapitalPlan {
  id?: string;
  year: number;
  name: string;
  code: string;
  totalCapital: number;
  allocatedCapital?: number;
  remainingCapital?: number;
  organizationUnitId?: string;
  organizationUnitName?: string;
  organizationUnitCode?: string;
  status: CapitalPlanStatus;
  approvedDate?: string;
  approvedBy?: string;
  approvalNote?: string;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  modelType?: string;
  readOnly?: boolean;
  keHoachIds?: string[];
  keHoachs?: any[] | [];
}

export interface ISearchAnnualCapitalPlanRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  year?: number;
  status?: CapitalPlanStatus;
  organizationUnitId?: string;
  orderBy?: string[];
}

export interface ICreateAnnualCapitalPlanRequest {
  year: number;
  name: string;
  code: string;
  totalCapital: number;
  organizationUnitId?: string;
  description?: string;
  attachments?: string[];
}

export interface IUpdateAnnualCapitalPlanRequest {
  year?: number;
  name?: string;
  code?: string;
  totalCapital?: number;
  organizationUnitId?: string;
  description?: string;
  attachments?: string[];
}

export interface IProjectRegistrationsSummary {
  totalProjects: number;
  totalRegistrations: number;
  totalRegisteredAmount?: number;
  approvedCount: number;
  pendingCount: number;
}

export enum CapitalAllocationType {
  Initial = 0,      // Phân bổ ban đầu
  Adjustment = 1,   // Điều chỉnh
  Supplement = 2    // Bổ sung
}

export interface ICapitalAllocation {
  id?: string;
  annualCapitalPlanId?: string;
  annualCapitalPlanName?: string;
  annualCapitalPlanCode?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  projectOwnerName?: string;
  allocatedAmount: number;
  allocationType: CapitalAllocationType;
  allocationDate: string;
  note?: string;
  attachments?: string;
  attachmentList?: string[];
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchCapitalAllocationRequest extends IBaseSearch, IBasePagination {
  annualCapitalPlanId?: string;
  projectId?: string;
  investorId?: string;
  allocationType?: CapitalAllocationType;
  keyword?: string;
  orderBy?: string[];
}

export interface ICreateCapitalAllocationRequest {
  annualCapitalPlanId: string;
  projectId: string;
  allocatedAmount: number;
  allocationType: CapitalAllocationType;
  allocationDate: string;
  note?: string;
  attachments?: string;
}

export interface IUpdateCapitalAllocationRequest {
  id: string;
  annualCapitalPlanId: string;
  projectId: string;
  allocatedAmount: number;
  allocationType: CapitalAllocationType;
  allocationDate: string;
  note?: string;
  attachments?: string;
}

export enum ProjectStatus {
  Draft = 0,           // Nháp
  Planning = 1,       // Đang lập kế hoạch
  Approved = 2,        // Đã phê duyệt
  Executing = 3,       // Đang thực hiện
  Suspended = 4,       // Tạm dừng
  Completed = 5,       // Hoàn thành
  Cancelled = 6        // Hủy bỏ
}

export enum ProjectPhase {
  Preparation = 0,    // Giai đoạn chuẩn bị đầu tư
  Implementation = 1,  // Giai đoạn thực hiện đầu tư
  Completion = 2,      // Giai đoạn kết thúc đầu tư
  PostInvestment = 3   // Quản lý dự án sau đầu tư
}

// Loại bước thực hiện (StepType)
export enum StepType {
  // Giai đoạn Chuẩn bị đầu tư (Preparation Phase)
  PreFeasibilityReport = 0,              // Báo cáo nghiên cứu tiền khả thi
  InvestmentPolicyProposal = 1,          // Báo cáo đề xuất chủ trương đầu tư
  InvestmentPolicyDecision = 2,          // Quyết định chủ trương đầu tư
  SurveyTask = 3,                        // Nhiệm vụ khảo sát
  FeasibilityReport = 4,                 // Báo cáo nghiên cứu khả thi
  BasicDesignPreparation = 5,            // Hồ sơ thiết kế cơ sở - Lập hồ sơ
  BasicDesignAppraisal = 6,              // Hồ sơ thiết kế cơ sở - Thẩm định
  TechnicalEconomicReport = 7,           // Báo cáo kinh tế kỹ thuật
  InvestmentDecision = 8,                // Quyết định đầu tư

  // Giai đoạn Thực hiện đầu tư (Implementation Phase)
  DetailedDesignPreparation = 9,         // Hồ sơ thiết kế chi tiết và dự toán - Lập hồ sơ
  DetailedDesignAppraisal = 10,          // Hồ sơ thiết kế chi tiết và dự toán - Thẩm định
  BiddingContractorSelection = 11,      // Đấu thầu, lựa chọn nhà thầu
  ProductTesting = 12,                   // Kiểm thử sản phẩm
  TrialOperation = 13,                   // Vận hành thử sản phẩm
  AcceptanceHandover = 14,               // Nghiệm thu, bàn giao sản phẩm

  // Giai đoạn Kết thúc đầu tư (Completion Phase)
  PaymentSettlement = 15,                // Thanh toán, quyết toán dự án

  // Giai đoạn Sau đầu tư (Post-Investment Phase)
  PostInvestmentMonitoring = 16          // Giám sát, đánh giá sau đầu tư
}

export interface IProject {
  id?: string;
  name?: string;
  code?: string;
  projectTypeId?: string;
  projectTypeName?: string;
  projectGroupId?: string;
  projectGroupName?: string;
  investorId?: string;
  investorName?: string;
  investorCode?: string;
  organizationUnitId?: string;
  organizationUnitName?: string;
  contractorId?: string;
  contractorName?: string;
  investmentCapitalSourceId?: string;
  investmentCapitalSourceName?: string;
  provinceId?: string;
  provinceName?: string;
  wardId?: string;
  wardName?: string;
  address?: string;
  totalInvestment?: number;
  allocatedCapital?: number;
  disbursedCapital?: number;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status?: ProjectStatus;
  currentPhase?: ProjectPhase;
  description?: string;
  objectives?: string;
  scope?: string;
  content?: string;
  expectedResults?: string;
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  projectTypeId?: string;
  projectGroupId?: string;
  investorId?: string;
  organizationUnitId?: string;
  contractorId?: string;
  status?: ProjectStatus;
  currentPhase?: ProjectPhase;
  orderBy?: string[];
}

export interface ICreateProjectRequest {
  name: string;
  code?: string;
  projectTypeId?: string;
  projectGroupId?: string;
  investorId?: string;
  organizationUnitId?: string;
  contractorId?: string;
  investmentCapitalSourceId?: string;
  provinceId?: string;
  wardId?: string;
  address?: string;
  totalInvestment?: number;
  allocatedCapital?: number;
  disbursedCapital?: number;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status?: ProjectStatus;
  currentPhase?: ProjectPhase;
  description?: string;
  objectives?: string;
  scope?: string;
  content?: string;
  expectedResults?: string;
  note?: string;
}

export interface IUpdateProjectRequest {
  id: string;
  name?: string;
  code?: string;
  projectTypeId?: string;
  projectGroupId?: string;
  investorId?: string;
  organizationUnitId?: string;
  contractorId?: string;
  investmentCapitalSourceId?: string;
  provinceId?: string;
  wardId?: string;
  address?: string;
  totalInvestment?: number;
  allocatedCapital?: number;
  disbursedCapital?: number;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status?: ProjectStatus;
  currentPhase?: ProjectPhase;
  description?: string;
  objectives?: string;
  scope?: string;
  content?: string;
  expectedResults?: string;
  note?: string;
}

// ========== Project Process (Quy trình) ==========
export interface IProjectProcess {
  id?: string;
  name?: string;
  code?: string;
  projectTypeId?: string;
  projectTypeName?: string;
  projectGroupId?: string;
  projectGroupName?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectProcessRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  isActive?: boolean;
  projectTypeId?: string;
  projectGroupId?: string;
  orderBy?: string[];
}

export interface ICreateProjectProcessRequest {
  name: string;
  code?: string;
  projectTypeId?: string;
  projectGroupId?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface IUpdateProjectProcessRequest {
  id: string;
  name?: string;
  code?: string;
  projectTypeId?: string;
  projectGroupId?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// ========== Project Process Step (Bước quy trình mẫu) ==========
export interface IProjectProcessStep {
  id?: string;
  projectProcessId?: string;
  projectProcessName?: string;
  projectProcessCode?: string;
  name?: string;
  code?: string;
  description?: string;
  stepOrder?: number;
  nextStepId?: string;
  nextStepName?: string;
  previousStepId?: string;
  previousStepName?: string;
  isRequired?: boolean;
  canSkip?: boolean;
  estimatedDays?: number;
  requiredDocuments?: string;
  responsibleRole?: string;
  isActive?: boolean;
  stepType?: StepType; // Loại bước thực hiện
  // Documents từ ProjectProcessStep (NEW) - danh sách thành phần hồ sơ mẫu
  documents?: IProjectStepDocument[];
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectProcessStepRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  projectProcessId?: string;
  code?: string;
  isActive?: boolean;
  stepType?: StepType;              // Loại bước thực hiện
  stepTypes?: StepType[];           // Danh sách loại bước thực hiện
  phase?: ProjectPhase;             // Giai đoạn dự án
  orderBy?: string[];
}

export interface ICreateProjectProcessStepRequest {
  projectProcessId: string;
  name: string;
  code?: string;
  description?: string;
  stepOrder?: number;
  nextStepId?: string;
  previousStepId?: string;
  isRequired?: boolean;
  canSkip?: boolean;
  estimatedDays?: number;
  requiredDocuments?: string;
  responsibleRole?: string;
  isActive?: boolean;
  stepType?: StepType;
}

export interface IUpdateProjectProcessStepRequest {
  id: string;
  projectProcessId?: string;
  name?: string;
  code?: string;
  description?: string;
  stepOrder?: number;
  nextStepId?: string;
  previousStepId?: string;
  isRequired?: boolean;
  canSkip?: boolean;
  estimatedDays?: number;
  requiredDocuments?: string;
  responsibleRole?: string;
  isActive?: boolean;
  stepType?: StepType;
}

// ========== Project Process Execution (Áp dụng quy trình cho dự án) ==========
export enum WorkItemStatus {
  Pending = 0,      // Chờ xử lý
  InProgress = 1,   // Đang xử lý
  Completed = 2,    // Hoàn thành
  Cancelled = 3     // Hủy bỏ
}

export interface IProjectProcessExecution {
  id?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  projectProcessId?: string;
  projectProcessName?: string;
  projectProcessCode?: string;
  sourceProjectId?: string;
  sourceProjectName?: string;
  sourceProjectCode?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  isCompleted?: boolean;
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectProcessExecutionRequest extends IBaseSearch, IBasePagination {
  projectId?: string;
  projectProcessId?: string;
  isCompleted?: boolean;
  keyword?: string;
  orderBy?: string[];
}

export interface ICreateProjectProcessExecutionRequest {
  projectId: string;
  projectProcessId: string;
  sourceProjectId?: string;
  startDate?: string;
  expectedEndDate?: string;
  note?: string;
}

export interface IUpdateProjectProcessExecutionRequest {
  id: string;
  projectId?: string;
  projectProcessId?: string;
  sourceProjectId?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  isCompleted?: boolean;
  note?: string;
}

// Áp dụng quy trình mới cho dự án
export interface IApplyProjectProcessRequest {
  projectId: string;
  projectProcessId: string;
  startDate?: string;
  expectedEndDate?: string;
  note?: string;
}

// Kế thừa quy trình từ dự án nguồn
export interface IInheritProjectProcessRequest {
  projectId: string;
  sourceProjectId: string;
  startDate?: string;
  expectedEndDate?: string;
  note?: string;
}

// ========== Project Process Step Execution (Thực hiện từng bước) ==========
export interface IProjectProcessStepExecution {
  id?: string;
  projectProcessExecutionId?: string;
  projectProcessExecutionName?: string;
  projectProcessStepId?: string;
  projectProcessStepName?: string;
  projectProcessStepCode?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  assignedUserFullName?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status?: WorkItemStatus;
  note?: string;
  result?: string;
  isCompleted?: boolean;
  assignedDate?: string;
  assignedBy?: string;
  assignedByName?: string;
  stepType?: StepType;              // Loại bước thực hiện
  stepTypeName?: string;             // Tên loại bước thực hiện
  phase?: ProjectPhase;             // Giai đoạn dự án
  phaseName?: string;                // Tên giai đoạn dự án
  // Step info from linked ProjectProcessStep
  stepName?: string;                 // Tên bước từ ProjectProcessStep
  stepCode?: string;                 // Mã bước từ ProjectProcessStep
  stepOrder?: number;                // Thứ tự bước từ ProjectProcessStep
  // Documents
  documents?: IProjectStepDocument[]; // Danh sách thành phần hồ sơ
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectProcessStepExecutionRequest extends IBaseSearch, IBasePagination {
  projectProcessExecutionId?: string;
  projectProcessStepId?: string;
  assignedUserId?: string;
  isCompleted?: boolean;
  status?: WorkItemStatus;
  stepType?: StepType;              // Loại bước thực hiện
  stepTypes?: StepType[];           // Danh sách loại bước thực hiện
  phase?: ProjectPhase;             // Giai đoạn dự án
  keyword?: string;
  orderBy?: string[];
}

export interface ICreateProjectProcessStepExecutionRequest {
  projectProcessExecutionId: string;
  projectProcessStepId: string;
  assignedUserId?: string;
  assignedBy?: string;
  assignedDate?: string;
  startDate?: string;
  expectedEndDate?: string;
  note?: string;
  // Thành phần hồ sơ - truyền thẳng vào request
  documents?: IProjectStepDocument[];
}

export interface IUpdateProjectProcessStepExecutionRequest {
  id: string;
  projectProcessExecutionId?: string;
  projectProcessStepId?: string;
  assignedUserId?: string;
  assignedBy?: string;
  assignedDate?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status?: WorkItemStatus;
  note?: string;
  result?: string;
  isCompleted?: boolean;
  // Thành phần hồ sơ - truyền thẳng vào request
  documents?: IProjectStepDocument[];
}

// ========== Investor (Chủ đầu tư) ==========
export interface IInvestor {
  id?: string;
  name: string;
  code?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  representative?: string;
  representativePosition?: string;
  organizationUnitId?: string;
  provinceCityId?: string;
  provinceCityName?: string;
  wardCommuneId?: string;
  wardCommuneName?: string;
  website?: string;
  fax?: string;
  bankAccount?: string;
  bankName?: string;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchInvestorRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  isActive?: boolean;
  organizationUnitId?: string;
  orderBy?: string[];
}

export interface ICreateInvestorRequest {
  name: string;
  code?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  representative?: string;
  representativePosition?: string;
  organizationUnitId?: string;
  provinceCityId?: string;
  wardCommuneId?: string;
  website?: string;
  fax?: string;
  bankAccount?: string;
  bankName?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateInvestorRequest {
  id: string;
  name?: string;
  code?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  representative?: string;
  representativePosition?: string;
  organizationUnitId?: string;
  provinceCityId?: string;
  wardCommuneId?: string;
  website?: string;
  fax?: string;
  bankAccount?: string;
  bankName?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

// ========== ProvinceCity (Tỉnh thành phố) ==========
export interface IProvinceCity {
  id?: string;
  name: string;
  code?: string;
  administrativeCode?: string;
  level?: number;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProvinceCityRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  administrativeCode?: string;
  level?: number;
  isActive?: boolean;
  orderBy?: string[];
}

export interface ICreateProvinceCityRequest {
  name: string;
  code?: string;
  administrativeCode?: string;
  level?: number;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateProvinceCityRequest {
  id: string;
  name?: string;
  code?: string;
  administrativeCode?: string;
  level?: number;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

// ========== WardCommune (Phường xã) ==========
export interface IWardCommune {
  id?: string;
  name: string;
  code?: string;
  provinceCityId?: string;
  provinceCityName?: string;
  administrativeCode?: string;
  level?: number;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchWardCommuneRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  provinceCityId?: string;
  administrativeCode?: string;
  level?: number;
  isActive?: boolean;
  orderBy?: string[];
}

export interface ICreateWardCommuneRequest {
  name: string;
  code?: string;
  provinceCityId?: string;
  administrativeCode?: string;
  level?: number;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateWardCommuneRequest {
  id: string;
  name?: string;
  code?: string;
  provinceCityId?: string;
  administrativeCode?: string;
  level?: number;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

// ========== Contractor (Nhà thầu) ==========
export interface IContractor {
  id?: string;
  name: string;
  code?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  representative?: string;
  representativePosition?: string;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchContractorRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  isActive?: boolean;
  orderBy?: string[];
}

export interface ICreateContractorRequest {
  name: string;
  code?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  representative?: string;
  representativePosition?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateContractorRequest {
  id: string;
  name?: string;
  code?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  representative?: string;
  representativePosition?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

// ========== InvestmentCapitalSource (Nguồn vốn đầu tư) ==========
export interface IInvestmentCapitalSource {
  id?: string;
  name: string;
  code?: string;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchInvestmentCapitalSourceRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  isActive?: boolean;
  orderBy?: string[];
}

export interface ICreateInvestmentCapitalSourceRequest {
  name: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateInvestmentCapitalSourceRequest {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

// ========== ProjectType (Loại dự án) ==========
export interface IProjectType {
  id?: string;
  projectGroupId?: string;
  projectGroupName?: string;
  projectGroupCode?: string;
  name: string;
  code?: string;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectTypeRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  projectGroupId?: string;
  isActive?: boolean;
  orderBy?: string[];
}

export interface ICreateProjectTypeRequest {
  projectGroupId?: string;
  name: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateProjectTypeRequest {
  id: string;
  projectGroupId?: string;
  name?: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

// ========== ProjectGroup (Nhóm dự án) ==========
export interface IProjectGroup {
  id?: string;
  name: string;
  code?: string;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectGroupRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  code?: string;
  isActive?: boolean;
  orderBy?: string[];
}

export interface ICreateProjectGroupRequest {
  name: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateProjectGroupRequest {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

// Type aliases for backward compatibility
export type IProvince = IProvinceCity;
export type ISearchProvinceRequest = ISearchProvinceCityRequest;
export type ICreateProvinceRequest = ICreateProvinceCityRequest;
export type IUpdateProvinceRequest = IUpdateProvinceCityRequest;

export type IWard = IWardCommune;
export type ISearchWardRequest = ISearchWardCommuneRequest;
export type ICreateWardRequest = ICreateWardCommuneRequest;
export type IUpdateWardRequest = IUpdateWardCommuneRequest;

// ========== OrganizationUnit (Cơ quan đơn vị) ==========
import { OrganizationUnitType } from './catalogs';
import { DefaultOptionType } from 'antd/es/cascader';
import { Dayjs } from 'dayjs';

// export interface IOrganizationUnit {
//   id?: string;
//   parentId?: string;
//   parentName?: string;
//   name: string;
//   code?: string;
//   fullCode?: string;
//   organizationUnitType?: OrganizationUnitType;
//   description?: string;
//   sortOrder?: number;
//   isActive?: boolean;
//   createdOn?: string;
//   createdBy?: string;
//   modifiedOn?: string;
//   modifiedBy?: string;
//   readOnly?: boolean;
// }

export interface ISearchOrganizationUnitRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  isActive?: boolean;
  organizationUnitType?: OrganizationUnitType;
  parentId?: string;
  orderBy?: string[];
}

export interface IGetTreeOrganizationUnitRequest extends IBaseSearch, IBasePagination {
  isActive?: boolean;
  organizationUnitTypeId?: string;
  parentId?: string;
  parentCode?: string;
  allowParentCodeNull?: boolean;
  allowParentIdNull?: boolean;
}

export interface ICreateOrganizationUnitRequest {
  parentId?: string;
  name: string;
  code?: string;
  organizationUnitType?: OrganizationUnitType;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdateOrganizationUnitRequest {
  id: string;
  parentId?: string;
  name?: string;
  code?: string;
  organizationUnitType?: OrganizationUnitType;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IAssignStepExecutionRequest {
  id: string;
  assignedUserId: string;
  assignedDate?: string;
  note?: string;
}

export interface IGetMyAssignedStepExecutionsRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  projectProcessExecutionId?: string;
  isCompleted?: boolean;
  status?: WorkItemStatus;
  projectProcessStepId?: string;
}

// ========== Project Step Document (Thành phần hồ sơ của bước thực hiện) ==========
export interface IProjectStepDocument {
  id?: string;
  projectProcessStepExecutionId?: string;
  projectProcessStepExecutionName?: string;
  name?: string;
  code?: string;
  description?: string;
  attachments?: string;
  attachmentList?: string[];
  sortOrder?: number;
  isRequired?: boolean;
  isCompleted?: boolean;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectStepDocumentRequest extends IBaseSearch, IBasePagination {
  projectProcessStepExecutionId?: string;
  keyword?: string;
  isRequired?: boolean;
  isCompleted?: boolean;
  orderBy?: string[];
}

export interface ICreateProjectStepDocumentRequest {
  projectProcessStepExecutionId: string;
  name: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isRequired?: boolean;
  isCompleted?: boolean;
}

export interface IUpdateProjectStepDocumentRequest {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  attachments?: string[];
  sortOrder?: number;
  isRequired?: boolean;
  isCompleted?: boolean;
}

export interface IAttachFileToProjectStepDocumentRequest {
  file: File;
}

// ========== Project Decision (Quyết định đầu tư/chủ trương đầu tư) ==========
export enum DecisionType {
  InvestmentPolicy = 0,    // Quyết định chủ trương đầu tư
  InvestmentDecision = 1   // Quyết định đầu tư
}

export interface IProjectDecision {
  id?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  type?: DecisionType;
  decisionNumber?: string;
  decisionDate?: string;
  decisionMaker?: string;
  content?: string;
  attachments?: string;
  attachmentList?: string[];
  isApproved?: boolean;
  approvedDate?: string;
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectDecisionRequest extends IBaseSearch, IBasePagination {
  projectId?: string;
  type?: DecisionType;
  keyword?: string;
  isApproved?: boolean;
  decisionDateFrom?: string;
  decisionDateTo?: string;
  orderBy?: string[];
}

export interface ICreateProjectDecisionRequest {
  projectId: string;
  type: DecisionType;
  decisionNumber?: string;
  decisionDate?: string;
  decisionMaker?: string;
  content?: string;
  attachments?: string;
  isApproved?: boolean;
  approvedDate?: string;
  note?: string;
}

export interface IUpdateProjectDecisionRequest {
  id: string;
  decisionNumber?: string;
  decisionDate?: string;
  decisionMaker?: string;
  content?: string;
  attachments?: string;
  isApproved?: boolean;
  approvedDate?: string;
  note?: string;
}

export interface IAttachFileToProjectDecisionRequest {
  file: File;
}

// ========== Project Difficulty (Khó khăn, vướng mắc) ==========
export enum ProjectDifficultyCategory {
  Difficulty = 0,      // Khó khăn, vướng mắc
  ProjectSituation = 1 // Tình hình dự án
}

export enum ProjectDifficultyType {
  Technical = 0,    // Kỹ thuật
  Financial = 1,    // Tài chính
  Legal = 2,        // Pháp lý
  Other = 3         // Khác
}

export enum ProjectDifficultyLevel {
  Low = 0,         // Thấp
  Medium = 1,      // Trung bình
  High = 2,        // Cao
  Critical = 3     // Nghiêm trọng
}

export enum ResolutionStatus {
  Pending = 0,      // Chờ xử lý
  InProgress = 1,  // Đang xử lý
  Resolved = 2,    // Đã xử lý
  Unresolved = 3   // Không thể xử lý
}

export interface IProjectDifficulty {
  id?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  projectStatus?: ProjectStatus;
  projectCurrentPhase?: ProjectPhase;
  category?: ProjectDifficultyCategory;
  title?: string;
  content?: string;
  type?: ProjectDifficultyType;
  level?: ProjectDifficultyLevel;
  occurredDate?: string;
  attachments?: string;
  attachmentList?: string[];
  resolutionResult?: string;
  resolvedDate?: string;
  resolvedBy?: string;
  resolutionStatus?: ResolutionStatus;
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectDifficultyRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  projectId?: string;
  category?: ProjectDifficultyCategory;
  type?: ProjectDifficultyType;
  level?: ProjectDifficultyLevel;
  resolutionStatus?: ResolutionStatus;
  isHasResult?: boolean;
  orderBy?: string[];
}

// ========== Project Contract (Hợp đồng thực hiện dự án) ==========
export enum ContractStatus {
  Draft = 0,          // Nháp
  Signed = 1,         // Đã ký
  Executing = 2,      // Đang thực hiện
  Completed = 3,      // Đã hoàn thành
  Terminated = 4,     // Đã chấm dứt
}

export interface IProjectContract {
  id?: string;
  projectId?: string;          // Dự án
  contractorId?: string;       // Nhà thầu
  contractorName?: string;
  contractorCode?: string;
  contractNumber?: string;     // Số hợp đồng
  contractDate?: string;       // Ngày ký hợp đồng
  startDate?: string;          // Ngày bắt đầu
  expectedEndDate?: string;    // Ngày kết thúc dự kiến
  actualEndDate?: string;      // Ngày kết thúc thực tế
  contractValue?: number;      // Giá trị hợp đồng
  content?: string;            // Nội dung hợp đồng
  attachments?: string;        // Chuỗi lưu danh sách file (server)
  attachmentList?: string[];   // Danh sách file hiển thị client
  status?: ContractStatus;     // Trạng thái hợp đồng
  note?: string;               // Ghi chú
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectContractRequest extends IBaseSearch, IBasePagination {
  projectId?: string;
  contractorId?: string;
  status?: ContractStatus;
  keyword?: string;
  contractDateFrom?: string;
  contractDateTo?: string;
  orderBy?: string[];
}

export interface ICreateProjectContractRequest {
  projectId: string;
  contractorId?: string;
  contractNumber?: string;
  contractDate?: string;
  startDate?: string;
  expectedEndDate?: string;
  contractValue?: number;
  content?: string;
  attachments?: string;
  status?: ContractStatus;
  note?: string;
}

export interface IUpdateProjectContractRequest {
  id: string;
  contractorId?: string;
  contractNumber?: string;
  contractDate?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  contractValue?: number;
  content?: string;
  attachments?: string;
  status?: ContractStatus;
  note?: string;
}

export interface IAttachFileToProjectContractRequest {
  file: File;
}

// ========== Project Difficulty (Khó khăn, vướng mắc) ==========
export enum DifficultyType {
  Technical = 0,      // Kỹ thuật
  Financial = 1,      // Tài chính
  Legal = 2,          // Pháp lý
  Other = 3,          // Khác
}

export enum DifficultyLevel {
  Low = 0,            // Thấp
  Medium = 1,         // Trung bình
  High = 2,           // Cao
  Critical = 3,       // Nghiêm trọng
}


// export interface IProjectDifficulty {
//   id?: string;
//   projectId?: string;          // Dự án
//   projectName?: string;
//   projectCode?: string;
//   title?: string;              // Tiêu đề
//   content?: string;            // Nội dung khó khăn, vướng mắc
//   type?: DifficultyType;       // Loại
//   level?: DifficultyLevel;     // Mức độ
//   occurredDate?: string;       // Ngày phát sinh
//   attachments?: string;
//   attachmentList?: string[];
//   note?: string;
//   // Thông tin xử lý
//   resolutionResult?: string;       // Kết quả xử lý
//   resolvedDate?: string;           // Ngày xử lý
//   resolvedBy?: string;             // Người xử lý (Id)
//   resolvedByName?: string;         // Tên người xử lý
//   resolutionStatus?: ResolutionStatus; // Trạng thái xử lý
//   createdOn?: string;
//   createdBy?: string;
//   modifiedOn?: string;
//   modifiedBy?: string;
//   readOnly?: boolean;
// }

// export interface ISearchProjectDifficultyRequest extends IBaseSearch, IBasePagination {
//   projectId?: string;
//   type?: DifficultyType;
//   level?: DifficultyLevel;
//   resolutionStatus?: ResolutionStatus;
//   keyword?: string;
//   occurredDateFrom?: string;
//   occurredDateTo?: string;
//   orderBy?: string[];
// }

export interface ICreateProjectDifficultyRequest {
  projectId: string;
  title: string;
  content?: string;
  type?: DifficultyType;
  level?: DifficultyLevel;
  occurredDate?: string;
  attachments?: string;
  note?: string;
}

export interface IUpdateProjectDifficultyRequest {
  id: string;
  title?: string;
  content?: string;
  type?: DifficultyType;
  level?: DifficultyLevel;
  occurredDate?: string;
  attachments?: string;
  note?: string;
}

export interface IAttachFileToProjectDifficultyRequest {
  file: File;
}

export interface IResolveProjectDifficultyRequest {
  id: string;
  resolutionResult?: string;
  resolvedDate?: string;
  resolutionStatus?: ResolutionStatus;
}

// ========== Project Post Investment Report (Báo cáo giám sát, đánh giá sau đầu tư) ==========
export enum ReportType {
  Monitoring = 0, // Giám sát
  Evaluation = 1, // Đánh giá
}

export interface IProjectPostInvestmentReport {
  id?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  reportNumber?: string;
  reportDate?: string;
  title?: string;
  content?: string;
  type?: ReportType;
  attachments?: string;
  attachmentList?: string[];
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectPostInvestmentReportRequest extends IBaseSearch, IBasePagination {
  projectId?: string;
  type?: ReportType;
  keyword?: string;
  reportDateFrom?: string;
  reportDateTo?: string;
  orderBy?: string[];
}

export interface ICreateProjectPostInvestmentReportRequest {
  projectId: string;
  reportNumber?: string;
  reportDate?: string;
  title: string;
  content?: string;
  type?: ReportType;
  attachments?: string;
  note?: string;
}

export interface IUpdateProjectPostInvestmentReportRequest {
  id: string;
  reportNumber?: string;
  reportDate?: string;
  title?: string;
  content?: string;
  type?: ReportType;
  attachments?: string;
  note?: string;
}

// ========== Project Operation Maintenance (Vận hành và bảo trì sản phẩm) ==========
export enum MaintenanceType {
  Operation = 0,      // Vận hành
  Maintenance = 1,    // Bảo trì
  Repair = 2,         // Sửa chữa
}

export interface IProjectOperationMaintenance {
  id?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  title?: string;
  content?: string;
  operationDate?: string;
  type?: MaintenanceType;
  attachments?: string;
  attachmentList?: string[];
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectOperationMaintenanceRequest extends IBaseSearch, IBasePagination {
  projectId?: string;
  type?: MaintenanceType;
  keyword?: string;
  operationDateFrom?: string;
  operationDateTo?: string;
  orderBy?: string[];
}

export interface ICreateProjectOperationMaintenanceRequest {
  projectId: string;
  title: string;
  content?: string;
  operationDate?: string;
  type?: MaintenanceType;
  attachments?: string;
  note?: string;
}

export interface IUpdateProjectOperationMaintenanceRequest {
  id: string;
  title?: string;
  content?: string;
  operationDate?: string;
  type?: MaintenanceType;
  attachments?: string;
  note?: string;
}

export interface IAttachFileToProjectOperationMaintenanceRequest {
  file: File;
}

// ========== Project Update History (Lịch sử cập nhật thông tin dự án) ==========
export enum ProjectUpdateHistoryType {
  ProjectInfo = 0,  // Thông tin dự án
  StepInfo = 1      // Thông tin bước tiến trình
}

export interface IProjectUpdateHistory {
  id?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  projectProcessStepExecutionId?: string;
  projectProcessStepExecutionName?: string;
  updateType?: ProjectUpdateHistoryType;
  updatedByUserId?: string;
  updatedByUserName?: string;
  updatedByUserFullName?: string;
  updateDate?: string;
  fieldName?: string;
  fieldDisplayName?: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  changeSummary?: string;
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectUpdateHistoryRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  projectId?: string;
  projectProcessStepExecutionId?: string;
  updateType?: ProjectUpdateHistoryType;
  updatedByUserId?: string;
  updateDateFrom?: string;
  updateDateTo?: string;
  fieldName?: string;
  orderBy?: string[];
}

export enum StepExecutionNotificationType {
  Upcoming = 0,    // Sắp đến hạn
  Due = 1,         // Đến hạn
  Overdue = 2      // Quá hạn
}

export enum NotificationStatus {
  Unread = 0,      // Chưa đọc
  Read = 1         // Đã đọc
}

export interface IProjectStepExecutionNotification {
  id?: string;
  projectProcessStepExecutionId?: string;
  projectProcessStepExecutionName?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  recipientUserId?: string;
  recipientUserName?: string;
  recipientUserFullName?: string;
  notificationContentId?: string;
  notificationType?: StepExecutionNotificationType;
  status?: NotificationStatus;
  title?: string;
  content?: string;
  notificationDate?: string;
  readDate?: string;
  expectedEndDate?: string;
  note?: string;
  createdOn?: string;
  createdBy?: string;
  modifiedOn?: string;
  modifiedBy?: string;
  readOnly?: boolean;
}

export interface ISearchProjectStepExecutionNotificationRequest extends IBaseSearch, IBasePagination {
  keyword?: string;
  projectProcessStepExecutionId?: string;
  recipientUserId?: string;
  notificationType?: StepExecutionNotificationType;
  status?: NotificationStatus;
  notificationDateFrom?: string;
  notificationDateTo?: string;
  orderBy?: string[];
}

export interface IBangDinhMuc {
    id: string;
    ma?: string | null;
    ten: string;
    ghiChu?: string | null;
    dinhKem?: string | null;
    mocDinhMucs?: string | null;
    danhMucHangMucs?: IDanhMucHangMuc[] | null;
    readOnly?: boolean;
}


export interface IDanhMucHangMuc {
    id: string;
    bangDinhMucId?: string | null;
    bangDinhMucTen?: string | null;
    bangDinhMuc?: DefaultOptionType | null;

    loaiDuAnId?: string | null;
    loaiDuAnTen?: string | null;
    loaiDuAn?: DefaultOptionType | null;

    ghiChu?: string | null;
    chiTietHangMucs?: IChiTietHangMuc[] | null;
}

export interface IChiTietHangMuc {
    id: string;
    hangMucId?: string | null;
    hangMuc?: DefaultOptionType | null;
    hangMucTen?: string | null;
    
    mocDinhMuc?: number | null;
    heSo?: number | null;
}

export enum LoaiNhapLieuChiPhi
{
    NguoiDungNhapLieu = 1, // Người dùng nhập liệu
    TinhTongCacChiPhiCon = 2, // Tính tổng các chi phí con
    TinhDinhMucVaCongThuc = 3, // Tính định mức và công thức
    DaCoDinhMucChiTinhCongThuc = 4, // Đã có định mức, chỉ tính công thức
    TinhTongDuToan = 5, // Tính tổng dự toán
    NguoiDungNhapDinhMucTinhCongThuc = 6, // Người dùng nhập định mức, tính công thức
}

export enum LoaiBangChiPhi
{
    MotBuoc = 1, // Một bước
    HaiBuoc = 2 // Hai bước
}

export interface IBangChiPhi {
    id: string;
    ma?: string | null;
    ten: string;
    
    loaiBang?: LoaiBangChiPhi | null;
    ghiChu?: string | null;
    dinhKem?: string | null;
    
    danhMucChiPhis?: IDanhMucChiPhi[] | null;
    readOnly?: boolean;
}


export interface IDanhMucChiPhi {
    id: string;
    bangChiPhiId?: string | null;
    stt: string;
    ten: string;
    danhMucChaId?: string | null;
    danhMucChaTen?: string | null;
    kyHieu?: string | null;
    maDinhMucTraCuu?: string | null;
    danhMucHangMucId?: string | null;
    chiPhiTruocThue?: number | null;
    chiPhiThueVAT?: number | null;
    chiPhiSauThue?: number | null;
    dinhMuc?: number | null;
    dinhMucNhapLieu?: number | null;
    giaTriTinhDinhMuc?: number | null;
    thueVATId?: string | null;
    thueVATTen?: string | null;
    thueVATGiaTri?: number | null;
    ghiChu?: string | null;
    loaiNhapLieu?: LoaiNhapLieuChiPhi | null;
    giaTriToiThieu?: number | null;
    giaTriToiDa?: number | null;
    dieuKienApDung?: string | null;
    khongThemVaoTong?: boolean | null;
    cachTinhGiaTri?: string | null;
    canCu?: string | null;
}

export enum TrangThaiDuyet
{
    ChoDuyet = 1, // Chưa duyệt
    DaDuyet = 2, // Đã duyệt
    TuChoi = 3 // Từ chối
}

export interface IKeHoach {
    id: string;
    ten: string;
    ghiChu?: string | null;
    dinhKem?: string | null;
    phanLoai?: LoaiBangChiPhi | null;
    trangThai?: TrangThaiDuyet | null;
    lyDoTuChoi?: string | null;
    thoiGianThucHien?: string | null;
    nhuCauKinhPhi?: number | null;
    duToanDuocDuyet?: number | null;
    annualCapitalPlanId?: string | null;
    loaiNhiemVuId?: string | null;
    nguonNhiemVuId?: string | null;
    chiTietDuToans?: IChiTietDuToan[] | null;
    donViId?: string | null;
    donVi?: DefaultOptionType | null;
    readOnly?: boolean;
}

export interface IChiTietDuToan {
    id?: string;
    keHoachId?: string | null;
    keHoach?: DefaultOptionType | null;
    keHoachTen?: string | null;
    danhMucChiPhiId?: string | null;
    danhMucChiPhi?: DefaultOptionType | null;
    danhMucChiPhiTen?: string | null;
    stt?: string | null;
    ten?: string | null;
    kyHieu?: string | null;
    dinhMuc?: number | null;
    giaTriTinhDinhMuc?: number | null;
    chiPhiTruocThue?: number | null;
    chiPhiSauThue?: number | null;
    cachTinhGiaTri?: string | null;
    readOnly?: boolean;
}