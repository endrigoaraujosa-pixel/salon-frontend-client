import axios from 'axios';

const getTenant = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let tenant = urlParams.get('loja');
  if (!tenant) {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www' && parts[0] !== 'admin') {
      tenant = parts[0];
    }
  }
  return tenant;
};

const tenant = getTenant();
console.log('Tenant ativo:', tenant);

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
