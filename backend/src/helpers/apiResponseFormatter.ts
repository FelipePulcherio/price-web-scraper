import { IAPI } from '@/interfaces/interfaces';

export default function apiResponseFormatter<T>(
  success: boolean,
  message: string,
  data: T
): IAPI<T> {
  return {
    timestamp: new Date(),
    success,
    message,
    data,
  };
}
