import axios from 'axios';
import { getTokens, setTokens, removeTokens } from '../utils/auth';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const refreshToken = async (refresh) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}/token/refresh/`,
      { refresh }
    );
    return response.data.access;
  } catch (error) {
    removeTokens();
    window.location.href = '/login';
    throw error;
  }
};

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const tokens = getTokens();
    if (tokens && tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = getTokens();
        if (!tokens || !tokens.refresh) {
          removeTokens();
          return Promise.reject(error);
        }
        const newAccess = await refreshToken(tokens.refresh);
        setTokens({ ...tokens, access: newAccess });
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// API Functions
export const loginUser = async (username, password) => {
  const res = await apiClient.post('/token/', { username, password });
  const tokens = res.data;
  setTokens(tokens);

  // Decode the token to get the user ID
  const base64Url = tokens.access.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(window.atob(base64));
  localStorage.setItem('user_id', payload.user_id);
  
  return tokens;
};

export const registerUser = (data) =>
  apiClient.post('/register/', data).then(res => res.data);

export const createPatientProfile = (data) =>
  apiClient.post('/profiles/patient/', data).then(res => res.data);

export const createDoctorProfile = (data) =>
  apiClient.post('/profiles/doctor/', data).then(res => res.data);

// Patient API
export const getMyPatientProfile = () =>
  apiClient.get('/patients/').then(res => res.data);
export const getPatientProfileById = (id) =>
  apiClient.get(`/patients/${id}/`).then(res => res.data);
export const updatePatientProfile = (id, data) =>
  apiClient.put(`/patients/${id}/`, data).then(res => res.data);

// Doctor API
export const getAllDoctors = () =>
  apiClient.get('/doctors/').then(res => res.data);

// Appointment API
export const getAppointments = () =>
  apiClient.get('/appointments/').then(res => res.data);
export const createAppointment = (data) =>
  apiClient.post('/appointments/', data).then(res => res.data);
export const updateAppointment = (id, data) =>
  apiClient.put(`/appointments/${id}/`, data).then(res => res.data);

// EMR API
export const getEMRs = () =>
  apiClient.get('/emrs/').then(res => res.data);
export const createEMR = (data) =>
  apiClient.post('/emrs/', data).then(res => res.data);

// Message API
export const getMessages = () =>
  apiClient.get('/messages/').then(res => res.data);
export const createMessage = (data) =>
  apiClient.post('/messages/', data).then(res => res.data);

// HealthMetric API
export const getHealthMetrics = () =>
  apiClient.get('/healthmetrics/').then(res => res.data);
export const createHealthMetric = (data) =>
  apiClient.post('/healthmetrics/', data).then(res => res.data);