import React, { useState } from 'react';
import { Database, History, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { TableSchema, HistoryItem as HistoryItemType } from '../types';
import HistoryItem from './HistoryItem';
import SchemaVisualizer from './SchemaVisualizer';

interface SchemaSidebarProps {
  schema: TableSchema[];
  history: HistoryItemType[];
  isExpanded: boolean;
  toggleExpanded: (expanded: boolean) => void;
  onRestoreHistory: (item: HistoryItemType) => void;
  onNewQuery: () => void;
}

const SchemaSidebar: React.FC<SchemaSidebarProps> = ({
  schema,
  history,
  isExpanded,
  toggleExpanded,
  onRestoreHistory,
  onNewQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'history'>('schema');

  const handleTabClick = (tab: 'schema' | 'history') => {
    if (isExpanded && activeTab === tab) {
      toggleExpanded(false);
    } else {
      setActiveTab(tab);
      toggleExpanded(true);
    }
  };

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
  };

  return (
    <aside className="flex h-full bg-surface border-r border-slate-200 dark:border-slate-700 shadow-xl z-30">
      {/* Navigation Rail (Always Visible) */}
      <nav className="w-16 flex flex-col items-center py-5 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 z-50 shrink-0 overflow-visible">
        {/* Brand Icon */}
        <div className="mb-6 flex items-center justify-center pt-1">
          <div className="text-primary hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1">
            <Sparkles size={24} strokeWidth={2} />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-3 w-full px-2">
          {/* New Query Action */}
          <button
            onClick={onNewQuery}
            className="group relative p-2.5 rounded-xl transition-all duration-200 flex justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary"
            title="New Query"
          >
            <Plus size={20} />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
              New Query
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
            </div>
          </button>

          {/* Divider */}
          <div className="h-px w-8 mx-auto bg-slate-200 dark:bg-slate-800 my-1"></div>

          {/* Schema Tab Button */}
          <button
            onClick={() => handleTabClick('schema')}
            className={`group relative p-2.5 rounded-xl transition-all duration-200 flex justify-center ${activeTab === 'schema' && isExpanded
              ? 'bg-white dark:bg-slate-800 text-primary shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            title="Database Schema"
          >
            <Database size={20} />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
              Database Schema
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
            </div>
          </button>

          {/* History Tab Button */}
          <button
            onClick={() => handleTabClick('history')}
            className={`group relative p-2.5 rounded-xl transition-all duration-200 flex justify-center ${activeTab === 'history' && isExpanded
              ? 'bg-white dark:bg-slate-800 text-primary shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            title="Query History"
          >
            <History size={20} />
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
              Query History
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
            </div>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-4 w-full px-2">
          <button
            onClick={() => toggleExpanded(!isExpanded)}
            className="group relative p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex justify-center"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
              {isExpanded ? 'Collapse' : 'Expand'}
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
            </div>
          </button>
        </div>
      </nav>

      {/* Expanded Content Drawer */}
      <div
        className={`flex-1 flex flex-col bg-surface overflow-hidden transition-all duration-300 w-64 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none hidden'
          }`}
      >
        <div className="h-full flex flex-col min-w-[16rem]">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-surface shrink-0">
            <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              {activeTab === 'schema' ? (
                <>
                  <Database size={18} className="text-primary" />
                  <span>Schema</span>
                </>
              ) : (
                <>
                  <History size={18} className="text-primary" />
                  <span>History</span>
                </>
              )}
            </h2>
            <button
              onClick={() => toggleExpanded(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'schema' ? (
              <SchemaVisualizer schema={schema} />
            ) : (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center p-4">
                    <History size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">No query history yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Run some queries to see them here.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      onRestore={() => onRestoreHistory(item)}
                      onCopy={handleCopy}
                    />
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
};

export default SchemaSidebar;
