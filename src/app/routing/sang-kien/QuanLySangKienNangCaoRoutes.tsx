import { FC } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QuanLySangKienNangCaoPage } from '@/app/pages/sang-kien/quan-ly-sang-kien-nang-cao';

export const QuanLySangKienNangCaoRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<QuanLySangKienNangCaoPage />} />
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>
    </Routes>
  );
};
