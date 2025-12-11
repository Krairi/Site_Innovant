import { GoogleGenAI, Type } from "@google/genai";

// Access the API key from environment variables
// Note: This requires the user to have VITE_GEMINI_API_KEY or REACT_APP_GEMINI_API_KEY set,
// or conventionally process.env.API_KEY if using a bundler that supports it.
// For this demo, we assume the environment variable is injected.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const parseReceiptImage = async (base64Image: string): Promise<any[]> => {
  if (!apiKey) {
    console.warn("Gemini API Key missing. Returning mock data.");
    return [
      { name: "Pommes", quantity: 6, expiry_date: "2024-06-01", category: "Fruits & Légumes" },
      { name: "Lait", quantity: 2, expiry_date: "2024-05-20", category: "Produits Laitiers" }
    ];
  }

  try {
    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash-image', // Using efficient vision model
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this image (receipt or product). Return a JSON array of products identified. Each object must have: name (string), quantity (number), expiry_date (string YYYY-MM-DD, estimate 1 week from now if not visible), category (string)."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              expiry_date: { type: Type.STRING },
              category: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    return [];

  } catch (error) {
    console.error("Error parsing receipt with Gemini:", error);
    return [];
  }
};

export const getSmartSuggestions = async (
  inventory: any[], 
  transportMode: string
): Promise<string[]> => {
  if (!apiKey) return ["Pâtes", "Sauce Tomate", "Fromage râpé"];

  try {
    const inventoryList = inventory.map(i => `${i.name} (${i.quantity})`).join(", ");
    
    const prompt = `
      Current Inventory: ${inventoryList}.
      Transport Mode: ${transportMode}.
      
      Suggest 5 items to buy. Consider the transport mode (e.g., if 'bike' or 'walk', avoid heavy items like large water packs unless necessary).
      Return ONLY a JSON array of strings (product names).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
         responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
         }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return ["Erreur suggestion"];
  }
};