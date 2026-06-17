import { FC } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QuanLyGiaiPhapPage } from '@/app/pages/sang-kien/giai-phap';

export const QuanLyGiaiPhapRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<QuanLyGiaiPhapPage />} />
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>
    </Routes>
  );
};
