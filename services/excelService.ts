import * as XLSX from 'xlsx';
import { ExcelData } from '../types';

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
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
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Parse to JSON with header row
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawJson.length === 0) {
          reject(new Error("Excel文件为空"));
          return;
        }

        const headers = rawJson[0] as string[];
        const rowsData = XLSX.utils.sheet_to_json(worksheet, { header: headers as any });

        resolve({
          fileName: file.name,
          headers: headers.filter(h => !!h), // Filter out empty headers
          rows: rowsData as Record<string, any>[],
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
