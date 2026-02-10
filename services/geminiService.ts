
import { GoogleGenAI, Type } from "@google/genai";
import { ERPData } from "../types";

export class GeminiERPService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Helper to execute API calls with exponential backoff retry logic.
   * Helps mitigate transient 500/RPC errors.
   */
  private async callWithRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1500): Promise<T> {
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

  async getInsights(data: ERPData) {
    const ai = this.getClient();
    
    // Summarize data to keep payload size within safe RPC limits
    const inventoryAlerts = data.products
      .filter(p => p.stock <= p.minStockLevel)
      .slice(0, 10)
      .map(p => p.name)
      .join(', ');

    const recentSalesTotal = data.sales
      .slice(-10)
      .reduce((acc, s) => acc + s.totalAmount, 0);

    const prompt = `
      As an expert ERP Business Consultant, analyze the following business data and provide 3 key insights or automation suggestions.
      Format your response as a JSON array of objects with 'title', 'description', and 'type' (warning, info, or success).

      Data Summary:
      - Current Cash Balance: ${data.settings.currency} ${data.cashBalance}
      - Total Products: ${data.products.length}
      - Total Sales Records: ${data.sales.length}
      - Recent Inventory Alerts: ${inventoryAlerts || 'None'}
      - Total of Last 10 Sales: ${data.settings.currency} ${recentSalesTotal}
    `;

    try {
      return await this.callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["title", "description", "type"]
              }
            }
          }
        });
        return JSON.parse(response.text || '[]');
      });
    } catch (error) {
      console.error("Gemini Insights Final Error:", error);
      return [
        { title: "Service Unavailable", description: "AI analysis is currently experiencing heavy load. Please try again in a moment.", type: "warning" }
      ];
    }
  }

  async getCustomerIntelligence(data: ERPData) {
    const ai = this.getClient();
    
    // Significant reduction in payload size to prevent RPC 'code 6' or 500 errors
    // We send only essential identifiers and aggregates
    const minimalSales = data.sales.slice(-15).map(s => ({
      id: s.id,
      amount: s.totalAmount,
      customer: s.customerName || 'Walk-in',
      items: s.items.length
    }));

    const minimalProducts = data.products.slice(0, 20).map(p => ({
      name: p.name,
      category: p.category,
      price: p.price
    }));

    const prompt = `
      Analyze the following sales history and products to identify behavior patterns and upselling opportunities.
      Recent Sales (Last 15): ${JSON.stringify(minimalSales)}
      Top Products: ${JSON.stringify(minimalProducts)}

      Return a JSON object with:
      - 'segments': Array of objects with 'name', 'description', and 'potentialValue'.
      - 'upsellOpportunities': Array of objects with 'customerName', 'recommendedProduct', and 'reason'.
    `;

    try {
      return await this.callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                segments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      potentialValue: { type: Type.STRING }
                    },
                    required: ["name", "description", "potentialValue"]
                  }
                },
                upsellOpportunities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      customerName: { type: Type.STRING },
                      recommendedProduct: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["customerName", "recommendedProduct", "reason"]
                  }
                }
              },
              required: ["segments", "upsellOpportunities"]
            }
          }
        });
        return JSON.parse(response.text || '{"segments":[], "upsellOpportunities":[]}');
      });
    } catch (error) {
      console.error("Gemini Customer Intelligence Final Error:", error);
      return { 
        segments: [{ name: "Standard", description: "Regular customer base", potentialValue: "High" }], 
        upsellOpportunities: [] 
      };
    }
  }

  async predictNextMonthSales(data: ERPData) {
     const ai = this.getClient();
     const recentHistory = data.sales.slice(-20).map(s => s.totalAmount);
     const prompt = `Analyze historical sales amounts: ${recentHistory.join(', ')}. 
     Predict the total sales volume for the next 30 days based on these trends. Provide a short textual explanation (max 2 sentences).`;
     
     try {
       return await this.callWithRetry(async () => {
         const response = await ai.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: prompt
         });
         return response.text || "Prediction currently unavailable.";
       });
     } catch (error) {
       console.error("Gemini Prediction Final Error:", error);
       return "The AI engine is currently busy. Please refresh the diagnostic to generate a new forecast.";
     }
  }
}
