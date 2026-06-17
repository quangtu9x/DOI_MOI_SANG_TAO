export interface IPaginationResponse<T> {
  data: T;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface IError {
  message: string;
}

export interface IResult<T> {
  data: T;
  failed: boolean;
  message: string | string[] | null;
  succeeded: boolean;
  exception: string | null;
}

export interface IPaginationBaoCaoResponse<T> extends IPaginationResponse<T> {
  tatCa: number;
  denHan: number;
  chuaDenHan: number;
  quaHan: number;
}
