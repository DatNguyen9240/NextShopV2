## ✅ Admin page — quick guide (Products & Variants)

**Files analyzed:** `app/services/productService.ts` (frontend) and `NextShopV2.Application/Services/ProductVariantService.cs` (backend).

### 🔧 Backend API (endpoints)
- Products
  - GET  /api/Product?section=&categoryId=&page=&pageSize= — list or paged products
  - GET  /api/Product/{id} — get product details
  - POST /api/Product — create product
  - PUT  /api/Product/{id} — update product
  - DELETE /api/Product/{id} — delete product

- Variants
  - GET  /api/ProductVariant/product/{productId} — list variants for a product
  - GET  /api/ProductVariant/product/{productId}/default — get default variant
  - GET  /api/ProductVariant/{id} — get variant by id
  - POST /api/ProductVariant — create variant (body: CreateProductVariantRequest)
  - PUT  /api/ProductVariant/{id} — update variant (body: UpdateProductVariantRequest)
  - PATCH /api/ProductVariant/{id}/stock — update stock (body: UpdateStockRequest)
  - PATCH /api/ProductVariant/{id}/set-default — set variant as default
  - DELETE /api/ProductVariant/{id} — delete variant

- Uploads
  - POST /api/Upload (form-data file) → returns `{ success, message, data: { url, publicId } }`
  - DELETE /api/Upload?publicId=...

> API responses use a standard shape: `{ success: boolean, message: string, data?: any }` (see `ResponseHelper`).

### 📌 DTO highlights (validation & rules)
- CreateProductVariantRequest
  - `ProductId` (required), `BasePrice` (>0), `DiscountPercent` (0–100), `DiscountAmount` (>=0), `SKU?`, `Color?`, `Size?`, `StockQuantity`, `IsDefault`, `DisplayOrder`, `ImageUrl`, `ImgHover`.
  - If `SKU` omitted, server auto-generates one.
  - `DiscountAmount` takes precedence over `DiscountPercent`.
  - Discount cannot exceed base price (server throws validation error).

- UpdateProductVariantRequest — same fields but all optional for numeric price/discounts; same validation rules apply when provided.

- ProductVariantResponse — includes `ProductVariantId`, `Sku`, `Color`, `Size`, `StockQuantity`, `IsDefault`, `DisplayOrder`, `BasePrice`, `DiscountPercent`, `DiscountAmount`, `PriceAfterDiscount`, `ImageUrl`, `ImgHover`.

- UpdateStockRequest — `{ StockQuantity: number }` (>=0).

### 💡 Backend behaviors to reflect in UI
- SKUs are generated server-side when empty — only show generated value after save.
- When creating/updating a variant with `IsDefault = true`, server will unmark other defaults for the same product.
- DisplayOrder conflicts are resolved by `OrderResolutionService` on the server — UI can allow drag & drop or numeric order input but should handle server-provided final order.
- Validation errors return `{ success:false, message: 'Validation failed', data: string[] }` with messages.

### 🧩 Frontend integration (examples)
- Use existing `productService.getProducts(params)` and `getProductById(id)`.
- Add `variantService.ts` (example):

```ts
import axiosClient from '../lib/axiosClient';

export async function getVariantsByProductId(productId: string) {
  const res = await axiosClient.get(`/api/ProductVariant/product/${productId}`);
  return res.data?.data ?? [];
}

export async function createVariant(payload: any) {
  const res = await axiosClient.post('/api/ProductVariant', payload);
  return res.data?.data;
}

export async function updateVariant(id: string, payload: any) {
  return axiosClient.put(`/api/ProductVariant/${id}`, payload);
}

export async function updateVariantStock(id: string, stockQuantity: number) {
  return axiosClient.patch(`/api/ProductVariant/${id}/stock`, { stockQuantity });
}

export async function setVariantDefault(id: string) {
  return axiosClient.patch(`/api/ProductVariant/${id}/set-default`);
}

export async function deleteVariant(id: string) {
  return axiosClient.delete(`/api/ProductVariant/${id}`);
}
```

### 🧭 Suggested Admin UI features
- Product list page: filters (category/section), pagination (page, pageSize), sort options.
- Product edit page: core details + **Variants** section.
- Variants section (table): columns — SKU, Color, Size, BasePrice, DiscountPercent, DiscountAmount, PriceAfterDiscount, Stock, IsDefault (toggle), DisplayOrder (draggable or editable number), Image (preview), Actions (Edit/Delete).
- Create/Edit variant modal: validate locally similar to backend rules (e.g., base price > 0; discount percent 0–100); show server validation messages if returned.
- Inline stock edit for quick changes (uses PATCH /stock).
- Set as default action (calls PATCH /set-default) — confirm and reflect change on UI (unmark existing default).
- Upload image via `/api/Upload` (form-data) and store returned `url` in `ImageUrl`/`ImgHover`.

### ⚠️ Edge cases & error handling
- If backend returns a validation error (`success: false, data: string[]`), surface the messages in the form.
- When creating/updating a variant, the final `DisplayOrder` may be adjusted by server; refresh the list after create/update.
- Prevent user from setting DiscountAmount > BasePrice in the UI and show a helpful message.

### ▶️ Run & test locally
- Backend (API):
  - Open `d:\MyApp\BE_NextShopV2\NextShopV2.Api` and run `dotnet run` (or use your existing Docker dev stack).
- Frontend (Next.js):
  - Open `d:\MyApp\NextShopV2` and run `npm run dev` (or `pnpm dev`) — UI served on http://localhost:3000.

---

If you want, I can also add a sample `variantService.ts` file to `app/services/` and a basic admin page skeleton (`app/admin/products/[id]/variants/page.tsx`) to speed up development. 💡