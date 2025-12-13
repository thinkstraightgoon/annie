export interface InvestmentItem {
  id: string;
  category: string; // Level 1: A股, 海外, 债券 等
  style: string;    // Level 2: 大盘, 科技, 国债 等
  name: string;     // Level 3: 具体ETF名称
  amount: number;   // 金额
}

export interface HierarchyNode {
  name: string;
  value?: number;
  children?: HierarchyNode[];
  color?: string;
}

export enum AssetCategory {
  A_SHARE = "A股市场",
  OVERSEAS = "海外市场/QDII",
  BONDS = "债券/固收",
  COMMODITIES = "商品/黄金",
  CASH = "现金/货币基金"
}