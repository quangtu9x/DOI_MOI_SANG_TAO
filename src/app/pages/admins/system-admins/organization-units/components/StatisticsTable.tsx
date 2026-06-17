import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spin, Card, Row, Col, Statistic } from 'antd';
import { RootState } from '@/redux/Store';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse } from '@/models';

interface IStatistics {
    totalBusinesses: number;
    totalAccounts: number;
    activeAccounts: number;
    inactiveAccounts: number;
}

export const StatisticsTable = () => {
    const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);
    const random = useSelector((state: RootState) => state.global.random);
    const [loading, setLoading] = useState<boolean>(false);
    const [statistics, setStatistics] = useState<IStatistics>({
        totalBusinesses: 0,
        totalAccounts: 0,
        activeAccounts: 0,
        inactiveAccounts: 0,
    });

    const fetchStatistics = async () => {
        if (!currentOrganizationUnit?.id) return;

        try {
            setLoading(true);

            // Lấy thống kê doanh nghiệp
            const businessResponse = await requestPOST<IPaginationResponse<any[]>>('organizationunits/search', {
                parentId: currentOrganizationUnit.id,
            });

            // Lấy thống kê tài khoản
            const accountResponse = await requestPOST<IPaginationResponse<any[]>>('users/search', {
                organizationUnitId: currentOrganizationUnit.id,
                organizationUnitType: currentOrganizationUnit.organizationUnitType,
            }, 'neutral');

            const accounts = accountResponse?.data?.data || [];
            const activeAccounts = accounts.filter(account => account.isActive).length;
            const inactiveAccounts = accounts.filter(account => !account.isActive).length;

            setStatistics({
                totalBusinesses: businessResponse?.data?.totalCount || 0,
                totalAccounts: accountResponse?.data?.totalCount || 0,
                activeAccounts,
                inactiveAccounts,
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [currentOrganizationUnit?.id, random]);

    return (
        <>
            <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
                <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
                    Thống kê đơn vị: {currentOrganizationUnit?.name}
                </h3>
            </div>

            <Spin spinning={loading}>
                <div className="p-4">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tổng số doanh nghiệp"
                                    value={statistics.totalBusinesses}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<i className="fa fa-building" />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tổng số tài khoản"
                                    value={statistics.totalAccounts}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix={<i className="fa fa-users" />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tài khoản đang hoạt động"
                                    value={statistics.activeAccounts}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<i className="fa fa-user-check" />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Tài khoản chưa kích hoạt"
                                    value={statistics.inactiveAccounts}
                                    valueStyle={{ color: '#f5222d' }}
                                    prefix={<i className="fa fa-user-times" />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Có thể thêm biểu đồ hoặc thống kê chi tiết khác ở đây */}
                    <div className="mt-4">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card title="Phân bố tài khoản" className="h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Đang hoạt động</span>
                                        <span className="fw-bold text-success">{statistics.activeAccounts}</span>
                                    </div>
                                    <div className="progress mb-3">
                                        <div
                                            className="progress-bar bg-success"
                                            style={{
                                                width: `${statistics.totalAccounts > 0 ? (statistics.activeAccounts / statistics.totalAccounts) * 100 : 0}%`
                                            }}
                                        ></div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Chưa kích hoạt</span>
                                        <span className="fw-bold text-danger">{statistics.inactiveAccounts}</span>
                                    </div>
                                    <div className="progress">
                                        <div
                                            className="progress-bar bg-danger"
                                            style={{
                                                width: `${statistics.totalAccounts > 0 ? (statistics.inactiveAccounts / statistics.totalAccounts) * 100 : 0}%`
                                            }}
                                        ></div>
                                    </div>
                                </Card>
                            </Col>

                            <Col xs={24} md={12}>
                                <Card title="Tỷ lệ hoạt động" className="h-100">
                                    <div className="text-center">
                                        <div className="fs-1 fw-bold text-primary mb-2">
                                            {statistics.totalAccounts > 0
                                                ? Math.round((statistics.activeAccounts / statistics.totalAccounts) * 100)
                                                : 0
                                            }%
                                        </div>
                                        <div className="text-muted">
                                            Tỷ lệ tài khoản đang hoạt động
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Spin>
        </>
    );
};