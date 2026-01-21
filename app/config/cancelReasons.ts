export const CANCEL_REASONS = [
  'Thay đổi ý định',
  'Giao hàng quá chậm',
  'Sản phẩm không đúng như mô tả',
  'Tìm thấy giá rẻ hơn',
  'Lý do khác'
] as const;

export type CancelReason = typeof CANCEL_REASONS[number];