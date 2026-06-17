/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _, { set } from 'lodash';
import { MenuProps, Modal, Spin, Table } from 'antd';
import { toast } from 'react-toastify';

import { Tree } from 'antd';
import { Dropdown, Menu } from 'antd';
import { DataNode } from 'antd/es/tree';
import { AppDispatch } from '@/redux/Store';
import { RootState } from '@/redux/RootReducer';
import { requestDELETE, requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IResult } from '@/models';
import { IOrganizationUnit } from '@/models';

import * as actionsOrganizationUnit from '@/redux/organization-unit/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { OrganizationUnitDetailModal } from './OrganizationUnitDetailModal';

interface TreeNode extends DataNode {
  id: string | number;
  name: string;
  children?: TreeNode[];
}

export const OrganizationUnitTree = () => {
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);
  const modalState = useSelector((state: RootState) => state.organizationUnit.modalState);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedKey, setSelectedKey] = useState<React.Key | string | number>('');
  const [rawData, setRawData] = useState<IOrganizationUnit[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);

  const buildTreeData = useCallback((items: IOrganizationUnit[], parentId: string | number | null = null): TreeNode[] => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => {
        const menuItems: MenuProps['items'] = [
          { label: 'Thêm đơn vị con', key: 'createChild' },
          { label: 'Sửa đơn vị', key: 'edit' },
          { label: 'Xoá đơn vị', key: 'delete' },
        ];

        const handleMenuClick = ({ key }: { key: string }) => {
          switch (key) {
            case 'edit':
              dispatch(actionsOrganizationUnit.setModalVisible({ modalVisible: true, type: 'edit', modalData: item }));
              break;
            case 'createChild':
              dispatch(actionsOrganizationUnit.setModalVisible({ modalVisible: true, type: 'createChild', modalData: item }));
              break;
            case 'delete':
              handleDeleteGroup(item.id);
              break;
          }
        };

        const children = buildTreeData(items, item.id);
        const childCount = items.filter(i => i.parentId === item.id).length;
        const hasChildren = childCount > 0;

        return {
          ...item,
          id: item.id || Math.random().toString(32),
          name: item.name || '',
          key: item.id || Math.random().toString(32),
          icon: <i className="fa-regular fa-folder-open fw-light" />,
          title: (
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['contextMenu']}>
              <div className="site-dropdown-context-menu d-flex align-items-center">
                <span>{item.name}</span>
                {/* {childCount > 0 && (
                  <span className="ms-2 badge badge-light-primary badge-sm">{childCount}</span>
                )} */}
              </div>
            </Dropdown>
          ),
          children,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, random]);

  const handleDeleteGroup = useCallback(async (idDelete: string | number): Promise<void> => {
    Modal.confirm({
      title: 'Xoá nhóm',
      content: 'Bạn có chắc chắn muốn xoá nhóm này?',
      okText: 'Đồng ý',
      cancelText: 'Huỷ',
      onOk: async () => {
        try {
          const response = await requestDELETE<IResult<string>>(`organizationunits/${idDelete}`);
          if (response.data?.succeeded) {
            toast.success('Xóa nhóm thành công!');
            dispatch(actionsOrganizationUnit.resetData());
            dispatch(actionsGlobal.setRandom());
          } else {
            toast.error(response?.data?.exception || 'Xóa nhóm thất bại!');
          }
        } catch (error) {
          console.error('Delete group error:', error);
          toast.error('Có lỗi xảy ra khi xóa nhóm!');
        }
      },
    });
  }, []);

  const handleOrganizationUnitButton = async (type: { key: string }) => {
    switch (type.key) {
      case "add-organization-unit":
        dispatch(actionsOrganizationUnit.setModalVisible({ modalVisible: true, type: 'createChild', modalData: null }));
        break;
      case "sync-organization-unit":

        break;
      default:
        break;
    }
  };

  const fetchOrganizationUnits = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await requestPOST<IPaginationResponse<IOrganizationUnit[]>>('organizationunits/search', {
        advancedSearch: {
          fields: ['name', 'code'],
          keyword: null,
        },
        allowParentCodeNull: null,
        allowParentIdNull: null,
        pageNumber: 1,
        pageSize: 100000,
        orderBy: ['sortOrder'],
      });

      if (response?.data?.data) {
        setTotalCount(response?.data?.totalCount)
        setRawData(response.data.data); // Lưu dữ liệu gốc
        const treeNodes = buildTreeData(response.data.data);
        setTreeData(treeNodes);

        // Tự động mở cấp đầu tiên (các node gốc)
        const rootKeys = response.data.data
          .filter(item => item.parentId === null)
          .map(item => item.id);
        setExpandedKeys(rootKeys);

        if (!currentOrganizationUnit && response?.data?.data?.length > 0) {
          const firstKey = response?.data?.data[0]?.id;
          setSelectedKey(firstKey ?? "");
          dispatch(actionsOrganizationUnit.setSelectedOrganizationUnit(response?.data?.data[0]));
        }
      }
    } catch (error) {
      console.error('Fetch organization units error:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, [buildTreeData, dispatch, random]);

  useEffect(() => {
    fetchOrganizationUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [random]);


  const handleSelect = useCallback((
    selectedKeys: React.Key[],
    info: { node: TreeNode; selected: boolean }
  ) => {
    try {
      if (!info.selected) return;
      const newKey = selectedKeys[0];
      if (newKey !== selectedKey) {
        setSelectedKey(newKey);

        const foundUnit = rawData.find(item => item.id === info.node.id);

        if (foundUnit) {
          dispatch(actionsOrganizationUnit.setSelectedOrganizationUnit(foundUnit));
        } else {
          console.warn('Không tìm thấy unit trong rawData với id:', info.node.id);
          const unit: IOrganizationUnit = {
            id: (info.node.id ?? '') as string,
            name: info.node.name || '',
            parentId: (info.node as any).parentId || null,
            code: (info.node as any).code || null,
            fullCode: (info.node as any).fullCode || null,
            organizationUnitType: (info.node as any).organizationUnitType || null,
            description: (info.node as any).description || null,
            sortOrder: (info.node as any).sortOrder || null,
            isActive: (info.node as any).isActive || null
          };
          dispatch(actionsOrganizationUnit.setSelectedOrganizationUnit(unit));
        }
      }
    }
    catch (error) {
      console.error('Handle select error:', error);
    }

  }, [dispatch, selectedKey, rawData]);

  const handleExpand = useCallback((expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  }, []);

  return (
    <>
      <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
        <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
          Cơ cấu tổ chức
        </h3>
        <div className="d-flex align-items-center">
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "add-organization-unit",
                  disabled: false,
                  label: (
                    <a className="e-1 p-2 text-dark">
                      <i className={`fas fa-plus me-2`}></i>
                      {`Thêm mới`}
                    </a>
                  ),
                },
                {
                  key: "sync-organization-unit",
                  disabled: false,
                  label: (
                    <a className="e-1 p-2 text-dark">
                      <i className={`fa fa-sync me-2`}></i>
                      {`Đồng bộ cơ cấu tổ chức`}
                    </a>
                  ),
                },
              ],
              onClick: handleOrganizationUnitButton,
            }}
          >
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              title="Thao tác nhanh"
            >
              <i className="fa fa-ellipsis-h"></i>
            </a>
          </Dropdown>
        </div>
      </div>
      <Spin spinning={loading}>
        {!loading &&
          <div className="card-body card-dashboard px-3 py-3">
            <div className="card-dashboard-body">
              <style>{`
                .org-unit-tree .ant-tree-treenode {
                  display: flex;
                  align-items: center;
                }
                .org-unit-tree .ant-tree-node-content-wrapper {
                  display: inline-flex;
                  align-items: center;
                }
                .org-unit-tree .ant-tree-iconEle {
                  display: inline-flex;
                  align-items: center;
                  margin-right: 4px;
                }
              `}</style>
              <Tree
                className="org-unit-tree"
                selectedKeys={[selectedKey]}
                expandedKeys={expandedKeys}
                onSelect={handleSelect}
                onExpand={handleExpand}
                treeData={treeData}
                showLine={{ showLeafIcon: false }}
                showIcon
                blockNode />
            </div>
          </div>}
      </Spin>

      {modalState?.modalVisible ? <OrganizationUnitDetailModal totalCount={totalCount} /> : <></>}
    </>
  );
};

export default OrganizationUnitTree;
