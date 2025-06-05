import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;

        localStorage.setItem('token', token);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (error) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
  refreshToken: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

const authApi = {
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/auth/login', credentials),

  register: (credentials: RegisterCredentials) =>
    api.post<AuthResponse>('/auth/register', credentials),

  logout: () => api.post('/auth/logout'),
};

const postsApi = {
  getPosts: () => api.get<Post[]>('/posts'),

  createPost: (data: FormData) =>
    api.post<Post>('/posts', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deletePost: (postId: string) => api.delete(`/posts/${postId}`),

  likePost: (postId: string) => api.post(`/posts/${postId}/like`),

  unlikePost: (postId: string) => api.delete(`/posts/${postId}/like`),
};

const userApi = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  updateProfile: (data: FormData) =>
    api.put('/users/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export { api as default, authApi, postsApi, userApi };
