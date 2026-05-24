import axios from "axios";
import { API } from "./api";

const TOKEN_KEY = "admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const adminApi = axios.create({ baseURL: `${API}/admin` });

adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined" && !window.location.pathname.endsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
    return Promise.reject(err);
  }
);

export async function login(email, password) {
  const { data } = await axios.post(`${API}/admin/login`, { email, password });
  setToken(data.access_token);
  return data.user;
}

export async function me() {
  const { data } = await adminApi.get("/me");
  return data;
}

export async function fetchMetrics() {
  const { data } = await adminApi.get("/metrics");
  return data;
}

export async function fetchSignups({ search = "", limit = 100, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const { data } = await adminApi.get(`/signups?${params.toString()}`);
  return data;
}
