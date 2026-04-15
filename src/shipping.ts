export function calcShipping(price: number): number {
  if (price >= 10000) {
    return 0;
  }
  if (price >= 3000) {
    return 300;
  }
  return 500;
}
