import { requestGET } from '@/utils/baseAPI';
import { IBusiness, IResult } from '@/models';

export async function getBusinessById(businessId: string): Promise<IBusiness | null> {
  try {
    const response = await requestGET<IResult<IBusiness>>(`businesses/${businessId}`);
    return response?.data?.data ?? null;
  } catch (error) {
    console.error('Error in getBusinessById:', error);
    throw error;
  }
}