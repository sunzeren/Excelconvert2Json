import { GoogleGenAI, Type } from "@google/genai";
import { SchemaField, FieldType } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestMapping = async (
  headers: string[],
  userInstruction: string
): Promise<SchemaField[]> => {
  const ai = getClient();

  const prompt = `
    I have an Excel file with the following headers: ${JSON.stringify(headers)}.
    
    The user wants to convert this to a JSON structure described as: "${userInstruction}".
    
    If the user instruction is vague, create a best-effort logical mapping based on the headers (e.g., camelCase keys).
    Return a list of mapping fields. Each field should map a target JSON key to one of the source headers.
    
    For nested JSON, use dot notation for the targetKey (e.g., "user.address.city").
    Infer the most appropriate data type.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              targetKey: { type: Type.STRING, description: "The output JSON key (use dot notation for nesting)" },
              sourceColumn: { type: Type.STRING, description: "The exact header string from the Excel list provided" },
              type: { type: Type.STRING, enum: Object.values(FieldType), description: "The data type" }
            },
            required: ["targetKey", "sourceColumn", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawMappings = JSON.parse(text);
    
    // Validate and add IDs
    return rawMappings.map((m: any) => ({
      id: crypto.randomUUID(),
      targetKey: m.targetKey,
      sourceColumn: headers.includes(m.sourceColumn) ? m.sourceColumn : '', // Ensure valid column
      type: m.type as FieldType,
      defaultValue: ''
    }));

  } catch (error) {
    console.error("Gemini mapping error:", error);
    throw error;
  }
};
