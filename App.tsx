import React, { useState } from 'react';
import { FileJson, RefreshCw, Github } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import MappingEditor from './components/MappingEditor';
import JsonPreview from './components/JsonPreview';
import { ExcelData, SchemaField } from './types';

const App: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = (data: ExcelData) => {
    setExcelData(data);
    // Reset mapping fields when new file is loaded
    setFields([]);
  };

  const handleReset = () => {
    setExcelData(null);
    setFields([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
               <FileJson className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Excel 转 JSON 智能工具</h1>
          </div>
          <div className="flex items-center gap-4">
            {excelData && (
              <button 
                onClick={handleReset}
                className="flex items-center text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                重置
              </button>
            )}
             <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">v1.0.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!excelData ? (
          // Upload State
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <div className="text-center mb-8 max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">简单、智能的数据转换</h2>
              <p className="text-lg text-slate-600">
                上传您的 Excel 表格，通过简单的点击或 AI 辅助，将其转换为您需要的任何 JSON 格式。
                无需编写代码，即刻完成。
              </p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} isLoading={isLoading} />
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl text-center">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                    <div className="text-blue-500 font-bold mb-2">1. 上传</div>
                    <p className="text-sm text-slate-500">支持 .xlsx 和 .xls 格式的表格文件拖拽上传</p>
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
        ) : (
          // Workspace State
          <div className="flex flex-col space-y-6 animate-fade-in">
            {/* Data Preview Section */}
            <DataPreview data={excelData} />

            {/* Split View: Mapping Editor & JSON Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px]">
              <div className="h-full flex flex-col">
                <MappingEditor 
                  excelHeaders={excelData.headers} 
                  fields={fields} 
                  setFields={setFields} 
                />
              </div>
              <div className="h-full flex flex-col">
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
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-slate-500">
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
