
import { GoogleGenAI } from "@google/genai";

export class GeminiERPService {
  getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async callWithRetry(fn, retries = 2, delay = 1500) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.warn(`Gemini API call failed, retrying... (${retries} attempts left)`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async getInsights(data) {
    const ai = this.getClient();
    const inventoryAlerts = data.products
      .filter(p => p.stock <= p.minStockLevel)
      .slice(0, 10)
      .map(p => p.name)
      .join(', ');

    const recentSalesTotal = data.sales
      .slice(-10)
      .reduce((acc, s) => acc + s.totalAmount, 0);

    const prompt = `As an expert ERP Business Consultant, analyze the following business data and provide 3 key insights. Format as JSON array of objects with 'title', 'description', and 'type'. Data: Balance ${data.cashBalance}, Alerts: ${inventoryAlerts}, Recent Sales: ${recentSalesTotal}`;

    try {
      return await this.callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
      });
    } catch (error) {
      return [{ title: "AI Offline", description: "Could not load insights.", type: "warning" }];
    }
  }

  async predictNextMonthSales(data) {
     const ai = this.getClient();
     const recentHistory = data.sales.slice(-20).map(s => s.totalAmount);
     const prompt = `Predict next 30 days sales based on these values: ${recentHistory.join(', ')}. Short summary.`;
     
     try {
       return await this.callWithRetry(async () => {
         const response = await ai.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: prompt
         });
         return response.text || "Prediction unavailable.";
       });
     } catch (error) {
       return "Engine busy.";
     }
  }
}
