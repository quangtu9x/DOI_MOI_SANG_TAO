import React from 'react';
import { Select } from 'antd';
import type { INewsFeedV2Filters } from '../types';

const { Option } = Select;

interface ILinhVucOption { id: string; ten: string; }
interface IDonViOption   { id: string; name: string; }

interface Props {
  linhVucOptions: ILinhVucOption[];
  donViOptions:   IDonViOption[];
  filters:        INewsFeedV2Filters;
  onChange:       (f: INewsFeedV2Filters) => void;
  loading?:       boolean;
}

export const NewsFeedFilters: React.FC<Props> = ({
  linhVucOptions, donViOptions, filters, onChange, loading = false,
}) => (
  <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
    <span className="text-muted fs-7 fw-semibold">Lọc theo:</span>

    <Select
      allowClear
      showSearch
      placeholder="Tất cả đơn vị"
      style={{ width: 220 }}
      optionFilterProp="children"
      disabled={loading}
      value={filters.donViId ?? undefined}
      onChange={v => onChange({ ...filters, donViId: v ?? undefined })}
    >
      {donViOptions.map(dv => <Option key={dv.id} value={dv.id}>{dv.name}</Option>)}
    </Select>

    <Select
      allowClear
      showSearch
      placeholder="Tất cả lĩnh vực"
      style={{ width: 220 }}
      optionFilterProp="children"
      disabled={loading}
      value={filters.linhVucKHCNId ?? undefined}
      onChange={v => onChange({ ...filters, linhVucKHCNId: v ?? undefined })}
    >
      {linhVucOptions.map(lv => <Option key={lv.id} value={lv.id}>{lv.ten}</Option>)}
    </Select>
  </div>
);
