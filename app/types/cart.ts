export type VariantInfo = {
  price: number;
  productName: string;
  color?: string;
  size?: string;
  imageUrl?: string;
  sku?: string;
  stockQuantity?: number;
};

export type CartItemDto = {
  cartItemId: string; // GUID
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantInfo?: VariantInfo;
};

export type CartDto = {
  cartId: string;
  userId: string;
  createdAt: string;
  items: CartItemDto[];
  totalAmount: number;
  totalItems: number;
};

export type AddCartItemDto = {
  variantId: string;
  quantity: number;
};

export type UpdateCartItemDto = {
  quantity: number;
};