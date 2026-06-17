import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/modules/auth';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';

export const BusinessNotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/auth/login');
    };

    return (
        <>
            {/* begin::Title */}
            <h1 className="fw-bolder fs-2hx text-gray-900 mb-4">
                Tài khoản không hợp lệ!
            </h1>
            {/* end::Title */}

            {/* begin::Text */}
            <div className="fw-semibold fs-6 text-gray-500 mb-7 ">
                Tài khoản của bạn chưa được liên kết với doanh nghiệp nào trong hệ thống.
            </div>
            {/* end::Text */}

            {/* begin::Illustration */}
            <div className="mb-11">
                <img
                    src={toAbsoluteUrl('media/illustrations/sigma-1/21.png')}
                    className="mw-100 mh-300px theme-light-show"
                    alt="Business not found"
                />
                <img
                    src={toAbsoluteUrl('media/illustrations/sigma-1/21-dark.png')}
                    className="mw-100 mh-300px theme-dark-show"
                    alt="Business not found"
                />
            </div>
            {/* end::Illustration */}

            {/* begin::Contact Info */}
            <div className="mb-7">
                <div className="notice d-flex bg-light-warning rounded border-warning border border-dashed p-6">

                    <div className="d-flex flex-stack flex-grow-1">
                        <div className="fw-semibold w-100">
                            <div className="fs-6 text-gray-700">
                                Vui lòng liên hệ với quản trị viên hệ thống để được hỗ trợ.
                                <br />
                                <span className="fw-bold">Email:</span> lapphungg@gmail.com
                                <br />
                                <span className="fw-bold">Hotline:</span> 1900 xxxx
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* end::Contact Info */}

            {/* begin::Actions */}
            <div className="mb-0">
                <button
                    className="btn btn-sm btn-danger me-3"
                    onClick={handleLogout}
                >
                    <i className="ki-duotone ki-exit-left fs-3 me-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                    </i>
                    Đăng xuất
                </button>
                <button
                    className="btn btn-sm btn-light-primary"
                    onClick={() => window.location.reload()}
                >
                    <i className="ki-duotone ki-arrows-circle fs-3 me-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                    </i>
                    Thử lại
                </button>
            </div>
            {/* end::Actions */}
        </>
    );
};