import React, { useState } from 'react';
import { Copy, Play } from 'lucide-react';
import { HistoryItem as HistoryItemType } from '../types';

interface HistoryItemProps {
  item: HistoryItemType;
  onRestore: (item: HistoryItemType) => void;
  onCopy: (sql: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onRestore, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(item.sql);
    navigator.clipboard.writeText(item.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestore = () => {
    onRestore(item);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div
      onClick={handleRestore}
      className="group bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-3 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {item.prompt}
        </p>
        <span className="text-[10px] text-slate-500 font-mono shrink-0 whitespace-nowrap mt-0.5">
          {formatTime(item.timestamp)}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-950/50 rounded-md p-2 mb-2 font-mono text-[10px] text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap border border-slate-200 dark:border-slate-800">
        {item.sql}
      </div>

      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-[10px] font-medium"
          title="Copy SQL"
        >
          {copied ? (
            <span className="text-green-500">Copied</span>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
        <button
          onClick={handleRestore}
          className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white text-[10px] font-medium rounded-lg transition-all"
          title="Run Again"
        >
          <Play size={10} fill="currentColor" />
          Run Again
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;
