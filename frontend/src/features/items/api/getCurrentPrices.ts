import { api } from '@/lib/apiClient';
import { IAPI } from '@/types/interfaces';

export async function getCurrentPrices(id: number): Promise<IAPI> {
  try {
    const response = (await api.get(`/items/current/${id}`)) as IAPI;

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
