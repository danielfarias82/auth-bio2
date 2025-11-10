import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esta URL a tu IP local si pruebas en dispositivo físico
// Ejemplo: http://192.168.1.100:8000
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada solicitud
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const propertiesAPI = {
  getAll: async () => {
    const response = await api.get('/properties');
    return response.data;
  },
  create: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },
};

export const visitsAPI = {
  getAll: async () => {
    const response = await api.get('/visits');
    return response.data;
  },
  getByProperty: async (propertyId) => {
    const response = await api.get(`/visits/property/${propertyId}`);
    return response.data;
  },
  create: async (visitData) => {
    const response = await api.post('/visits', visitData);
    return response.data;
  },
};

export default api;