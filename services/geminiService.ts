import { GoogleGenAI } from "@google/genai";
import { InvestmentItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePortfolio = async (data: InvestmentItem[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  // Create a summary text to save tokens/make it easier for model
  const portfolioSummary = data.map(d => 
    `- 类型: ${d.category}, 风格: ${d.style}, 名称: ${d.name}, 金额: ${d.amount}`
  ).join('\n');

  const prompt = `
    你是一位专业的中国理财顾问。请分析以下用户的投资组合数据。
    
    数据:
    ${portfolioSummary}

    请提供一份简洁的Markdown格式分析报告，包含以下内容：
    1. **资产配置分析**: 在A股、海外市场、固收等方面的分散程度如何？
    2. **风险评估**: 整体风险等级（高/中/低），主要风险点在哪？
    3. **主要观察**: 是否存在行业集中度过高的问题（例如过度集中在医药或白酒）？
    4. **优化建议**: 1-2 条具体的平衡建议（例如“考虑增加债券比例以降低波动”）。
    
    保持语气专业且易懂，适合中国投资者阅读。字数控制在300字以内。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "无法生成分析报告。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("分析失败，请稍后重试。");
  }
};