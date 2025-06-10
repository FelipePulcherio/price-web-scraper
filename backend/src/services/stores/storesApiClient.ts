import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import config from '@/config';

const scraperApiProxyAgent = new HttpsProxyAgent(config.scraperApiProxy);
const brightDataProxyAgent = new HttpsProxyAgent(config.brightDataProxy);
const decodoProxyAgent = new HttpsProxyAgent(config.decodoProxy);

export const scraperApiAxiosClient: AxiosInstance = axios.create({
  timeout: 90000,
  httpsAgent: scraperApiProxyAgent,
});

export const brightDataAxiosClient: AxiosInstance = axios.create({
  timeout: 90000,
  httpsAgent: brightDataProxyAgent,
});

export const decodoAxiosClient: AxiosInstance = axios.create({
  timeout: 90000,
  httpsAgent: decodoProxyAgent,
});
