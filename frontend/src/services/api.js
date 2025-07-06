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

// Create a variable to track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue = [];

// Process the failed queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          'http://127.0.0.1:8000/api/users/token/refresh/',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('token', access);

        // Update the authorization header for the original request
        originalRequest.headers['Authorization'] = `Bearer ${access}`;

        // Process any requests that were queued while refreshing
        processQueue(null, access);

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => {
    return api.post('/users/token/', { username: email, password });
  },
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
};

// Agent-specific API
export const agentAPI = {
  // Agent profile management
  getMyProfile: () => api.get('/properties/agents/my_profile/'),
  updateProfile: (profileData) => api.put('/properties/agents/my_profile/', profileData),

  // Agent property management
  getMyProperties: () => api.get('/properties/listings/agent_properties/'),
  getPropertyInquiries: () => api.get('/properties/inquiries/'),
  respondToInquiry: (inquiryId, response) => api.post(`/properties/inquiries/${inquiryId}/respond/`, { response }),

  // Analytics and performance
  getPerformanceStats: () => api.get('/properties/agents/performance/'),
};

// Tenant-specific API
export const tenantAPI = {
  // Favorites management
  getFavorites: () => api.get('/properties/favorites/'),
  addFavorite: (houseId) => api.post('/properties/favorites/', { house_id: houseId }),
  removeFavorite: (favoriteId) => api.delete(`/properties/favorites/${favoriteId}/`),
  getRecommendations: () => api.get('/properties/favorites/recommended/'),

  // Inquiries management
  getMyInquiries: () => api.get('/properties/inquiries/'),
  createInquiry: (houseId, message) => api.post('/properties/inquiries/', { house_id: houseId, message }),
  updateInquiry: (inquiryId, data) => api.put(`/properties/inquiries/${inquiryId}/`, data),
  deleteInquiry: (inquiryId) => api.delete(`/properties/inquiries/${inquiryId}/`),
};

export default api;
