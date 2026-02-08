export type VariantInfo = {
  price: number;
  productName: string;
  attributes?: Record<string, string>;
  imageUrl?: string;
  sku?: string;
  stockQuantity?: number;
  taxRate?: number;
};

export type CartItemDto = {
  cartItemId: string; // GUID
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantInfo?: VariantInfo;
  taxRate?: number;
  priceBeforeTax?: number;
  taxAmount?: number;
};

export type CartDto = {
  cartId: string;
  userId: string;
  createdAt: string;
  items: CartItemDto[];
  totalAmount: number;
  totalItems: number;
  subtotalBeforeTax?: number;
  taxAmount?: number;
};

export type AddCartItemDto = {
  variantId: string;
  quantity: number;
};

export type UpdateCartItemDto = {
  quantity: number;
};