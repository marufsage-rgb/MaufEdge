
import { GoogleGenAI, Type } from "@google/genai";
import { ERPData } from "../types";

export class GeminiERPService {
  // Use strictly named parameter for initialization
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getInsights(data: ERPData) {
    const ai = this.getClient();
    const prompt = `
      As an expert ERP Business Consultant, analyze the following business data and provide 3 key insights or automation suggestions.
      Format your response as a JSON array of objects with 'title', 'description', and 'type' (warning, info, or success).

      Data Summary:
      - Current Cash Balance: $${data.cashBalance}
      - Total Products: ${data.products.length}
      - Total Sales Records: ${data.sales.length}
      - Inventory Alerts: ${data.products.filter(p => p.stock <= p.minStockLevel).map(p => p.name).join(', ')}
      - Recent Total Sales: $${data.sales.slice(-5).reduce((acc, s) => acc + s.totalAmount, 0)}
    `;

    try {
      // Using gemini-3-flash-preview for summarization/insight tasks as per guidelines
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
    } catch (error) {
      console.error("Gemini Insights Error:", error);
      return [];
    }
  }

  async getCustomerIntelligence(data: ERPData) {
    const ai = this.getClient();
    const prompt = `
      Analyze the following sales data and customer list to identify behavior patterns, purchase frequency, and specific upselling opportunities.
      Sales Data: ${JSON.stringify(data.sales)}
      Product List: ${JSON.stringify(data.products)}

      Return a JSON object with:
      - 'segments': Array of objects with 'name', 'description', and 'potentialValue'.
      - 'upsellOpportunities': Array of objects with 'customerName', 'recommendedProduct', and 'reason'.
    `;

    try {
      // Using gemini-3-pro-preview for complex reasoning tasks
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
    } catch (error) {
      console.error("Gemini Customer Intelligence Error:", error);
      return { segments: [], upsellOpportunities: [] };
    }
  }

  async predictNextMonthSales(data: ERPData) {
     const ai = this.getClient();
     const prompt = `Analyze historical sales: ${JSON.stringify(data.sales.slice(-20))}. 
     Predict the total sales volume for the next 30 days based on trends. Provide a short textual explanation.`;
     
     try {
       const response = await ai.models.generateContent({
         model: 'gemini-3-flash-preview',
         contents: prompt
       });
       // Correctly accessing response.text property
       return response.text;
     } catch (error) {
       return "Unable to generate prediction at this time.";
     }
  }
}
