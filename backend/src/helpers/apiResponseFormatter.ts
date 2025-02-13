import { IAPI } from '@/interfaces/interfaces';

export default function apiResponseFormatter<T>(
  success: boolean,
  messages: string[],
  data: T
): IAPI<T> {
  return {
    timestamp: new Date(),
    success,
    messages,
    data,
  };
}
