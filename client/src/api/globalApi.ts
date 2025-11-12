import axios, { type AxiosInstance, type AxiosResponse } from "axios";

const originUrl = import.meta.env.VITE_GO_BACKEND_URL;

if (originUrl == "") {
  console.log("Empty Backend URL");
}

const api: AxiosInstance = axios.create({
  baseURL: originUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: maybe refresh token logic here...");
    }
    return Promise.reject(error);
  }
);

export { api };
