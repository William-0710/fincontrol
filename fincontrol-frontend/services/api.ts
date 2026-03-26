import axios from 'axios';

export const api = axios.create({
  // Aqui vai a URL do Railway, e só isso!
  baseURL: 'https://natural-liberation-production-27cf.up.railway.app',
});