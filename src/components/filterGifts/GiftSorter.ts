import GiftInterface from "@/interfaces/GiftInterface";

export type SortKey =
  | "name"
  | "supply"
  | "initSupply"
  | "upgradedSupply"
  | "releaseDate"
  | "starsPrice"
  | "priceUsd"
  | "priceTon";

export type SortOrder = "asc" | "desc";

export class GiftSorter {
  private gifts: GiftInterface[];

  constructor(gifts: GiftInterface[]) {
    this.gifts = gifts;
  }

  /**
   * Sort gifts by key and order
   * @param key - field to sort by
   * @param order - ascending ('asc') or descending ('desc')
   * @returns sorted array of gifts (new array, original is not mutated)
   */
  sortBy(key: SortKey, order: SortOrder = "asc"): GiftInterface[] {
    const sorted = [...this.gifts].sort((a, b) => {
      let valA: any = a[key];
      let valB: any = b[key];

      // Handle string comparison (case-insensitive)
      if (typeof valA === "string" && typeof valB === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      }

      // Handle dates
      if (key === "releaseDate") {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Handle numbers
      if (typeof valA === "number" && typeof valB === "number") {
        return order === "asc" ? valA - valB : valB - valA;
      }

      return 0;
    });

    return sorted;
  }

  /**
   * Toggles sort order
   * @param currentOrder - current sort order
   * @returns toggled sort order
   */
  static toggleOrder(currentOrder: SortOrder): SortOrder {
    return currentOrder === "asc" ? "desc" : "asc";
  }
}
