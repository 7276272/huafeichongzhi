// Utility functions for the orders page

// Format a date string to localized format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Filter orders based on search term
export const filterOrders = <T extends { order_id: string; phone_number: string }>(
  ordersToFilter: T[],
  term: string
) => {
  if (term.trim() === "") {
    return ordersToFilter;
  }

  return ordersToFilter.filter(
    (order) =>
      order.order_id.toLowerCase().includes(term.toLowerCase()) ||
      order.phone_number.includes(term)
  );
};
