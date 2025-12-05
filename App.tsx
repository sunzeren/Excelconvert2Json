import React, { useState, useEffect } from 'react';
import { FileJson, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import MappingEditor from './components/MappingEditor';
import JsonPreview from './components/JsonPreview';
import { ExcelData, SchemaField } from './types';
import { parseSheet } from './services/excelService';

const App: React.FC = () => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  
  // Parsing Configuration State
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0); // 0-based index

  const [fields, setFields] = useState<SchemaField[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle file read (Workbook loaded)
  const handleWorkbookLoaded = (wb: XLSX.WorkBook, name: string) => {
    setWorkbook(wb);
    setFileName(name);
    
    // Default settings
    const firstSheet = wb.SheetNames[0];
    setSelectedSheet(firstSheet);
    setHeaderRowIndex(0); // Default to first row as header
    setFields([]); // Reset mapping
  };

  // Effect to re-parse data when workbook, sheet, or header row changes
  useEffect(() => {
    if (workbook && selectedSheet) {
      setIsLoading(true);
      try {
        // Use timeout to allow UI to render loading state if dataset is large
        setTimeout(() => {
            const data = parseSheet(workbook, selectedSheet, headerRowIndex, fileName);
            setExcelData(data);
            setIsLoading(false);
        }, 10);
      } catch (e) {
        console.error("Parsing error", e);
        setIsLoading(false);
      }
    } else {
        setExcelData(null);
    }
  }, [workbook, selectedSheet, headerRowIndex, fileName]);


  const handleReset = () => {
    setWorkbook(null);
    setExcelData(null);
    setFields([]);
    setFileName("");
  };

  return (
    // Use h-screen and overflow-hidden on LG screens to create a fixed "App-like" layout
    // On small screens, behave like a normal scrollable page
    <div className="min-h-screen lg:h-screen flex flex-col bg-slate-50 lg:overflow-hidden font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
               <FileJson className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Excel 转 JSON 智能工具</h1>
          </div>
          <div className="flex items-center gap-4">
            {workbook && (
              <button 
                onClick={handleReset}
                className="flex items-center text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                重置
              </button>
            )}
             <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">v1.1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto lg:overflow-hidden">
        {!workbook ? (
          // Upload State (Scrollable)
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-8 max-w-2xl">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">简单、智能的数据转换</h2>
                <p className="text-lg text-slate-600">
                    上传您的 Excel 表格，通过简单的点击或 AI 辅助，将其转换为您需要的任何 JSON 格式。
                    无需编写代码，即刻完成。
                </p>
                </div>
                <FileUpload onWorkbookLoaded={handleWorkbookLoaded} isLoading={isLoading} />
                
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl text-center">
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                        <div className="text-blue-500 font-bold mb-2">1. 上传</div>
                        <p className="text-sm text-slate-500">支持多Sheet选择，自定义表头行数，灵活适应各种表格格式</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                        <div className="text-indigo-500 font-bold mb-2">2. 映射</div>
                        <p className="text-sm text-slate-500">手动选择列或描述需求让 AI 自动生成字段结构</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                        <div className="text-green-500 font-bold mb-2">3. 导出</div>
                        <p className="text-sm text-slate-500">实时预览转换结果，一键复制或下载 JSON 文件</p>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          // Workspace State
          // LG: Fixed layout with flex column
          // Mobile: Default flow
          <div className="flex-1 flex flex-col lg:overflow-hidden px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
            
            {/* Data Preview: Fixed height-ish but flexible */}
            <div className="flex-shrink-0">
                {excelData && (
                    <DataPreview 
                        data={excelData} 
                        sheetNames={workbook.SheetNames || []}
                        selectedSheet={selectedSheet}
                        onSheetChange={setSelectedSheet}
                        headerRowIndex={headerRowIndex}
                        onHeaderRowChange={setHeaderRowIndex}
                        isLoading={isLoading}
                    />
                )}
            </div>

            {/* Split View: Mapping Editor & JSON Preview */}
            {/* On LG: flex-1 min-h-0 allows it to take remaining space and scroll internally */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] lg:min-h-0 pb-6 lg:pb-0">
              <div className="h-full flex flex-col min-h-0 overflow-hidden rounded-lg shadow border border-slate-200 bg-white">
                <MappingEditor 
                  excelHeaders={excelData?.headers || []} 
                  fields={fields} 
                  setFields={setFields} 
                />
              </div>
              <div className="h-full flex flex-col min-h-0 overflow-hidden rounded-lg shadow border border-slate-200 bg-white">
                <JsonPreview 
                  data={excelData} 
                  fields={fields} 
                />
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 flex-shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-sm text-slate-500">
          <p>© 2024 Excel2JSON Pro. All rights reserved.</p>
          <div className="flex items-center gap-2">
             Powered by React & Gemini AI
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;