import { useState, useEffect, useMemo } from 'react';
import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';

import { requestPOST } from '@/utils/baseAPI';
import { IOrganizationUnit, IPaginationResponse } from '@/models';
import { useAuth } from '../modules/auth';

type OrganizationUnitNode = IOrganizationUnit & { parentCode?: string | null };

interface TreeNode {
    title: string;
    value: string;
    key: string;
    children?: TreeNode[];
}

export interface OrganizationUnitTreeSelectByCodeProps extends Omit<TreeSelectProps, 'treeData' | 'loading'> {
    fetchOrganizationUnits?: () => Promise<OrganizationUnitNode[]>;
    /** Tự động set giá trị mặc định là đơn vị của user hiện tại */
    useCurrentUserDefault?: boolean;
}

export const OrganizationUnitTreeSelectByCode = ({
    fetchOrganizationUnits,
    useCurrentUserDefault = true,
    ...restProps
}: OrganizationUnitTreeSelectByCodeProps) => {
    const [organizationUnits, setOrganizationUnits] = useState<OrganizationUnitNode[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { currentUser } = useAuth();
    const userOrganizationUnitCode = currentUser?.organizationUnitCode;

    // Tính toán defaultValue dựa trên prop useCurrentUserDefault
    const computedDefaultValue = useCurrentUserDefault ? userOrganizationUnitCode : restProps.defaultValue;

    const treeData = useMemo<TreeNode[]>(() => {
        if (organizationUnits.length === 0) {
            return [];
        }

        const childrenMap = organizationUnits.reduce<Record<string, OrganizationUnitNode[]>>((acc, unit) => {
            const parentKey = String(unit.parentId ?? '__root__');
            if (!acc[parentKey]) {
                acc[parentKey] = [];
            }
            acc[parentKey].push(unit);
            return acc;
        }, {});

        const buildTreeNode = (parentId: string | number | null = null): TreeNode[] => {
            const parentKey = String(parentId ?? '__root__');
            const children = childrenMap[parentKey] || [];

            return children.map(item => ({
                title: item.name ?? '',
                value: item.code ?? '',
                key: item.code ?? '',
                children: buildTreeNode(item.id),
            }));
        };

        return buildTreeNode(null);
    }, [organizationUnits]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true);

                if (fetchOrganizationUnits) {
                    const data = await fetchOrganizationUnits();
                    setOrganizationUnits(data);
                } else {
                    const response = await requestPOST<IPaginationResponse<IOrganizationUnit[]>>(
                        'organizationunits/search',
                        {
                            advancedSearch: {
                                fields: ['name', 'code'],
                                keyword: null,
                            },
                            allowParentCodeNull: null,
                            allowParentIdNull: null,
                            pageNumber: 1,
                            pageSize: 100000,
                            orderBy: ['sortOrder'],
                        }
                    );

                    if (response?.data?.data) {
                        setOrganizationUnits(response.data.data);
                    }
                }
            } catch (error) {
                console.error('Fetch organization units error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchOrganizationUnits]);

    return (
        <TreeSelect
            allowClear
            showSearch
            treeNodeFilterProp="title"
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder=" "
            loading={loading}
            treeData={treeData}
            defaultValue={computedDefaultValue}
            {...restProps}
        />
    );
};

export default OrganizationUnitTreeSelectByCode;
