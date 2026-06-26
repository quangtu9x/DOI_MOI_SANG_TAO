import { useState, useCallback } from 'react';

export type DMSTRole = 'admin' | 'reviewer' | 'member';

const STORAGE_KEY = 'dmst_demo_role';

export const DMST_ROLE_LABELS: Record<DMSTRole, string> = {
  admin:    'Quản trị viên',
  reviewer: 'Người duyệt',
  member:   'Thành viên',
};

export const useDMSTRole = () => {
  const [role, setRoleState] = useState<DMSTRole>(() => {
    return (localStorage.getItem(STORAGE_KEY) as DMSTRole) || 'admin';
  });

  const setRole = useCallback((r: DMSTRole) => {
    localStorage.setItem(STORAGE_KEY, r);
    setRoleState(r);
  }, []);

  const isAdmin    = role === 'admin';
  const isReviewer = role === 'reviewer' || role === 'admin';
  const isMember   = role === 'member';

  return { role, setRole, isAdmin, isReviewer, isMember };
};
