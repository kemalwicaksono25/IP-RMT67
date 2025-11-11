import api from './api';

export const getBriefs = (productId) => {
  const params = productId ? { productId } : {};
  return api.get('/briefs', { params });
};

export const getBriefById = (id) => {
  return api.get(`/briefs/${id}`);
};

export const generateBrief = (data) => {
  return api.post('/briefs', data);
};

export const generateDetail = (id) => {
  return api.post(`/briefs/${id}/detail`);
};

export const updateBriefDetail = (id, data) => {
  return api.put(`/briefs/${id}/detail`, data);
};

export const submitDetailForApproval = (id, data) => {
  return api.post(`/briefs/${id}/detail/submit`, data);
};

export const deleteBriefDetail = (id) => {
  return api.delete(`/briefs/${id}/detail`);
};

