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


const handleUnauthorized = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log("Token expirado ou inválido. Logout forçado.");
};


api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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


api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      console.log('API Error Status:', error.response.status);
      console.log('API Error Data:', error.response.data);

      if (error.response.status === 401 || error.response.status === 403) {
        const isAuthRoute = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
        
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