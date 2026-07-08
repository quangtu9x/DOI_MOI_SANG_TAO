import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Tag, Input, Button, Modal, Spin, Avatar, message, Tooltip, Checkbox, Switch, Empty } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import type { IUserDto } from '@/models';
import { IPaginationResponse } from '@/models';
import { OrganizationUnitTreeSelect } from '@/app/components/OrganizationUnitTreeSelect';

const PAGE_SIZE = 15;

interface IRole {
  id: string;
  name: string;
  description?: string | null;
}

// Nhãn tiếng Việt cho các vai trò hệ thống
const ROLE_LABEL: Record<string, string> = {
  Admin: 'Quản trị hệ thống',
  Basic: 'CBNV',
  Specialist: 'Người kiểm duyệt / Chuyên gia',
  LanhDaoDonVi: 'Lãnh đạo đơn vị',
  LanhDaoTCT: 'Lãnh đạo TCT',
};
const ROLE_COLOR: Record<string, string> = {
  Admin: 'red',
  Basic: 'default',
  Specialist: 'blue',
  LanhDaoDonVi: 'cyan',
  LanhDaoTCT: 'purple',
};
const roleLabel = (r: IRole) => ROLE_LABEL[r.name] ?? r.description ?? r.name;

const AVATAR_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2'];
const getAvatarColor = (name: string) => AVATAR_COLORS[(name ?? '?').charCodeAt(0) % AVATAR_COLORS.length];

export const QuanLyNguoiDungPage: React.FC = () => {
  // ── Danh sách người dùng (API thật — đơn vị lấy từ cây tổ chức)
  const [loading, setLoading]       = useState(false);
  const [users, setUsers]           = useState<IUserDto[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [keyword, setKeyword]       = useState('');
  const [donViId, setDonViId]       = useState<string | undefined>(undefined);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Vai trò
  const [allRoles, setAllRoles]     = useState<IRole[]>([]);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, string[]>>({}); // userId → roleIds

  // ── Modal chỉnh sửa vai trò
  const [editUser, setEditUser]     = useState<IUserDto | null>(null);
  const [editOpen, setEditOpen]     = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);
  const [saving, setSaving]         = useState(false);

  // ── Load danh sách vai trò hệ thống (1 lần)
  useEffect(() => {
    requestPOST<IPaginationResponse<IRole[]>>('Roles/search', {}, 'neutral')
      .then(res => setAllRoles(res.data?.data ?? []))
      .catch(() => { /* ignore */ });
  }, []);

  // ── Load người dùng + vai trò từng người
  const loadUsers = useCallback(async (kw = keyword, p = page, orgId = donViId) => {
    setLoading(true);
    try {
      const res = await requestPOST<IPaginationResponse<IUserDto[]>>('users/search', {
        pageNumber: p,
        pageSize: PAGE_SIZE,
        keyword: kw?.trim() || undefined,
        organizationUnitId: orgId || undefined,
      }, 'neutral');

      const list = res.data?.data ?? [];
      setUsers(list);
      setTotal(res.data?.totalCount ?? 0);

      // Nạp vai trò của từng người dùng trên trang hiện tại
      const results = await Promise.allSettled(
        list.map(u => requestGET<string[]>(`users/${u.id}/roles`, 'neutral')),
      );
      const map: Record<string, string[]> = {};
      list.forEach((u, i) => {
        const r = results[i];
        map[u.id] = r.status === 'fulfilled' ? ((r.value as any)?.data ?? []) : [];
      });
      setUserRolesMap(map);
    } catch {
      message.error('Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [keyword, page, donViId]);

  useEffect(() => { loadUsers(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onSearch = (kw: string) => { setKeyword(kw); setPage(1); loadUsers(kw, 1); };

  /** Gõ đến đâu tìm đến đó (debounce 500ms) — không cần bấm Enter */
  const onKeywordChange = (val: string) => {
    setKeyword(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); loadUsers(val, 1); }, 500);
  };

  const onDonViChange = (val?: string) => {
    setDonViId(val);
    setPage(1);
    loadUsers(keyword, 1, val);
  };

  const onPageChange = (p: number) => { setPage(p); loadUsers(keyword, p); };

  // ── Bật / tắt tài khoản
  const toggleStatus = async (u: IUserDto) => {
    try {
      await requestPOST(`users/${u.id}/toggle-status`, { userId: u.id, activateUser: !u.isActive }, 'neutral');
      message.success(!u.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản');
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !u.isActive } : x));
    } catch {
      message.error('Không đổi được trạng thái');
    }
  };

  // ── Chỉnh sửa vai trò
  const openEdit = async (u: IUserDto) => {
    setEditUser(u);
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await requestGET<string[]>(`users/${u.id}/roles`, 'neutral');
      setEditRoleIds(((res as any)?.data ?? []) as string[]);
    } catch {
      setEditRoleIds(userRolesMap[u.id] ?? []);
    } finally {
      setEditLoading(false);
    }
  };

  const saveRoles = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const userRoles = allRoles.map(r => ({
        roleId: r.id,
        roleName: r.name,
        description: r.description,
        enabled: editRoleIds.includes(r.id),
      }));
      const res = await requestPOST(`users/${editUser.id}/roles`, { userRoles }, 'neutral');
      if ((res as any)?.status >= 400) { message.error('Không lưu được vai trò'); return; }
      message.success('Đã cập nhật vai trò');
      setUserRolesMap(prev => ({ ...prev, [editUser.id]: editRoleIds }));
      setEditOpen(false);
    } catch {
      message.error('Lỗi khi lưu vai trò');
    } finally {
      setSaving(false);
    }
  };

  // ── Render vai trò của một user
  const renderRoles = (userId: string) => {
    const ids = userRolesMap[userId] ?? [];
    if (ids.length === 0) return <span className="text-muted fs-8">—</span>;
    return (
      <div className="d-flex flex-wrap gap-1">
        {ids.map(rid => {
          const role = allRoles.find(r => r.id === rid);
          if (!role) return null;
          return (
            <Tag key={rid} color={ROLE_COLOR[role.name] ?? 'default'} style={{ margin: 0 }}>
              {roleLabel(role)}
            </Tag>
          );
        })}
      </div>
    );
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_: unknown, u: IUserDto) => (
        <div className="d-flex align-items-center gap-3">
          <Avatar size={38} src={u.imageUrl || undefined}
            style={{ backgroundColor: getAvatarColor(u.fullName ?? u.userName), fontWeight: 600 }}>
            {(u.fullName ?? u.userName).charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div className="fw-semibold text-gray-800">{u.fullName ?? u.userName}</div>
            <div className="text-muted fs-8">{u.email ?? u.userName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'organizationUnitName',
      key: 'organizationUnitName',
      width: 220,
      render: (v: string | null) => v
        ? <span className="fs-7">{v}</span>
        : <span className="text-muted fs-8">Chưa gán đơn vị</span>,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 160,
      render: (v: string | null) => v ?? <span className="text-muted fs-8">—</span>,
    },
    {
      title: 'Vai trò',
      key: 'roles',
      width: 260,
      render: (_: unknown, u: IUserDto) => renderRoles(u.id),
    },
    {
      title: 'Hoạt động',
      key: 'isActive',
      width: 100,
      className: 'text-center',
      render: (_: unknown, u: IUserDto) => (
        <Switch size="small" checked={u.isActive} onChange={() => toggleStatus(u)} />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      className: 'text-center',
      render: (_: unknown, u: IUserDto) => (
        <Tooltip title="Chỉnh sửa vai trò">
          <Button size="small" icon={<i className="fa-regular fa-user-gear" />} onClick={() => openEdit(u)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
      ]}>Quản lý người dùng</PageTitle>

      <Content>
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 className="card-title fw-bold text-gray-800 mb-1">
                Người dùng hệ thống <Tag color="blue" className="ms-2">{total}</Tag>
              </h3>
              <span className="text-muted fs-8">
                Dữ liệu thật từ hệ thống — đơn vị khớp với cây Cơ cấu tổ chức
              </span>
            </div>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <div style={{ width: 260 }}>
                <OrganizationUnitTreeSelect
                  placeholder="Lọc theo đơn vị"
                  value={donViId}
                  showSearch
                  treeNodeFilterProp="title"
                  onChange={(val: any) => onDonViChange(val ?? undefined)}
                  style={{ width: '100%' }}
                />
              </div>
              <Input.Search
                placeholder="Tìm theo tên, email, tài khoản..."
                value={keyword}
                onChange={e => onKeywordChange(e.target.value)}
                onSearch={onSearch}
                style={{ width: 280 }}
                allowClear
              />
              <Tooltip title="Làm mới">
                <Button icon={<i className="fa-regular fa-refresh" />} onClick={() => loadUsers()} />
              </Tooltip>
            </div>
          </div>
          <div className="card-body py-3">
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                total,
                onChange: onPageChange,
                showSizeChanger: false,
              }}
              locale={{ emptyText: <Empty description="Không có người dùng" /> }}
              size="middle"
            />
          </div>
        </div>
      </Content>

      {/* ── Modal chỉnh sửa vai trò ─────────────────────────────────────────── */}
      <Modal
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={saveRoles}
        okText="Lưu vai trò"
        cancelText="Đóng"
        confirmLoading={saving}
        title={
          editUser && (
            <div className="d-flex align-items-center gap-3">
              <Avatar size={40} src={editUser.imageUrl || undefined}
                style={{ backgroundColor: getAvatarColor(editUser.fullName ?? editUser.userName), fontWeight: 600 }}>
                {(editUser.fullName ?? editUser.userName).charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <div className="fw-bold">{editUser.fullName ?? editUser.userName}</div>
                <div className="text-muted fs-8">
                  {editUser.organizationUnitName ?? 'Chưa gán đơn vị'}
                  {editUser.positionName ? ` · ${editUser.positionName}` : ''}
                </div>
              </div>
            </div>
          )
        }
      >
        <Spin spinning={editLoading}>
          <div className="text-muted fs-8 mb-3">
            Chọn vai trò trong hệ thống ĐMST (một người có thể giữ nhiều vai trò):
          </div>
          <div className="d-flex flex-column gap-2">
            {allRoles.map(r => (
              <label key={r.id}
                className="d-flex align-items-center gap-3 p-3 rounded border cursor-pointer"
                style={{
                  borderColor: editRoleIds.includes(r.id) ? '#1677ff' : '#e5e7eb',
                  background: editRoleIds.includes(r.id) ? '#f0f7ff' : '#fff',
                  transition: 'all 0.15s',
                }}>
                <Checkbox
                  checked={editRoleIds.includes(r.id)}
                  onChange={e => setEditRoleIds(prev =>
                    e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id))}
                />
                <div className="flex-grow-1">
                  <Tag color={ROLE_COLOR[r.name] ?? 'default'} style={{ margin: 0 }}>{roleLabel(r)}</Tag>
                  {r.description && <div className="text-muted fs-8 mt-1">{r.description}</div>}
                </div>
              </label>
            ))}
            {allRoles.length === 0 && !editLoading && (
              <Empty description="Không tải được danh sách vai trò" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </Spin>
      </Modal>
    </>
  );
};
