import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Table as TableIcon, Columns } from 'lucide-react';
import { TableSchema } from '../types';

interface SchemaVisualizerProps {
  schema: TableSchema[];
}

const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ schema }) => {
  const [expandedTable, setExpandedTable] = useState<string | null>(schema[0]?.name || null);

  const toggleTable = (tableName: string) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };

  return (
    <div className="space-y-1">
      {schema.map((table) => (
        <div key={table.name} className="rounded-lg overflow-hidden border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 transition-colors">
          <button
            onClick={() => toggleTable(table.name)}
            className={`w-full flex items-center justify-between p-3 text-sm font-medium transition-colors ${expandedTable === table.name
                ? 'bg-slate-100 dark:bg-slate-800 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <TableIcon
                size={15}
                className={expandedTable === table.name ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}
              />
              <span>{table.name}</span>
            </div>
            {expandedTable === table.name ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {expandedTable === table.name && (
            <div className="bg-slate-50 dark:bg-slate-900/30 px-3 py-2 space-y-0.5 border-t border-slate-200 dark:border-slate-700/30">
              {table.columns.map((col) => (
                <div
                  key={col.name}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800/50 group cursor-default"
                >
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">
                    <Columns size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-500" />
                    <span className="font-mono">{col.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-600 font-mono text-[10px] bg-slate-200 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700/50">
                    {col.data_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SchemaVisualizer;
