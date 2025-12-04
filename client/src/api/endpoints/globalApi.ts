import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import useUserStore from "../../store/useUserInfo";

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
      const userInfo = useUserStore.getState().userInfo;
      if (userInfo?._refreshToken) {
        try {
          // Import dynamically to avoid circular dependency
          const { default: refreshTokenApi } = await import('./refreshToken');
          const refreshResponse = await refreshTokenApi(userInfo);
          
          if (refreshResponse?.success === "true") {
            // Update tokens
            useUserStore.getState().signinUser({
              ...userInfo,
              _accessToken: refreshResponse._accessToken,
              _refreshToken: refreshResponse._refreshToken,
            });
            
            // Update the authorization header for the retry
            error.config.headers.Authorization = `Bearer ${refreshResponse._accessToken}`;
            
            // Retry original request
            return api.request(error.config);
          } else {
            // Refresh failed, logout
            useUserStore.getState().signOutUser();
          }
        } catch (refreshError) {
          console.error("Refresh token error:", refreshError);
          useUserStore.getState().signOutUser();
        }
      } else {
        // No refresh token, logout
        useUserStore.getState().signOutUser();
      }
    }
    return Promise.reject(error);
  }
);

// Request Middleware for each request
api.interceptors.request.use((config) => {
  const userInfo = useUserStore.getState().userInfo;
  const token = userInfo?._accessToken;

  if (config.headers?.skipAuth) {
    delete config.headers.skipAuth;
    return config;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { api };
