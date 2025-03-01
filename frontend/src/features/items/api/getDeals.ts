import { api } from '@/lib/apiClient';
import { IAPI } from '@/types/interfaces';

export async function getMainDeals(): Promise<IAPI> {
  try {
    const response = (await api.get('/items/mainDeals')) as IAPI;

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
