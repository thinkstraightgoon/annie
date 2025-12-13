import React from 'react';
import { InvestmentItem, AssetCategory } from '../types';
import { formatCurrency } from '../utils/dataTransform';

interface DataTableProps {
  data: InvestmentItem[];
  onChange: (newData: InvestmentItem[]) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onChange }) => {

  const handleUpdate = (id: string, field: keyof InvestmentItem, value: string | number) => {
    const newData = data.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newData);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter(item => item.id !== id));
  };

  const handleAddRow = () => {
    const newItem: InvestmentItem = {
      id: Date.now().toString(),
      category: AssetCategory.A_SHARE,
      style: "大盘/价值",
      name: "新基金",
      amount: 0
    };
    onChange([...data, newItem]);
  };

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">持仓明细</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            总计: {formatCurrency(total)}
        </span>
      </div>
      
      <div className="overflow-auto flex-1 custom-scrollbar p-2">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
              <th scope="col" className="px-3 py-3 rounded-tl-lg">资产类别 (内圈)</th>
              <th scope="col" className="px-3 py-3">风格/行业 (中圈)</th>
              <th scope="col" className="px-3 py-3">具体标的 (外圈)</th>
              <th scope="col" className="px-3 py-3">金额 (¥)</th>
              <th scope="col" className="px-3 py-3 rounded-tr-lg">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2">
                  <select
                    value={item.category}
                    onChange={(e) => handleUpdate(item.id, 'category', e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                  >
                    {Object.values(AssetCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={item.style}
                    onChange={(e) => handleUpdate(item.id, 'style', e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                    placeholder="例如：科技、大盘"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                    placeholder="例如：沪深300 ETF"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleUpdate(item.id, 'amount', Number(e.target.value))}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 text-right font-mono"
                    min="0"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
            onClick={handleAddRow}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 font-medium"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            添加新持仓
        </button>
      </div>
    </div>
  );
};

export default DataTable;