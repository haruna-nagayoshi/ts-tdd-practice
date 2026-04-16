type Rank = "normal" | "silver" | "gold";

const MULTIPLIER: Record<Rank, { normal: number; birth: number }> = {
  normal: { normal: 1, birth: 2 },
  silver: { normal: 2, birth: 4 },
  gold:   { normal: 3, birth: 6 },
};

export function calcPoint(price: number, rank: Rank, isBirthMonth: boolean): number {
  const multiplier = isBirthMonth
    ? MULTIPLIER[rank].birth
    : MULTIPLIER[rank].normal;
  return Math.floor(price * multiplier * 0.01);
}
