import axios from 'axios';
import { setAuthHeader } from './auth';

export const get = async (url: string, params?: any) => {
  setAuthHeader();
  const result = await axios.get(url, params);
  return result.data;
};

export const post = async (url: string, data?: any) => {
  setAuthHeader();
  const result = await axios.post(url, data);
  return result.data;
};

export const put = async (url: string, data?: any) => {
  setAuthHeader();
  const result = await axios.put(url, data);
  return result.data;
};
