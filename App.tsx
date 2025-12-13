import React, { useState } from 'react';
import { InvestmentItem, AssetCategory } from './types';
import SunburstChart from './components/SunburstChart';
import DataTable from './components/DataTable';
import { analyzePortfolio } from './services/geminiService';

// Updated initial data based on the user's provided portfolio image
// Categorized styles (Level 2) to ensure the Sunburst chart is meaningful
const INITIAL_DATA: InvestmentItem[] = [
  { 
    id: '1', 
    category: AssetCategory.OVERSEAS, 
    style: '互联网/科技', 
    name: '交银海外中国互联网 (164906)', 
    amount: 3420.00 
  },
  { 
    id: '2', 
    category: AssetCategory.A_SHARE, 
    style: '主要消费', 
    name: '易方达消费行业 (110022)', 
    amount: 2690.00 
  },
  { 
    id: '3', 
    category: AssetCategory.A_SHARE, 
    style: '医药医疗', 
    name: '华宝医疗ETF联接A (162412)', 
    amount: 324.00 
  },
  { 
    id: '4', 
    category: AssetCategory.A_SHARE, 
    style: '医药医疗', 
    name: '广发医药卫生联接A (001180)', 
    amount: 505.28 
  },
  { 
    id: '5', 
    category: AssetCategory.A_SHARE, 
    style: '科技传媒', 
    name: '广发中证传媒ETF联接A (004752)', 
    amount: 240.00 
  },
  { 
    id: '6', 
    category: AssetCategory.A_SHARE, 
    style: '主要消费', 
    name: '富国消费主题混合A (519915)', 
    amount: 319.98 
  },
  { 
    id: '7', 
    category: AssetCategory.A_SHARE, 
    style: '医药医疗', 
    name: '大摩健康产业混合A (002708)', 
    amount: 699.76 
  },
  { 
    id: '8', 
    category: AssetCategory.BONDS, 
    style: '利率债', 
    name: '广发中债1-3年国开债A (006486)', 
    amount: 100.00 
  },
  { 
    id: '9', 
    category: AssetCategory.A_SHARE, 
    style: '高端制造', 
    name: '中欧中证机器人指数A (020255)', 
    amount: 1500.00 
  },
  { 
    id: '10', 
    category: AssetCategory.A_SHARE, 
    style: '周期资源', 
    name: '嘉实中证稀土ETF联接A (011035)', 
    amount: 2000.00 
  },
];

const App: React.FC = () => {
  const [data, setData] = useState<InvestmentItem[]>(INITIAL_DATA);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis("");
    setError(null);
    try {
      const result = await analyzePortfolio(data);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || "分析过程中发生错误。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              资产透视 WealthSpectrum
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            多维度投资组合可视化分析工具
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Visualization & Analysis */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-700">资产配置旭日图 (Sunburst)</h2>
              <div className="bg-gray-50 rounded-xl p-4 flex justify-center items-center">
                 {data.length > 0 ? (
                   <SunburstChart data={data} />
                 ) : (
                   <div className="h-64 flex items-center text-gray-400">暂无数据</div>
                 )}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-center flex-wrap">
                 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> A股市场</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> 海外/QDII</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> 债券/固收</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-500"></div> 现金/货基</div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <h2 className="text-lg font-bold">AI 投资组合分析师</h2>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || data.length === 0}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      分析中...
                    </>
                  ) : (
                    "生成分析报告"
                  )}
                </button>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 min-h-[150px] backdrop-blur-sm border border-white/10">
                {error && (
                    <div className="text-red-300 text-sm bg-red-900/50 p-2 rounded border border-red-500/50">{error}</div>
                )}
                {!analysis && !isAnalyzing && !error && (
                    <p className="text-gray-300 text-sm italic">点击上方按钮，让 Gemini AI 帮您分析投资组合结构、评估风险并提供分散投资建议。</p>
                )}
                {analysis && (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Data Editor */}
          <div className="h-[600px] lg:h-auto">
             <DataTable data={data} onChange={setData} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;