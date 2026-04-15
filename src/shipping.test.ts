import { describe, it, expect } from "vitest";
import { calcShipping } from "./shipping";

describe("calcShipping: 送料計算", () => {
  // 同値クラス1: 0〜2999円 → 500円
  it("購入金額が0円のとき、送料は500円", () => {
    expect(calcShipping(0)).toBe(500);
  });

  it("購入金額が1500円のとき、送料は500円", () => {
    expect(calcShipping(1500)).toBe(500);
  });

  it("購入金額が2999円のとき、送料は500円", () => {
    expect(calcShipping(2999)).toBe(500);
  });

  // 同値クラス2: 3000〜9999円 → 300円
  it("購入金額が3000円のとき、送料は300円", () => {
    expect(calcShipping(3000)).toBe(300);
  });

  it("購入金額が5000円のとき、送料は300円", () => {
    expect(calcShipping(5000)).toBe(300);
  });

  it("購入金額が9999円のとき、送料は300円", () => {
    expect(calcShipping(9999)).toBe(300);
  });

  // 同値クラス3: 10000円以上 → 0円
  it("購入金額が10000円のとき、送料は0円", () => {
    expect(calcShipping(10000)).toBe(0);
  });

  it("購入金額が20000円のとき、送料は0円", () => {
    expect(calcShipping(20000)).toBe(0);
  });
});
