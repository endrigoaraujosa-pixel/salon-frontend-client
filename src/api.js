import axios from 'axios';
import { prepareBookingLocation } from './pwaTenant';

const tenant = prepareBookingLocation(window);
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

// Proofs stay in this tab's memory, just like BookingContext. No extra UI step.
let phoneToken;
const reservationTokens = new Map();
api.interceptors.request.use(config => {
  if (config.method === 'post' && config.url?.startsWith('/online/')) {
    config.data = { ...config.data,
      online_token: phoneToken,
      reservation_token: reservationTokens.get(config.data?.solicitacaoId),
    };
  }
  return config;
});
api.interceptors.response.use(response => {
  if (response.data?.online_token) phoneToken = response.data.online_token;
  if (response.data?.reservation_token && response.data?.solicitacaoId) {
    reservationTokens.set(response.data.solicitacaoId, response.data.reservation_token);
    if (reservationTokens.size > 10) reservationTokens.delete(reservationTokens.keys().next().value);
  }
  return response;
});

export default api;
