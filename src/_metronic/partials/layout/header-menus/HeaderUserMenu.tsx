import { FC } from 'react';
import { useAuth } from '../../../../app/modules/auth';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Space as AntdSpace } from 'antd';
import type { MenuProps } from 'antd';
import { FILE_URL } from '@/utils/baseAPI';
import { getThumbnailUrl } from '@/utils/utils';
import { DrawerComponent } from '../../../assets/ts/components';

interface HeaderUserMenuProps {
  className?: string;
}

const HeaderUserMenu: FC<HeaderUserMenuProps> = (props) => {
  const { className } = props;
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const items: MenuProps['items'] = [
    { key: 'profile', label: 'Thông tin người dùng' },
    { key: 'help', label: 'Trợ giúp' },
    // { key: 'personalize', label: 'Cá nhân hóa' },
    // { key: 'changepass', label: 'Đổi mật khẩu' },
    { type: 'divider' },
    { key: 'logout', label: 'Thoát' },
  ];

  const handleDropdownItemClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        navigate('/userprofile');
        break;
      case 'help':
        // Mở Help Drawer sử dụng Metronic DrawerComponent
        const helpDrawer = DrawerComponent.getInstance('kt_help');
        if (helpDrawer) {
          helpDrawer.show();
        }
        break;
      case 'logout':
        logout();
        break;
    }
  };

  return (
    <div className={className}>
      <Dropdown
        menu={{ items, onClick: handleDropdownItemClick }}
        trigger={['click']}
        dropdownRender={(menu) => <div style={{ marginTop: 12 }}>{menu}</div>}
      >
        <AntdSpace
          style={{
            cursor: 'pointer',
            justifyContent: 'end',
            whiteSpace: 'nowrap',
            alignItems: 'center',
            marginLeft: '10px',
          }}
          className="user-header"
          align="end"
        >

          {currentUser?.imageUrl ? (
            <img
              src={getThumbnailUrl(currentUser?.imageUrl)}
              alt={currentUser?.fullName || 'Avatar'}
              className=" object-fit-cover rounded-circle me-2"
              style={{ width: 32, height: 32, objectFit: 'cover', border: '1px solid #fafafa' }}
            />
          ) : (
            <i className="fa-solid fa-circle-user me-2" style={{ fontSize: 28, color: '#b1b1b1' }}></i>
          )}
          <span style={{ fontSize: 15 }}>{currentUser?.fullName || currentUser?.userName || 'User'}</span>
          <i className="fa-regular fa-chevron-down ms-1"></i>
        </AntdSpace>
      </Dropdown>
    </div>
  );
};

export { HeaderUserMenu };


