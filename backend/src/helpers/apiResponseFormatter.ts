import { API } from '../interfaces/interfaces.js';

function apiResponseFormatter<T>(
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

export default apiResponseFormatter;
