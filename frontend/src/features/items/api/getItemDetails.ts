import { api } from '@/lib/apiClient';
import { IAPI } from '@/types/interfaces';

export async function getItemDetails(id: number): Promise<IAPI> {
  try {
    const response = (await api.get(`/items/${id}`)) as IAPI;

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
