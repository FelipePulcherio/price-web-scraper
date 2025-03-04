import Axios, { InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';

import { IAPI } from '@/types/interfaces';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }

  config.withCredentials = true; // When cookies implemented set to true
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

// Request Interceptor: Adds auth token when needed
api.interceptors.request.use(authRequestInterceptor);

// Response interceptor: Format response
api.interceptors.response.use(
  (response) => {
    return response.data; // response.data
  },
  (error) => {
    const result: IAPI = {
      timestamp: error.response.data.timestamp,
      success: error.response.data.success,
      status: error.response.status,
      messages: error.response.data.messages,
      data: error.response.data.data,
    };

    return Promise.reject(result);
  }
);
