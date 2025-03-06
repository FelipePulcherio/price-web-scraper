import { api } from '@/lib/apiClient';
import { IAPI } from '@/types/interfaces';

export async function getPriceHistory30(id: number): Promise<IAPI> {
  try {
    const response = (await api.get(`/items/history/30/${id}`)) as IAPI;

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
