type WorkSession = {
  startMinutes: number;           // 開始時刻（分）例: 9:00 → 540
  endMinutes: number;             // 終了時刻（分）例: 翌2:00 → 1560
  hourlyWage: number;             // 基本時給（円）
  isHoliday: boolean;             // 法定休日か
  monthlyOvertimeMinutes: number; // 月の累計残業時間（分）
};

const LEGAL_DAILY_MINUTES = 480;         // 法定労働時間: 8h
const MONTHLY_OT_THRESHOLD = 60 * 60;   // 月60h = 3600分
const NIGHT_START = 22 * 60;             // 深夜開始: 22:00 = 1320分
const NIGHT_END = 5 * 60;               // 深夜終了: 5:00 = 300分

export function calcOvertimePay(session: WorkSession): number {
  const { startMinutes, endMinutes, hourlyWage, isHoliday, monthlyOvertimeMinutes } = session;

  if (endMinutes <= startMinutes) throw new Error("終了時刻は開始時刻より後にしてください");
  if (hourlyWage <= 0) throw new Error("基本時給は1以上にしてください");
  if (monthlyOvertimeMinutes < 0) throw new Error("月累計残業時間は0以上にしてください");

  const totalMinutes = endMinutes - startMinutes;

  // 法定内（最初の8h）と残業（8h超）に分ける
  const regularEnd = startMinutes + Math.min(totalMinutes, LEGAL_DAILY_MINUTES);
  const regularNight = calcNightMinutes(startMinutes, regularEnd);
  const regularDay = (regularEnd - startMinutes) - regularNight;

  let overtimeDay = 0;
  let overtimeNight = 0;
  if (totalMinutes > LEGAL_DAILY_MINUTES) {
    const overtimeStart = startMinutes + LEGAL_DAILY_MINUTES;
    overtimeNight = calcNightMinutes(overtimeStart, endMinutes);
    overtimeDay = (endMinutes - overtimeStart) - overtimeNight;
  }

  // 月60hを「超えた」場合に150%（3600分ちょうどはまだ超えていない）
  const isOver60h = monthlyOvertimeMinutes > MONTHLY_OT_THRESHOLD;
  const ratePerMin = hourlyWage / 60;

  let total = 0;
  if (isHoliday) {
    // 休日: 時間外割増は重複しない（35%固定）、深夜のみ+25%追加
    total += regularDay * ratePerMin * 1.35;
    total += regularNight * ratePerMin * 1.60;
    total += overtimeDay * ratePerMin * 1.35;
    total += overtimeNight * ratePerMin * 1.60;
  } else {
    const otRate = isOver60h ? 1.50 : 1.25;
    const otNightRate = isOver60h ? 1.75 : 1.50;

    total += regularDay * ratePerMin * 1.00;
    total += regularNight * ratePerMin * 1.25;
    total += overtimeDay * ratePerMin * otRate;
    total += overtimeNight * ratePerMin * otNightRate;
  }

  return Math.floor(total);
}

// 指定範囲（分）のうち深夜帯（22:00-5:00）に含まれる分数を返す
function calcNightMinutes(start: number, end: number): number {
  let nightMins = 0;
  let pos = start;
  while (pos < end) {
    const dayBase = Math.floor(pos / 1440) * 1440;
    const dayOffset = pos - dayBase;
    const chunkEnd = Math.min(end, dayBase + 1440);
    const chunkEndOffset = chunkEnd - dayBase;

    // 深夜帯: 0:00-5:00 (0-300) と 22:00-24:00 (1320-1440)
    nightMins += overlap(dayOffset, chunkEndOffset, 0, NIGHT_END);
    nightMins += overlap(dayOffset, chunkEndOffset, NIGHT_START, 1440);

    pos = chunkEnd;
  }
  return nightMins;
}

function overlap(a: number, b: number, c: number, d: number): number {
  return Math.max(0, Math.min(b, d) - Math.max(a, c));
}
