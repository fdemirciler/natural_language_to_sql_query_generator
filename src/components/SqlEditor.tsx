import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Play, Terminal, Edit2, Save, X } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco, a11yDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { format as formatSQL } from 'sql-formatter';

interface SqlEditorProps {
  sql: string;
  onRun: () => void;
  onSqlChange: (newSql: string) => void;
  isLoading?: boolean;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ sql, onRun, onSqlChange, isLoading = false }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableSql, setEditableSql] = useState(sql);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditableSql(sql);
  }, [sql]);

  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editableSql, isEditing]);

  const handleCopy = () => {
    if (!sql) return;
    navigator.clipboard.writeText(isEditing ? editableSql : sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setEditableSql(formatSqlQuery(sql));
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, 0);
  };

  const handleSaveQuery = () => {
    const formattedSql = formatSqlQuery(editableSql);
    setEditableSql(formattedSql);
    setIsEditing(false);
    if (onSqlChange) {
      onSqlChange(formattedSql);
    }
  };

  const formatSqlQuery = (sqlText: string): string => {
    try {
      let result = formatSQL(sqlText, { language: 'postgresql' }) as string;

      if (result.split('\n').length < 2) {
        result = sqlText.replace(/\b(FROM|WHERE|GROUP BY|ORDER BY|HAVING|INNER JOIN|LEFT JOIN|RIGHT JOIN|JOIN|ON|VALUES|SET|LIMIT|OFFSET|UNION|RETURNING|AND|OR)\b/gi, '\n$1');
      }

      result = result.replace(/(WHERE|HAVING)([\s\S]*?)(GROUP BY|ORDER BY|LIMIT|OFFSET|$)/gi, (match: string, clause: string, conditions: string, next: string) => {
        if (!conditions) return match;
        const condLines = conditions.replace(/\s+AND\s+/gi, '\n  AND ').replace(/\s+OR\s+/gi, '\n  OR ');
        return `${clause}${condLines}${next}`;
      });

      return result;
    } catch (e) {
      return sqlText;
    }
  };

  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg mt-6 transition-colors">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
          <Terminal size={14} />
          <span>{isEditing ? 'Editing Query' : 'Generated SQL'}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                title="Edit SQL"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                title="Copy SQL"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button
                onClick={onRun}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
              >
                <Play size={12} fill="currentColor" />
                {isLoading ? 'Running...' : 'Run Query'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditableSql(sql);
                  setIsEditing(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium rounded transition-colors"
              >
                <X size={12} />
                Cancel
              </button>
              <button
                onClick={handleSaveQuery}
                className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
              >
                <Save size={12} />
                Save & Preview
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editableSql}
            onChange={(e) => setEditableSql(e.target.value)}
            className="w-full h-48 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none outline-none focus:ring-2 focus:ring-inset focus:ring-primary/50 border-none"
            spellCheck={false}
          />
        ) : (
          <div className="p-4 font-mono text-sm text-slate-700 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[5rem]">
            <SyntaxHighlighter
              language="sql"
              style={isDarkMode ? a11yDark : docco}
              customStyle={{
                background: 'transparent',
                margin: 0,
                padding: 0,
                overflow: 'visible',
                lineHeight: 'inherit',
                fontSize: 'inherit',
                fontFamily: 'inherit',
              }}
              wrapLongLines={true}
            >
              {formatSqlQuery(sql)}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlEditor;
