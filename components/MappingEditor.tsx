import React, { useState } from 'react';
import { Plus, Trash2, Wand2, ArrowRight } from 'lucide-react';
import { SchemaField, FieldType, ExcelData } from '../types';
import { suggestMapping } from '../services/geminiService';

interface MappingEditorProps {
  excelHeaders: string[];
  fields: SchemaField[];
  setFields: React.Dispatch<React.SetStateAction<SchemaField[]>>;
}

const MappingEditor: React.FC<MappingEditorProps> = ({ excelHeaders, fields, setFields }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        targetKey: '',
        sourceColumn: '',
        type: FieldType.STRING,
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleAiSuggest = async () => {
    if (!userPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const suggestedFields = await suggestMapping(excelHeaders, userPrompt);
      if (suggestedFields.length > 0) {
        setFields(suggestedFields);
      } else {
        setAiError("AI未能生成有效的映射，请尝试更详细的描述。");
      }
    } catch (err) {
      setAiError("AI服务请求失败，请检查API Key或网络连接。");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - Sticky for mobile scrolling */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          字段映射配置
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          定义输出JSON的结构。支持点号(.)来创建嵌套对象（例如：`user.name`）。
        </p>
      </div>

      {/* AI Assistant Section - Sticky below header */}
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 sticky top-[84px] z-10">
        <label className="block text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-indigo-600" />
          AI 智能助手
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
            placeholder="描述想要的JSON格式 (例如: '包含姓名和地址的用户')"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
          />
          <button
            onClick={handleAiSuggest}
            disabled={isAiLoading || !userPrompt.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isAiLoading ? '生成中...' : '自动生成'}
          </button>
        </div>
        {aiError && <p className="text-red-500 text-xs mt-2">{aiError}</p>}
      </div>

      {/* Mapping List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {fields.length === 0 ? (
          <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg mx-2">
            <p>暂无映射字段</p>
            <button onClick={addField} className="text-blue-600 hover:underline mt-2 text-sm">点击下方按钮添加</button>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 p-3 rounded-md border border-slate-200 group hover:border-blue-300 transition-colors">
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-slate-500 mb-1">目标 Key</label>
                <input
                  type="text"
                  value={field.targetKey}
                  onChange={(e) => updateField(field.id, { targetKey: e.target.value })}
                  placeholder="例如: userId"
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1.5"
                />
              </div>

              <ArrowRight className="hidden sm:block w-4 h-4 text-slate-400 mt-5" />

              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-slate-500 mb-1">Excel 列</label>
                <select
                  value={field.sourceColumn}
                  onChange={(e) => updateField(field.id, { sourceColumn: e.target.value })}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1.5"
                >
                  <option value="">-- 选择列 --</option>
                  {excelHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-28">
                 <label className="block text-xs font-medium text-slate-500 mb-1">类型</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1.5"
                >
                  {Object.values(FieldType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => removeField(field.id)}
                className="mt-5 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                title="删除字段"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Button - Fixed at bottom of card */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 z-10">
        <button
          onClick={addField}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加字段
        </button>
      </div>
    </div>
  );
};

export default MappingEditor;