import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';

import { AppDispatch, RootState } from '@/redux/Store';
import * as actionsOrganizationUnit from '@/redux/organization-unit/Actions';
import { OrganizationUnitType } from '@/models';

import { Content } from '@/_metronic/layout/components/content';
import { UserTable } from './components/UserTable';
import { StatisticsTable } from './components/StatisticsTable';
import OrganizationUnitTree from './components/OrganizationUnitTree';

export const OrganizationUnitPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const [resetting, setResetting] = useState<boolean>(true);
  const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);

  useEffect(() => {
    dispatch(actionsOrganizationUnit.resetData());
    setResetting(false);
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hàm để xác định component nào sẽ được hiển thị
  const renderRightPanel = () => {
    console.log('Current Organization Unit:', currentOrganizationUnit);
    if (!currentOrganizationUnit) {
      return (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-muted">Vui lòng chọn một đơn vị để xem thông tin</div>
        </div>
      );
    }

    // Nếu là Team thì hiển thị bảng thống kê
    if (currentOrganizationUnit.organizationUnitType === OrganizationUnitType.team) {
      return <StatisticsTable />;
    }

    // Mặc định hiển thị bảng danh sách user
    return <UserTable />;
  };

  return (
    <Content>
      <Spin spinning={resetting}>
        {!resetting && (
          <div className="row">
            <div className="col-xl-4" style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
              <div className="card card-xl-stretch mb-xl-9" >
                <OrganizationUnitTree />

              </div>
            </div>
            <div className="col-xl-8">
              <div className="p-3 card card-xl-stretch mb-xl-9" style={{ minHeight: 'calc(100vh - 80px)' }}>
                {renderRightPanel()}
              </div>
            </div>

          </div>
        )}
      </Spin>
    </Content>

  );
};

