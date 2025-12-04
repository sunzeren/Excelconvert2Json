import React, { useMemo } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { ExcelData, SchemaField, FieldType } from '../types';

interface JsonPreviewProps {
  data: ExcelData | null;
  fields: SchemaField[];
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ data, fields }) => {
  const [copied, setCopied] = React.useState(false);

  // Transform Logic
  const transformedData = useMemo(() => {
    if (!data || fields.length === 0) return [];

    const setValue = (obj: any, path: string, value: any) => {
      const keys = path.split('.');
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;
    };

    const processValue = (value: any, type: FieldType) => {
      if (value === undefined || value === null) return null;
      const strVal = String(value).trim();
      
      switch (type) {
        case FieldType.NUMBER:
          const num = Number(strVal);
          return isNaN(num) ? strVal : num;
        case FieldType.BOOLEAN:
          return strVal.toLowerCase() === 'true' || strVal === '1' || strVal.toLowerCase() === 'yes';
        case FieldType.ARRAY:
          return strVal.split(/,|，/).map(s => s.trim()).filter(s => s !== '');
        case FieldType.DATE:
             // Simple pass-through, libraries like dayjs ideal for real apps
            return strVal;
        default:
          return strVal;
      }
    };

    return data.rows.map(row => {
      const newRow = {};
      fields.forEach(field => {
        if (!field.targetKey || !field.sourceColumn) return;
        const rawValue = row[field.sourceColumn];
        const processedValue = processValue(rawValue, field.type);
        setValue(newRow, field.targetKey, processedValue);
      });
      return newRow;
    });
  }, [data, fields]);

  const jsonString = useMemo(() => JSON.stringify(transformedData, null, 2), [transformedData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_data_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 rounded-lg">
        等待数据上传...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-700">JSON 结果预览</h3>
        <div className="flex gap-2">
           <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 mr-1.5 text-green-600" /> : <Copy className="w-3 h-3 mr-1.5" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download className="w-3 h-3 mr-1.5" />
            下载 JSON
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-slate-900 p-4">
        <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
          {jsonString}
        </pre>
      </div>
      <div className="px-4 py-2 bg-slate-100 text-xs text-slate-500 border-t border-slate-200">
        共生成 {transformedData.length} 个对象
      </div>
    </div>
  );
};

export default JsonPreview;
