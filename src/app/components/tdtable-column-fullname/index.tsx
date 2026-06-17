import React, { useEffect, useMemo } from 'react';
import { Dropdown, MenuProps } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FILE_URL } from '@/utils/baseAPI';
import { AppDispatch } from '@/redux/Store';

interface UserData {
  fullName: string;
  userName?: string | null;
  imageUrl?: string | null;
  type?: number | null;
}

interface TDTableColumnFullNameProps {
  dataUser: UserData;
  index: number;
  showMenu?: boolean;
}

const AVATAR_COLORS = ['primary', 'success', 'danger', 'warning', 'info', 'muted'] as const;
type ColorType = (typeof AVATAR_COLORS)[number];

const TDTableColumnFullName: React.FC<TDTableColumnFullNameProps> = ({ dataUser, index, showMenu = false }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { firstChar, color } = useMemo(() => {
    const nameArray = dataUser.fullName?.match(/\S+/g) || ['A'];
    const lastName = nameArray[nameArray.length - 1];
    return {
      firstChar: lastName.charAt(0),
      color: AVATAR_COLORS[index % AVATAR_COLORS.length] as ColorType,
    };
  }, [dataUser.fullName, index]);

  const menuItems: MenuProps['items'] = useMemo(() => {
    if (!showMenu) return [];

    const commonItems = [
      {
        key: 'thong-tin-tai-khoan',
        label: <span className="text-dark">Thông tin tài khoản</span>,
      },
    ];

    const specificItems =
      dataUser.type === 4
        ? [
          {
            key: 'khoa-hoc-da-ban',
            label: <span className="text-dark">Khoá học đã bán</span>,
          },
        ]
        : dataUser.type === 1
          ? [
            {
              key: 'khoa-hoc-da-ban',
              label: <span className="text-dark">Danh sách khoá học</span>,
            },
          ]
          : [];

    return [...commonItems, ...specificItems];
  }, [showMenu, dataUser.type]);

  const getImageUrl = (url: string): string => {
    if (url.includes('https://') || url.includes('http://')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${FILE_URL}${cleanUrl}`;
  };

  if (!dataUser?.fullName) {
    return null;
  }

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
      <div className="d-flex align-items-center">
        <div className="symbol symbol-circle symbol-50px overflow-hidden me-3">
          <div className="cursor-pointer">
            {dataUser.imageUrl ? (
              <div className="symbol-label">
                <img src={getImageUrl(dataUser.imageUrl)} alt={dataUser.fullName} className="w-100" />
              </div>
            ) : (
              <div className={`symbol-label fs-3 bg-light-${color} text-${color}`}>{firstChar.toUpperCase()}</div>
            )}
          </div>
        </div>

        <div className="d-flex flex-column cursor-pointer">
          <div className="text-gray-800 text-hover-primary mb-1 fw-bolder">{dataUser.fullName}</div>
          {dataUser.userName && <span>{dataUser.userName}</span>}
        </div>
      </div>
    </Dropdown>
  );
};

export default TDTableColumnFullName;
