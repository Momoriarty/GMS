import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("API REQUEST TO:", config.url);
    console.log("TOKEN:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("API ERROR:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.log("TOKEN EXPIRED / INVALID");

      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // lebih aman pakai router kalau ada
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;