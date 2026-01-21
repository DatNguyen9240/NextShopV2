export const ADMIN_CANCEL_REASONS = [
  'Kho hết hàng',
  'Sản phẩm bị lỗi',
  'Phát hiện giao dịch khả nghi',
  'Yêu cầu từ seller',
  'Lý do khác'
] as const;

export type AdminCancelReason = typeof ADMIN_CANCEL_REASONS[number];
