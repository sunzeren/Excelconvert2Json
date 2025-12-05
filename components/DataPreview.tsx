import React from 'react';
import { Table, Layers, ChevronDown, ListStart, FileSpreadsheet } from 'lucide-react';
import { ExcelData } from '../types';

interface DataPreviewProps {
  data: ExcelData;
  sheetNames: string[];
  selectedSheet: string;
  onSheetChange: (sheet: string) => void;
  headerRowIndex: number;
  onHeaderRowChange: (index: number) => void;
  isLoading?: boolean;
}

const DataPreview: React.FC<DataPreviewProps> = ({ 
  data, 
  sheetNames, 
  selectedSheet, 
  onSheetChange,
  headerRowIndex,
  onHeaderRowChange,
  isLoading = false
}) => {
  // Show max 5 rows
  const previewRows = data.rows.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden flex flex-col relative transition-all duration-200">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
           <div className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full border border-blue-100">
             <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-b-transparent"></div>
             <span className="text-sm font-medium text-blue-600">加载数据中...</span>
           </div>
        </div>
      )}

      {/* Configuration Toolbar */}
      <div className="px-5 py-4 bg-white border-b border-slate-200 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg">
                <Table className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h3 className="font-semibold text-slate-800">数据源配置</h3>
                <p className="text-xs text-slate-400 mt-0.5">选择工作表并定义表头位置</p>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 text-sm">
             {/* Sheet Selector */}
             <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label htmlFor="sheet-select" className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    工作表
                </label>
                <div className="relative group">
                    <select 
                        id="sheet-select"
                        value={selectedSheet}
                        onChange={(e) => onSheetChange(e.target.value)}
                        className="appearance-none block w-full sm:w-48 pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none hover:border-blue-400 transition-colors cursor-pointer text-slate-700 font-medium"
                    >
                        {sheetNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                </div>
            </div>

            {/* Header Row Input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label 
                    htmlFor="header-row" 
                    className="text-slate-500 font-medium flex items-center gap-1.5 cursor-help group" 
                    title="指定Excel中的哪一行作为表头（列名），该行之前的数据将被忽略。"
                >
                    <ListStart className="w-4 h-4" />
                    表头行号 <span className="text-xs text-slate-400 font-normal">(定义列名)</span>
                </label>
                <div className="flex items-center gap-2">
                    <input 
                        id="header-row"
                        type="number" 
                        min="1"
                        value={headerRowIndex + 1}
                        onChange={(e) => onHeaderRowChange(Math.max(0, parseInt(e.target.value || '1') - 1))}
                        className="w-20 pl-3 pr-2 py-2 text-sm text-center bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none hover:border-blue-400 transition-colors font-medium text-slate-700"
                    />
                    <div className="flex flex-col text-[10px] text-slate-400 leading-tight">
                        <span>当前: 第 {headerRowIndex + 1} 行</span>
                        <span>跳过: {headerRowIndex} 行</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-50/50 min-h-[160px]">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
              {data.headers.length > 0 ? (
                  data.headers.map((header, i) => (
                    <th key={`${header}-${i}`} className="px-4 py-2.5 font-semibold whitespace-nowrap first:pl-6 last:pr-6">
                      <div className="flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3 text-slate-400" />
                          {header}
                      </div>
                    </th>
                  ))
              ) : (
                  <th className="px-6 py-4 text-slate-400 italic font-normal text-center bg-slate-50">
                      未检测到有效表头，请调整“表头行号”
                  </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {previewRows.length > 0 ? (
                previewRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                    {data.headers.map((header, i) => (
                    <td key={`${idx}-${header}-${i}`} className="px-4 py-2.5 max-w-xs truncate text-slate-600 first:pl-6 last:pr-6 border-r border-transparent group-hover:border-blue-100 last:border-r-0">
                        {String(row[header] ?? '')}
                    </td>
                    ))}
                </tr>
                ))
            ) : (
                 <tr>
                    <td colSpan={data.headers.length || 1} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                             <Table className="w-8 h-8 mb-2 opacity-20" />
                             <p>暂无数据行</p>
                             <p className="text-xs mt-1">请检查“表头行号”是否设置正确</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      {data.rows.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>仅预览前 5 条数据</span>
          <span className="font-medium">共 {data.rows.length} 条数据</span>
        </div>
      )}
    </div>
  );
};

export default DataPreview;