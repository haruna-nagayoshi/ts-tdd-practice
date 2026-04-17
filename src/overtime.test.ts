import { describe, it, expect } from "vitest";
import { calcOvertimePay } from "./overtime";

// 時刻は分で表す。例: 9:00 → H(9)=540、翌2:00 → NEXT(2)=1560
const H = (h: number, m = 0) => h * 60 + m;
const NEXT = (h: number, m = 0) => (24 + h) * 60 + m;

const WAGE = 1000;

describe("calcOvertimePay: 残業代計算", () => {
  // --- 正常系 ---

  describe("クラス1: 通常勤務（割増なし）", () => {
    it("平日9:00-15:00（6h, 代表値）→ 6,000円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(15), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(6000);
    });

    it("平日9:00-17:00（8hちょうど, 上限境界）→ 8,000円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(17), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(8000);
    });

    it("21:00-22:00（深夜開始の直前まで）→ 割増なし 1,000円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(21), endMinutes: H(22), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(1000);
    });

    it("5:00-6:00（深夜終了の直後から）→ 割増なし 1,000円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(5), endMinutes: H(6), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(1000);
    });
  });

  describe("クラス2: 時間外のみ（月60h以内）→ 125%", () => {
    it("平日9:00-17:01（8h+1分, 下限境界）→ 8,020円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(17, 1), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(8020);
    });

    it("平日9:00-20:00（11h, 代表値）→ 11,750円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(20), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(11750);
    });

    it("平日9:00-20:00（月累計60hちょうど, 上限境界）→ 125%のまま 11,750円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(20), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 3600 })
      ).toBe(11750);
    });
  });

  describe("クラス3: 時間外のみ（月60h超）→ 150%", () => {
    it("平日9:00-20:00（月累計60h+1分, 下限境界）→ 150%に切り替わる 12,500円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(20), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 3601 })
      ).toBe(12500);
    });

    it("平日9:00-20:00（月累計100h, 代表値）→ 12,500円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(20), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 6000 })
      ).toBe(12500);
    });
  });

  describe("クラス4: 深夜のみ（8h以内）→ 125%", () => {
    it("22:00-23:00（深夜開始直後）→ 深夜割増 1,250円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(22), endMinutes: H(23), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(1250);
    });

    it("22:00-翌1:00（3h, 代表値）→ 3,750円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(22), endMinutes: NEXT(1), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(3750);
    });

    it("4:00-5:00（深夜終了の直前まで）→ 深夜割増 1,250円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(4), endMinutes: H(5), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(1250);
    });
  });

  describe("クラス5: 時間外＋深夜（月60h以内）→ 昼間125% / 深夜150%", () => {
    it("平日9:00-翌0:00（15h, 代表値）→ 17,250円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: NEXT(0), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(17250);
    });
  });

  describe("クラス6: 時間外＋深夜（月60h超）→ 昼間150% / 深夜175%", () => {
    it("平日9:00-翌0:00（月累計3601分, 代表値）→ 19,000円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: NEXT(0), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 3601 })
      ).toBe(19000);
    });
  });

  describe("クラス7: 休日のみ → 135%（時間外割増は重複しない）", () => {
    it("法定休日9:00-17:00（8h, 代表値）→ 10,800円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(17), hourlyWage: WAGE, isHoliday: true, monthlyOvertimeMinutes: 0 })
      ).toBe(10800);
    });

    it("法定休日9:00-20:00（11h, 8h超でも135%のまま）→ 14,850円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(20), hourlyWage: WAGE, isHoliday: true, monthlyOvertimeMinutes: 0 })
      ).toBe(14850);
    });
  });

  describe("クラス8: 休日＋深夜 → 160%", () => {
    it("法定休日22:00-翌2:00（4h, 代表値）→ 6,400円", () => {
      expect(
        calcOvertimePay({ startMinutes: H(22), endMinutes: NEXT(2), hourlyWage: WAGE, isHoliday: true, monthlyOvertimeMinutes: 0 })
      ).toBe(6400);
    });
  });

  // --- 時間帯をまたぐケース ---

  describe("時間帯をまたぐケース", () => {
    it("20:00-23:00（22時をまたぐ, 昼2h+深夜1h）→ 3,250円", () => {
      // 昼間2h: 2,000円 + 深夜1h: 1,250円
      expect(
        calcOvertimePay({ startMinutes: H(20), endMinutes: H(23), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(3250);
    });

    it("4:00-6:00（5時をまたぐ, 深夜1h+昼1h）→ 2,250円", () => {
      // 深夜1h: 1,250円 + 昼間1h: 1,000円
      expect(
        calcOvertimePay({ startMinutes: H(4), endMinutes: H(6), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toBe(2250);
    });
  });

  // --- 異常系 ---

  describe("異常系", () => {
    it("E2: 終了時刻 <= 開始時刻 → エラー", () => {
      expect(() =>
        calcOvertimePay({ startMinutes: H(17), endMinutes: H(9), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toThrow();
    });

    it("E3: 基本時給0円 → エラー", () => {
      expect(() =>
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(17), hourlyWage: 0, isHoliday: false, monthlyOvertimeMinutes: 0 })
      ).toThrow();
    });

    it("E4: 月累計残業時間が負 → エラー", () => {
      expect(() =>
        calcOvertimePay({ startMinutes: H(9), endMinutes: H(17), hourlyWage: WAGE, isHoliday: false, monthlyOvertimeMinutes: -1 })
      ).toThrow();
    });
  });
});
