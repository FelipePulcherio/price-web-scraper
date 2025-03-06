import { API } from '@/interfaces/interfaces';

export default function apiResponseFormatter<T>(
  success: boolean,
  messages: string[],
  data: T
): API<T> {
  return {
    timestamp: new Date(),
    success,
    messages,
    data,
  };
}
