// Format currency (Philippine Peso)
export const formatCurrency = (amount) => {
  return `₱${Math.abs(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format date time
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get category icon
export const getCategoryIcon = (category) => {
  const iconMap = {
    food: 'fast-food',
    transport: 'car',
    shopping: 'bag',
    entertainment: 'film',
    utilities: 'home',
    health: 'medical',
    education: 'school',
    savings: 'wallet',
    income: 'cash',
    other: 'help-circle',
  };
  return iconMap[category?.toLowerCase()] || 'help-circle';
};

// Get category color
export const getCategoryColor = (category) => {
  const colorMap = {
    food: '#FF9800',
    transport: '#2196F3',
    shopping: '#E91E63',
    entertainment: '#9C27B0',
    utilities: '#00BCD4',
    health: '#F44336',
    education: '#4CAF50',
    savings: '#8BC34A',
    income: '#4CAF50',
    other: '#9E9E9E',
  };
  return colorMap[category?.toLowerCase()] || '#9E9E9E';
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};
