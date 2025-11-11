import api from './api';

export const getCalendar = () => {
  return api.get('/calendar');
};

