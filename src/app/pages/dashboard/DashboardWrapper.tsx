import { FC } from 'react';
import { Navigate } from 'react-router-dom';

// Dashboard chuyển hướng sang Innovation Portal dashboard
const DashboardWrapper: FC = () => {
  return <Navigate to="/doi-moi-sang-tao/dashboard" replace />;
};

export { DashboardWrapper };
