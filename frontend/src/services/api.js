import axios from 'axios';

// Detecta se está no Codespaces e ajusta a URL da API dinamicamente
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('app.github.dev')) {
    // Substitui a porta 5173 do front pela porta 3000 do back-end na URL do Codespaces
    return `https://${hostname.replace('-5173', '-3000')}/api`;
  }
  return 'http://localhost:3000/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
});