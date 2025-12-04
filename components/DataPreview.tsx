import React from 'react';
import { ExcelData } from '../types';

interface DataPreviewProps {
  data: ExcelData;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  // Show max 5 rows
  const previewRows = data.rows.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700">数据源预览 ({data.fileName})</h3>
        <span className="text-xs text-slate-500">共 {data.rows.length} 行</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-medium">
            <tr>
              {data.headers.map((header) => (
                <th key={header} className="px-4 py-2 border-b whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {previewRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                {data.headers.map((header) => (
                  <td key={`${idx}-${header}`} className="px-4 py-2 max-w-xs truncate text-slate-600">
                    {String(row[header] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.rows.length > 5 && (
        <div className="px-4 py-2 text-center text-xs text-slate-400 bg-slate-50 border-t">
          仅显示前 5 条数据
        </div>
      )}
    </div>
  );
};

export default DataPreview;
