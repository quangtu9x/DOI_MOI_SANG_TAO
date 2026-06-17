import { useEffect, useState } from 'react';

import { TDSelect } from '@/app/components';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IUserDetails } from '@/models';
import { useAuth } from '../modules/auth';

type TDSelectProps = React.ComponentProps<typeof TDSelect>;

export interface UserSelectProps extends Omit<TDSelectProps, 'fetchOptions'> {
    /** Tự động set giá trị mặc định là user hiện tại */
    useCurrentUserDefault?: boolean;
    /** ID của user để fetch và hiển thị (dùng khi edit, server chỉ trả về ID) */
    initialUserId?: string | null;
    /** Custom fetch function nếu muốn override logic mặc định */
    fetchUsers?: (keyword: string) => Promise<any[]>;
    /** Callback khi userId thay đổi */
    onUserIdChange?: (userId: string | null) => void;
    /** Callback khi giá trị mặc định được khởi tạo (dùng để set vào Form) */
    onDefaultValueSet?: (value: { label: string; value: string }, userId: string) => void;
}

export const UserSelect = ({
    useCurrentUserDefault = false,
    initialUserId,
    fetchUsers,
    onUserIdChange,
    onDefaultValueSet,
    onChange,
    ...restProps
}: UserSelectProps) => {
    const { currentUser } = useAuth();
    const [defaultValue, setDefaultValue] = useState<{ label: string; value: string } | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch user info khi có initialUserId (dùng cho trường hợp edit)
    useEffect(() => {
        const fetchUserById = async () => {
            if (initialUserId && !initialized) {
                try {
                    setLoading(true);
                    const res = await requestGET<IUserDetails>(`users/${initialUserId}`, 'neutral');
                    const userData = res?.data;
                    if (userData) {
                        const val = {
                            label: userData.fullName ?? '',
                            value: userData.id ?? '',
                        };
                        setDefaultValue(val);
                        setInitialized(true);
                        if (onDefaultValueSet && userData.id) {
                            onDefaultValueSet(val, userData.id);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user by id:', error);
                    setInitialized(true);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserById();
    }, [initialUserId, initialized, onDefaultValueSet]);

    // Set current user as default (dùng cho trường hợp tạo mới)
    useEffect(() => {
        if (useCurrentUserDefault && currentUser && !initialized && !initialUserId) {
            const defaultVal = {
                label: currentUser.fullName ?? '',
                value: currentUser.id ?? '',
            };
            setDefaultValue(defaultVal);
            setInitialized(true);

            // Gọi callback để parent có thể set giá trị vào Form
            if (onDefaultValueSet && currentUser.id) {
                onDefaultValueSet(defaultVal, currentUser.id);
            }
        }
    }, [useCurrentUserDefault, currentUser, initialized, onDefaultValueSet, initialUserId]);

    const handleFetchOptions = async (keyword: string | null) => {
        if (fetchUsers) {
            return fetchUsers(keyword ?? '');
        }

        const res = await requestPOST<IPaginationResponse<IUserDetails[]>>(`users/search`, {
            pageNumber: 1,
            pageSize: 1000,
            keyword: keyword,
        }, 'neutral');

        return (
            res.data?.data?.map(item => ({
                ...item,
                label: item?.fullName,
                value: item?.id,
            })) ?? []
        );
    };

    const handleChange = (value: any, option: any) => {
        if (onUserIdChange) {
            onUserIdChange(value ? option?.id : null);
        }
        if (onChange) {
            onChange(value, option);
        }
    };

    // Nếu đang chờ khởi tạo default value
    if ((useCurrentUserDefault || initialUserId) && !initialized) {
        return (
            <TDSelect
                notFoundContent="Không tìm thấy dữ liệu"
                showSearch
                placeholder="Chọn"
                loading={loading || true}
                disabled
                fetchOptions={handleFetchOptions}
                {...restProps}
            />
        );
    }

    return (
        <TDSelect
            notFoundContent="Không tìm thấy dữ liệu"
            reload
            showSearch
            placeholder="Chọn"
            fetchOptions={handleFetchOptions}
            onChange={handleChange}
            defaultValue={defaultValue}
            {...restProps}
        />
    );
};

export default UserSelect;
