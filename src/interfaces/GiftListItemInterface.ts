export interface GiftListItemInterface {
  _id: string;
  name: string;
  image: string;
  upgradedSupply: number;
  supply: number;

  // Prices for the selected currency
  prices: {
    current: number; // current price in selected currency
    h24: number; // price 24h ago
    d7: number; // price 7 days ago
    d30: number; // price 30 days ago
  };

  // Last 48 week chart data points (oldest → newest)
  chartData: {
    price: number;
    createdAt: string; // ISO string from MongoDB
  }[];
}
