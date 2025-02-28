import * as z from 'zod';
import { api } from '@/lib/apiClient';

import { IAPI } from '@/types/interfaces';

const searchSchema = z.strictObject({
  q: z.string().min(2),
  page: z.string().min(1).optional(),
});

export async function quickSearch(query: string): Promise<IAPI> {
  // Validate Input
  try {
    searchSchema.parse({ q: query });

    const response = (await api.get('/search/quick', {
      params: { q: query },
    })) as IAPI;

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
