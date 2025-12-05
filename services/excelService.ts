import * as XLSX from 'xlsx';
import { ExcelData } from '../types';

export const readExcelWorkbook = (file: File): Promise<XLSX.WorkBook> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("文件读取失败"));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        resolve(workbook);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const parseSheet = (
  workbook: XLSX.WorkBook, 
  sheetName: string, 
  headerRowIndex: number = 0, // 0-based index
  fileName: string = ""
): ExcelData => {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  // Parse all data as array of arrays
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  if (rawData.length <= headerRowIndex) {
    return {
      fileName,
      headers: [],
      rows: []
    };
  }

  // Extract headers and data based on the index
  const headers = rawData[headerRowIndex].map(h => String(h ?? '')).filter(h => h !== '');
  const rawRows = rawData.slice(headerRowIndex + 1);

  // Map rows to objects using headers
  const rows = rawRows.map((row) => {
    const rowObj: Record<string, any> = {};
    const headerRowData = rawData[headerRowIndex];
    
    headerRowData.forEach((h, colIndex) => {
        const headerName = String(h ?? '').trim();
        if (headerName) {
            rowObj[headerName] = row[colIndex];
        }
    });
    return rowObj;
  });

  return {
    fileName,
    headers,
    rows,
  };
};

// Keep original for backward compatibility if needed, but we will mostly use the new ones
export const parseExcelFile = async (file: File): Promise<ExcelData> => {
    const workbook = await readExcelWorkbook(file);
    const sheetName = workbook.SheetNames[0];
    return parseSheet(workbook, sheetName, 0, file.name);
};
