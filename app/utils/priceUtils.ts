export function formatVND(price?: number | string): string {
  if (price === undefined || price === null || price === '') return '';
  const value = typeof price === 'string' ? Number(price.replace(/[^\d]/g, '')) : Number(price || 0);
  if (Number.isNaN(value)) return '';
  return value.toLocaleString('vi-VN');
} 
