import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

export const axiosRequest = async (
  config: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return await axios(config);
};
