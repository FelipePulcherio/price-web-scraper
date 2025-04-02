import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import config from '@/config';

const proxyAgent = new HttpsProxyAgent(config.proxy);

export const axiosClient: AxiosInstance = axios.create({
  timeout: 90000,
  httpsAgent: proxyAgent,
});
