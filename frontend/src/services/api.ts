import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 20000,
});

// ==============================================
// REQUEST INTERCEPTOR: attach the auth token
// ==============================================
// Every API request automatically carries the
// JWT from localStorage when one exists, so
// protected routes work without every caller
// manually setting the Authorization header.
// An explicitly-provided header is respected so
// callers can override it when needed.
// ==============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ==============================================
// RESPONSE INTERCEPTOR: friendly error messages
// ==============================================
// Translates network failures and backend "DB
// unavailable" states into clear, actionable
// messages instead of exposing raw "Network Error"
// or internal server strings to students.
// ==============================================

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // A 401 on an authenticated request means the session
    // is invalid or expired. Drop the stored session so
    // the app shows the "Login required" state.
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");

      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-change"));
      }
    }

    const status = error.response?.status;

    // The backend returns a typed JSON body; cast it safely so we
    // can read "message" without exposing the raw error.
    const body = error.response?.data as
      | { message?: string }
      | undefined;

    // DB / server unavailable states.
    if (
      status === 503 ||
      body?.message ===
        "Database connection unavailable. Please try again in a moment."
    ) {
      error.message =
        "The server is temporarily unavailable. Please try again in a moment.";
      return Promise.reject(error);
    }

    // No response received -> backend unreachable / network error.
    if (!error.response) {
      error.message =
        "Unable to reach the server. Check your internet connection and try again.";
    }

    return Promise.reject(error);
  }
);

export default api;