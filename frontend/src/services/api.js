import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/users/token/', { username: email, password }),
  register: (userData) => api.post('/users/register/', userData),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (profileData) => api.put('/users/update_profile/', profileData),
  changePassword: (passwordData) => api.post('/users/change_password/', passwordData),
};

// Properties API
export const propertiesAPI = {
  getPropertyTypes: () => api.get('/properties/types/'),
  getProperties: (params) => api.get('/properties/listings/', { params }),
  getProperty: (id) => api.get(`/properties/listings/${id}/`),
  createProperty: (propertyData) => api.post('/properties/listings/', propertyData),
  updateProperty: (id, propertyData) => api.put(`/properties/listings/${id}/`, propertyData),
  deleteProperty: (id) => api.delete(`/properties/listings/${id}/`),
  uploadImage: (id, imageData) => api.post(`/properties/listings/${id}/images/`, imageData),
  contactAgent: (id, contactData) => api.post(`/properties/listings/${id}/contact/`, contactData),
};

export default api;
