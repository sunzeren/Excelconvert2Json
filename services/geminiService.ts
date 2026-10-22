import { SchemaField, FieldType } from '../types';

export const suggestMapping = async (
  headers: string[],
  userInstruction: string
): Promise<SchemaField[]> => {
  try {
    const response = await fetch('/api/suggest-mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ headers, userInstruction })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch from API");
    }

    const rawMappings = await response.json();
    
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
