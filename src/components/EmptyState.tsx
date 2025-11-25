import React from 'react';
import { Sparkles } from 'lucide-react';
import { EXAMPLE_QUERIES } from '../constants';

interface EmptyStateProps {
  onSelectQuery: (query: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSelectQuery }) => {
  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider pl-1">
        Try these examples
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {EXAMPLE_QUERIES.map((query, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuery(query)}
            className="p-4 text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary/50 group-hover:text-primary mt-0.5 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 text-sm group-hover:text-primary dark:group-hover:text-blue-200 transition-colors leading-relaxed">
                "{query}"
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
