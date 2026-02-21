import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

// 1. Interceptor de Requisição: Coloca o Token no envio
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("barber.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Interceptor de Resposta: Vigia erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se der erro, verificamos se é 401 (Não autorizado / Token Inválido)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Remove o lixo do storage (Cookies)
        Cookies.remove("barber.token");
        Cookies.remove("barber.user");

        // Redireciona para o login forçadamente
        window.location.href = "/login";
      }
    }
    // Repassa o erro para o componente
    return Promise.reject(error);
  },
);
