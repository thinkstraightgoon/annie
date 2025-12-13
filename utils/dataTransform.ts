import { InvestmentItem, HierarchyNode } from '../types';

// Color palette for top-level categories
const CATEGORY_COLORS: Record<string, string> = {
  "A股市场": "#ef4444", // Red for A-shares (standard in China)
  "海外市场/QDII": "#3b82f6", // Blue
  "债券/固收": "#10b981", // Emerald
  "商品/黄金": "#f59e0b", // Amber
  "现金/货币基金": "#64748b", // Slate
  "其他": "#8b5cf6" // Violet
};

export const transformDataToHierarchy = (items: InvestmentItem[]): HierarchyNode => {
  const root: HierarchyNode = {
    name: "总资产",
    children: []
  };

  // Group by Category (Level 1)
  const categoryGroups = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InvestmentItem[]>);

  // Build Hierarchy
  Object.entries(categoryGroups).forEach(([categoryName, categoryItems]) => {
    
    // Group by Style (Level 2) within Category
    const styleGroups = categoryItems.reduce((acc, item) => {
      if (!acc[item.style]) {
        acc[item.style] = [];
      }
      acc[item.style].push(item);
      return acc;
    }, {} as Record<string, InvestmentItem[]>);

    const styleChildren: HierarchyNode[] = Object.entries(styleGroups).map(([styleName, styleItems]) => {
      // Create Leaves (Level 3)
      const leaves: HierarchyNode[] = styleItems.map(item => ({
        name: item.name,
        value: item.amount
      }));

      return {
        name: styleName,
        children: leaves
      };
    });

    root.children?.push({
      name: categoryName,
      color: CATEGORY_COLORS[categoryName] || CATEGORY_COLORS["其他"],
      children: styleChildren
    });
  });

  return root;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY', 
    maximumFractionDigits: 0
  }).format(value);
};