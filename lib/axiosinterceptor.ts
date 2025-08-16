// lib/axiosInterceptor.ts
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NextBaseURL,
  // headers: {
  //   "Content-Type": "application/json",
  //   Accept: "application/json",
  // },
  // Remove withCredentials: true from here
});

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];
let accessToken: string | null = null;

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for refresh endpoint
    if (config.url?.includes("/api/auth/refresh")) {
      config.withCredentials = true; // Only use credentials for Next.js API routes
      return config;
    }

    // Check if this is a Django backend request
    const isDjangoRequest = config.url?.includes(
      process.env.NEXT_PUBLIC_DJANGO_BASE_URL || ""
    );

    if (isDjangoRequest) {
      // For Django requests, don't use credentials, just add Bearer token
      config.withCredentials = false;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } else {
      // For Next.js API routes, use credentials
      config.withCredentials = true;
      if (accessToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // Call refresh endpoint (this will use credentials)
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!refreshResponse.ok) {
          throw new Error(
            `Refresh failed with status ${refreshResponse.status}`
          );
        }

        const data = await refreshResponse.json();
        accessToken = data.access;

        // Retry pending requests
        pendingRequests.forEach((resolve) => resolve());
        pendingRequests = [];

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);

        // Clear token
        accessToken = null;

        // Clear pending requests with rejection
        pendingRequests.forEach((reject) => reject());
        pendingRequests = [];

        // Delete cookies by calling logout endpoint
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (logoutError) {
          console.error("Logout endpoint failed:", logoutError);
        }

        // Redirect to login
        if (typeof window !== "undefined") {
          console.log("Redirecting to login...");
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Queue request while refreshing
    return new Promise((resolve, reject) => {
      pendingRequests.push(() => {
        api(originalRequest).then(resolve).catch(reject);
      });
    });
  }
);

// Set access token after login
export function setAccessToken(token: string) {
  accessToken = token;
}

export const djangoApi = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
