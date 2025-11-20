// Only gift IDs are stored – never full objects
export type SortOption =
  | "highFirst"
  | "lowFirst"
  | "newest"
  | "oldest"
  | "atoz"
  | "ztoa"
  | "supplyHigh"
  | "supplyLow"
  | "initSupplyHigh"
  | "initSupplyLow"
  | "upgradedSupplyHigh"
  | "upgradedSupplyLow";

export interface FilterListInterface {
  currency: "ton" | "usd" | "stars";
  sort: SortOption;
  chosenGifts: string[];
}
