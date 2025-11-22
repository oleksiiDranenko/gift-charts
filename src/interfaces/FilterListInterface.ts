// src/types/filterTypes.ts (or wherever you keep these)

export type SortOption =
  | "highFirst" // Price: High → Low
  | "lowFirst" // Price: Low → High
  | "newest" // Release date newest first
  | "oldest" // Release date oldest first
  | "atoz" // Name A → Z
  | "ztoa" // Name Z → A
  | "supplyHigh"
  | "supplyLow"
  | "initSupplyHigh"
  | "initSupplyLow"
  | "upgradedSupplyHigh"
  | "upgradedSupplyLow"
  // ────────────────────── NEW SORT OPTIONS ──────────────────────
  | "changeGrowth" // 24h % change – best gainers first (default desc)
  | "changeGrowthAsc" // 24h % change – biggest losers first (asc)
  | "changeAbsolute" // Biggest absolute movement (±%) – default desc
  | "changeAbsoluteAsc" // Smallest movement first
  | "changeGrowthTon" // Same as changeGrowth but TON-based
  | "changeGrowthTonAsc"
  | "changeAbsoluteTon"
  | "changeAbsoluteTonAsc";

export interface FilterListInterface {
  currency: "ton" | "usd" | "stars";
  sort: SortOption;
  chosenGifts: string[];
}
