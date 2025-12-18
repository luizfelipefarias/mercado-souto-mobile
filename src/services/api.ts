import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token'; 

const api = axios.create({
  baseURL: 'http://162.243.70.61:8080', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para limpar dados se o token for inválido
const handleUnauthorized = async () => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        console.log("Token expirado ou inválido. Limpeza efetuada.");
    } catch (e) {
        console.error("Erro ao limpar token", e);
    }
};

// --- INTERCEPTOR DE REQUISIÇÃO (ENVIA O TOKEN) ---
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (token && config.headers) {
        // CORREÇÃO CRÍTICA: LIMPEZA DO TOKEN
        // Remove 'Bearer', 'bearer', e espaços em branco para garantir um token limpo
        const cleanToken = token.replace(/Bearer/gi, '').trim();

        // Monta o cabeçalho corretamente
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    } catch (error) {
      console.error("Erro ao recuperar token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR DE RESPOSTA (TRATA ERROS) ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      console.log('API Error Status:', error.response.status);
      // Cuidado ao logar data se for muito grande
      if (error.response.data && !error.response.data.token) { 
          console.log('API Error Data:', error.response.data);
      }

      // Se der erro de autenticação (401 ou 403)
      if (error.response.status === 401 || error.response.status === 403) {
        // Verifica se o erro não veio da própria tentativa de login/cadastro
        // para não limpar o token enquanto o usuário tenta entrar
        const url = error.config.url || '';
        const isAuthRoute = url.includes('/login') || url.includes('/client'); 
        
        if (!isAuthRoute) {
            handleUnauthorized();
        }
      }
    } else {
      console.log('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;