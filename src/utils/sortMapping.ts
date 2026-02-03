export const mapSortToApi = (sortKey: string) => {
  const isHighFirst = [
    "highFirst",
    "supplyHigh",
    "initSupplyHigh",
    "upgradedSupplyHigh",
    "changeGrowth",
    "changeGrowthTon",
    "changeAbsolute",
    "changeAbsoluteTon",
    "ztoa",
  ].includes(sortKey);

  const order = isHighFirst ? "desc" : "asc";

  let sortBy: any = "price";
  if (sortKey.includes("changeGrowth")) sortBy = "growth24hPercent";
  else if (sortKey.includes("changeAbsolute")) sortBy = "absoluteChange";
  else if (sortKey.includes("supply")) sortBy = "supply";
  else if (sortKey.includes("initSupply")) sortBy = "initSupply";
  else if (sortKey.includes("upgradedSupply")) sortBy = "upgradedSupply";
  else if (sortKey === "atoz" || sortKey === "ztoa") sortBy = "alphabet";

  return { sortBy, order };
};
