export default function StatusBadge({ status, children }) {
  const statusColors = {
    draft: 'bg-primary-50 text-primary-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    ready: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.draft}`}
    >
      {children || status}
    </span>
  );
}

