import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMMM yyyy');
  } catch {
    return '-';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMMM yyyy, HH:mm');
  } catch {
    return '-';
  }
};
