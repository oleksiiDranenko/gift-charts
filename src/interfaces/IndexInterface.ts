export interface IndexInterface {
  _id: string;
  name: string;
  shortName: string;
  description: string;
  valueType: string;
  tonPrice: number;
  tonPrice24hAgo: number;
  usdPrice: number;
  usdPrice24hAgo: number;
  orderIndex: number;
}
