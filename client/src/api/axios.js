import axios from "axios";

// One configured connection to the backend. Every API call uses this.
//
// In production, set VITE_API_URL to your deployed backend URL, e.g.
//   VITE_API_URL=https://your-api.onrender.com/api
// When that variable is not set (local development) we fall back to the
// same hostname the page was opened with, so it works on localhost and on
// another device (e.g. a phone) over the local network.
const backendHost =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: backendHost,
});

// Before each request, if we have a saved login token, attach it so the
// backend knows who we are.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
