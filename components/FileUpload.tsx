import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { readExcelWorkbook } from '../services/excelService';

interface FileUploadProps {
  onWorkbookLoaded: (workbook: XLSX.WorkBook, fileName: string) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onWorkbookLoaded, isLoading }) => {
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Just read the workbook, don't parse specific sheet yet
        const workbook = await readExcelWorkbook(file);
        onWorkbookLoaded(workbook, file.name);
      } catch (error) {
        console.error("Read error:", error);
        alert("读取Excel文件失败，请确保格式正确。");
      }
    }
  }, [onWorkbookLoaded]);

  return (
    <div className="w-full max-w-xl mx-auto mt-10 p-8 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors text-center shadow-sm">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-blue-100 rounded-full">
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <FileSpreadsheet className="w-10 h-10 text-blue-600" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800">上传 Excel 文件</h3>
          <p className="text-slate-500 mt-2">支持 .xlsx, .xls 格式</p>
        </div>
        
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md active:transform active:scale-95">
          <span>选择文件</span>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUpload;