import GiftInterface from "@/interfaces/GiftInterface";

export type SortKey =
  | "name"
  | "supply"
  | "initSupply"
  | "upgradedSupply"
  | "releaseDate"
  | "starsPrice"
  | "priceUsd"
  | "priceTon"
  | "priceChangeGrowth"
  | "priceChangeAbsolute"
  | "priceChangeGrowthTon"
  | "priceChangeAbsoluteTon";

export type SortOrder = "asc" | "desc";

export class GiftSorter {
  private gifts: GiftInterface[];

  constructor(gifts: GiftInterface[]) {
    this.gifts = gifts;
  }

  private calcPercentChange(
    current: number,
    previous: number | null | undefined
  ): number {
    if (!previous || previous <= 0) {
      return current > 0 ? Infinity : -Infinity;
    }
    return ((current - previous) / previous) * 100;
  }

  sortBy(key: SortKey, order: SortOrder = "asc"): GiftInterface[] {
    return [...this.gifts].sort((a, b) => {
      if (key === "priceChangeGrowth") {
        const changeA = this.calcPercentChange(a.priceUsd, a.usdPrice24hAgo);
        const changeB = this.calcPercentChange(b.priceUsd, b.usdPrice24hAgo);

        if (!isFinite(changeA) && !isFinite(changeB)) return 0;
        if (!isFinite(changeA)) return order === "desc" ? 1 : -1;
        if (!isFinite(changeB)) return order === "desc" ? -1 : 1;

        return order === "asc" ? changeA - changeB : changeB - changeA;
      }

      if (key === "priceChangeAbsolute") {
        const absA = Math.abs(
          this.calcPercentChange(a.priceUsd, a.usdPrice24hAgo)
        );
        const absB = Math.abs(
          this.calcPercentChange(b.priceUsd, b.usdPrice24hAgo)
        );

        if (!isFinite(absA) && !isFinite(absB)) return 0;
        if (!isFinite(absA)) return order === "desc" ? 1 : -1;
        if (!isFinite(absB)) return order === "desc" ? -1 : 1;

        return order === "asc" ? absA - absB : absB - absA;
      }

      if (key === "priceChangeGrowthTon") {
        const changeA = this.calcPercentChange(a.priceTon, a.tonPrice24hAgo);
        const changeB = this.calcPercentChange(b.priceTon, b.tonPrice24hAgo);

        if (!isFinite(changeA) && !isFinite(changeB)) return 0;
        if (!isFinite(changeA)) return order === "desc" ? 1 : -1;
        if (!isFinite(changeB)) return order === "desc" ? -1 : 1;

        return order === "asc" ? changeA - changeB : changeB - changeA;
      }

      if (key === "priceChangeAbsoluteTon") {
        const absA = Math.abs(
          this.calcPercentChange(a.priceTon, a.tonPrice24hAgo)
        );
        const absB = Math.abs(
          this.calcPercentChange(b.priceTon, b.tonPrice24hAgo)
        );

        if (!isFinite(absA) && !isFinite(absB)) return 0;
        if (!isFinite(absA)) return order === "desc" ? 1 : -1;
        if (!isFinite(absB)) return order === "desc" ? -1 : 1;

        return order === "asc" ? absA - absB : absB - absA;
      }

      const valA: any = (a as any)[key];
      const valB: any = (b as any)[key];

      if (typeof valA === "string" && typeof valB === "string") {
        const cmp = valA.localeCompare(valB, undefined, {
          sensitivity: "base",
        });
        return order === "asc" ? cmp : -cmp;
      }

      if (key === "releaseDate") {
        const timeA = new Date(valA as string).getTime();
        const timeB = new Date(valB as string).getTime();
        if (isNaN(timeA) || isNaN(timeB)) return 0;
        return order === "asc" ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return order === "asc" ? valA - valB : valB - valA;
      }

      return 0;
    });
  }

  static toggleOrder(currentOrder: SortOrder): SortOrder {
    return currentOrder === "asc" ? "desc" : "asc";
  }
}
