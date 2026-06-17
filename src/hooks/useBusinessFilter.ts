import { useEffect, useMemo } from 'react';
import { useAuth } from '@/app/modules/auth';
import { IBusiness, UserType } from '@/models';
import { useAppDispatch, useAppSelector } from '@/redux/Hook';
import { fetchBusinessById } from '@/redux/business-filter/Actions';

interface BusinessFilterResult {
  business: IBusiness | null;
  isAdmin: boolean;
  shouldFilterByBusiness: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useBusinessFilter = (): BusinessFilterResult => {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();


  const { currentBusiness, isLoading, error } = useAppSelector(state => state.business);

  const isAdmin = currentUser?.type === UserType.Admin;
  const shouldFilterByBusiness = !isAdmin && !!currentUser?.businessId;

  useEffect(() => {
    if (shouldFilterByBusiness && currentUser?.businessId) {
      if (!currentBusiness || currentBusiness.id !== currentUser.businessId) {
        dispatch(fetchBusinessById(currentUser.businessId));
      }
    }
  }, [currentUser?.businessId, shouldFilterByBusiness, dispatch, currentBusiness]);

  return useMemo(
    () => ({
      business: currentBusiness,
      isAdmin,
      shouldFilterByBusiness,
      isLoading,
      error,
    }),
    [currentBusiness, isAdmin, shouldFilterByBusiness, isLoading, error]
  );
};