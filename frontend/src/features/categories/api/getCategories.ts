import { api } from '@/lib/apiClient';
import { IAPI } from '@/types/interfaces';

export async function getAllCategories(): Promise<IAPI> {
  try {
    const response = (await api.get('/categories')) as IAPI;

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
