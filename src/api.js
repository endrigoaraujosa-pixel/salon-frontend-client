import axios from 'axios';

const tenant = new URLSearchParams(window.location.search).get('loja');
console.log(tenant);

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL + "/api";
  }
  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};


const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-tenant-id": tenant
  },
});

export default api;
