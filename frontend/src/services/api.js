import axios from 'axios';
export const api = axios.create({ baseURL: '/api', timeout: 15000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function errorMessage(error) {
  return error.response?.data?.error || 'Não foi possível acessar a API. Verifique a conexão e tente novamente.';
}
