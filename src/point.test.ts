import { describe, it, expect } from "vitest";
import { calcPoint } from "./point";

describe("calcPoint: ポイント計算", () => {
  // 通常会員
  describe("通常会員", () => {
    it("通常月: 1000円 → 10pt（1倍）", () => {
      expect(calcPoint(1000, "normal", false)).toBe(10);
    });

    it("誕生日月: 1000円 → 20pt（2倍）", () => {
      expect(calcPoint(1000, "normal", true)).toBe(20);
    });
  });

  // シルバー会員
  describe("シルバー会員", () => {
    it("通常月: 1000円 → 20pt（2倍）", () => {
      expect(calcPoint(1000, "silver", false)).toBe(20);
    });

    it("誕生日月: 1000円 → 40pt（4倍）", () => {
      expect(calcPoint(1000, "silver", true)).toBe(40);
    });
  });

  // ゴールド会員
  describe("ゴールド会員", () => {
    it("通常月: 1000円 → 30pt（3倍）", () => {
      expect(calcPoint(1000, "gold", false)).toBe(30);
    });

    it("誕生日月: 1000円 → 60pt（6倍）", () => {
      expect(calcPoint(1000, "gold", true)).toBe(60);
    });
  });

  // 金額の境界値
  it("購入金額0円のとき、ポイントは0pt", () => {
    expect(calcPoint(0, "gold", true)).toBe(0);
  });
});
