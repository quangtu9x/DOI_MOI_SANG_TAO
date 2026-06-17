import { FC } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QuanLyYTuongPage } from '@/app/pages/y-tuong/quan-ly-y-tuong';

export const QuanLyYTuongRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<QuanLyYTuongPage />} />
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>
    </Routes>
  );
};
