export interface IBaseSearch {
  removed?: boolean;
  reFetch?: boolean;
}
export interface IBasePagination {
  pageNumber?: number;
  pageSize?: number;
}
export interface IBaseExt<TId = string> {
  id: TId;
  createdOn: string;
  deletedOn: string;
  deletedBy: string;
}
type KeyOfIBaseExt = keyof IBaseExt;
export type IPickSearch<TObj, TPick extends keyof TObj = never> = Partial<Pick<TObj, TPick>> & IBasePagination & IBaseSearch;
export type IOmitSearch<TObj, TOmit extends keyof TObj = never> = Partial<Omit<TObj, TOmit>>;
export type IOmitUpdate<TObj, TOmit extends keyof Omit<TObj, KeyOfIBaseExt> = never> = {
  id?: string;
  data: Partial<Omit<TObj, TOmit | KeyOfIBaseExt>>;
};

export type IOmitCreate<TObj, TOmit extends keyof Omit<TObj, KeyOfIBaseExt> = never> = Partial<Omit<TObj, TOmit | KeyOfIBaseExt>>;
