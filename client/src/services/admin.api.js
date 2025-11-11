import api from './api';

export const getPendingApprovals = () => {
  return api.get('/admin/approvals');
};

export const approveBrief = (id) => {
  return api.put(`/admin/approvals/${id}/approve`);
};

export const rejectBrief = (id, reason) => {
  return api.put(`/admin/approvals/${id}/reject`, { rejectionReason: reason });
};

export const scheduleBriefDetail = (id, scheduledAt) => {
  return api.put(`/admin/calendar/${id}/schedule`, { scheduledAt });
};

export const updateProjectName = (projectName) => {
  return api.put('/admin/project/name', { projectName });
};

export const getTeam = () => {
  return api.get('/admin/team');
};

