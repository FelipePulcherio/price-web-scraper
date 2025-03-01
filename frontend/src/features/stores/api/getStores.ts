import { api } from '@/lib/apiClient';
import { IAPI } from '@/types/interfaces';

export async function getAllStores(): Promise<IAPI> {
  try {
    const response = (await api.get('/stores')) as IAPI;

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
