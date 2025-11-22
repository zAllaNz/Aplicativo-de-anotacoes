import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Exemplo: adicionar token automaticamente se existir
api.interceptors.request.use(
  async (config) => {
    const token = ""; // pode pegar do AsyncStorage, por exemplo
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;