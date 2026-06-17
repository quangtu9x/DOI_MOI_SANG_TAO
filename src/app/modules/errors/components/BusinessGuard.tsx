import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/modules/auth';
import { useAppDispatch, useAppSelector } from '@/redux/Hook';
import { fetchBusinessById } from '@/redux/business-filter/Actions';
import { UserType } from '@/models';

interface BusinessGuardProps {
    children: React.ReactNode;
}

export const BusinessGuard: React.FC<BusinessGuardProps> = ({ children }) => {
    const { currentUser } = useAuth();
    const dispatch = useAppDispatch();
    const { currentBusiness, isLoading, error } = useAppSelector(state => state.business);
    const [isChecking, setIsChecking] = useState(true);

    // TK admin hoặc chuyên viên thì không cần map chuyen gia
    const isAdmin = currentUser?.type === UserType.Admin || currentUser?.type === UserType.Basic;
    const shouldCheckBusiness = !isAdmin && (
        currentUser?.type === UserType.Specialist
    );

    useEffect(() => {
        const checkBusiness = async () => {
            // Admin không cần kiểm tra
            if (isAdmin) {
                setIsChecking(false);
                return;
            }

            // Kiểm tra businessId
            if (!currentUser?.chuyenGiaId) {
                setIsChecking(false);
                return;
            }

            // Nếu đã có business trong Redux và match với businessId → OK
            if (currentBusiness && currentBusiness.id === currentUser.chuyenGiaId) {
                setIsChecking(false);
                return;
            }

            // Fetch business
            try {
                const result = await dispatch(fetchBusinessById(currentUser.chuyenGiaId));
                if (!result) {
                    console.error('Business not found or fetch failed');
                }
            } catch (err) {
                console.error('Error in BusinessGuard:', err);
            } finally {
                setIsChecking(false);
            }
        };

        checkBusiness();
    }, [currentUser?.chuyenGiaId, currentUser?.type, dispatch, isAdmin, currentBusiness]);

    // Loading state
    if (isChecking || isLoading) {
        return (
            <div className="d-flex flex-column flex-root min-vh-100">
                <div className="d-flex flex-column flex-center flex-column-fluid">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-5" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h3 className="text-gray-700 fw-bold mb-3">Đang tải thông tin...</h3>
                        <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                </div>
            </div>
        );
    }

    // Admin → cho phép truy cập
    if (isAdmin) {
        return <>{children}</>;
    }

    // Business/Employee nhưng không có businessId
    if (shouldCheckBusiness && !currentUser?.chuyenGiaId) {
        return <Navigate to="/error/business-not-found" replace />;
    }

    // Có businessId nhưng không fetch được business
    if (shouldCheckBusiness && currentUser?.chuyenGiaId && !currentBusiness) {
        return <Navigate to="/error/business-not-found" replace />;
    }

    // Error khi fetch
    if (shouldCheckBusiness && error) {
        return <Navigate to="/error/business-not-found" replace />;
    }

    // Tất cả OK → cho phép truy cập
    return <>{children}</>;
};