import api from './api';

export const register = (data) => {
  return api.post('/auth/register', data);
};

export const login = (data) => {
  return api.post('/auth/login', data);
};

export const googleLogin = (googleAccessToken) => {
  return api.post('/auth/login/google', { googleAccessToken });
};

export const addStaff = (data) => {
  return api.post('/auth/staff/add', data);
};

