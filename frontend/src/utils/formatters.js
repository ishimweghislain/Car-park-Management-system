// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Currency formatting
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Duration formatting
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '-';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Status badge utilities
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'badge-success';
    case 'occupied':
      return 'badge-warning';
    case 'maintenance':
      return 'badge-danger';
    case 'active':
      return 'badge-warning';
    case 'completed':
      return 'badge-success';
    case 'paid':
      return 'badge-success';
    case 'unpaid':
      return 'badge-danger';
    default:
      return 'badge-secondary';
  }
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
