export interface ExcelData {
  fileName: string;
  headers: string[];
  rows: Record<string, any>[];
}

export enum FieldType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  ARRAY = 'Array (Split by comma)',
  DATE = 'Date',
}

export interface SchemaField {
  id: string;
  targetKey: string; // The key in the output JSON (supports dot notation like 'address.city')
  sourceColumn: string; // The header name from Excel
  type: FieldType;
  defaultValue?: string;
}

export interface MappingConfig {
  fields: SchemaField[];
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';
