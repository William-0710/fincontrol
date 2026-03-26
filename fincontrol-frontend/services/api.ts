import axios from 'axios';

export const api = axios.create({
  // Sua URL do Railway em produção
  baseURL: 'https://natural-liberation-production-27cf.up.railway.app',
});

// 🛡️ INTERCEPTOR: O "Guarda-Costas" do Frontend
// Antes de qualquer requisição sair para o Backend, este código roda:
api.interceptors.request.use((config) => {
  // Pega o token que salvamos no navegador na hora que o usuário fez Login
  const token = typeof window !== 'undefined' ? localStorage.getItem('fincontrol.token') : null;
  
  // Se o token existir, anexa ele no cabeçalho (Header) como um "Bearer Token"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});