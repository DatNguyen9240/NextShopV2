export function formatVND(price: number | string): string {
  const value =
    typeof price === "string" ? Number(price.replace(/[^\d]/g, "")) : price;
  return value.toLocaleString("vi-VN");
}
