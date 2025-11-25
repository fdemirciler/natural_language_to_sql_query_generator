import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Sun, Moon, Github } from 'lucide-react';
import SchemaSidebar from '../components/SchemaSidebar';
import ChatInterface from '../components/ChatInterface';
import SqlEditor from '../components/SqlEditor';
import ResultsView from '../components/ResultsView';
import EmptyState from '../components/EmptyState';
import { useColorMode } from '../utils/hooks';
import { TableSchema, HistoryItem, LoadingState } from '../types';
import { getSchema } from '../utils/schema';

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    async function loadSchema() {
      try {
        const schemaData = await getSchema();
        setSchema(schemaData);
      } catch (err) {
        console.error('Error loading schema:', err);
        setError('Failed to load database schema');
      }
    }

    loadSchema();
  }, []);

  const addToHistory = useCallback((questionText: string, sql: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      prompt: questionText,
      sql,
      timestamp: Date.now(),
      rowCount: 0,
    };
    setHistory((prev) => [newItem, ...prev]);
  }, []);

  const handleQuestionSubmit = async (questionText: string) => {
    setLoadingState(LoadingState.GENERATING_SQL);
    setError(null);
    setResults([]);
    setSqlQuery('');
    setExplanation(null);

    try {
      const response = await fetch('/api/generate-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          schema: schema,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate SQL');
      }

      const data = await response.json();
      setSqlQuery(data.sqlQuery);
      addToHistory(questionText, data.sqlQuery);

      // Auto-execute query
      await executeQuery(data.sqlQuery);
    } catch (err: any) {
      console.error('Error generating SQL:', err);
      setError(err.message || 'Failed to generate SQL');
      setLoadingState(LoadingState.ERROR);
    }
  };

  const executeQuery = async (sql: string) => {
    setLoadingState(LoadingState.EXECUTING_QUERY);
    setError(null);

    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sqlQuery: sql }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute SQL');
      }

      const data = await response.json();
      setResults(data.results.data || []);
      setLoadingState(LoadingState.SUCCESS);

      // Update history with row count
      setHistory((prev) =>
        prev.map((item) =>
          item.id === history[0]?.id
            ? { ...item, rowCount: data.results.data?.length || 0 }
            : item
        )
      );
    } catch (err: any) {
      console.error('Error executing SQL:', err);
      setError(err.message || 'Failed to execute query');
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSqlUpdate = (newSql: string) => {
    setSqlQuery(newSql);
  };

  const handleSuggestionClick = (query: string) => {
    handleQuestionSubmit(query);
  };

  const handleLoadQuery = useCallback(
    (item: HistoryItem) => {
      setSqlQuery(item.sql);
      setResults([]);
      setError(null);
      setLoadingState(LoadingState.IDLE);
      setExplanation(null);
    },
    []
  );

  const handleReset = () => {
    setSqlQuery('');
    setResults([]);
    setError(null);
    setExplanation(null);
    setLoadingState(LoadingState.IDLE);
  };

  return (
    <>
      <Head>
        <title>Natural Language to SQL Query Generator</title>
        <meta name="description" content="Ask questions about your data in plain English" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-background text-slate-900 dark:text-slate-200 overflow-hidden font-sans transition-colors duration-300">
        {/* Sidebar */}
        <div
          className={`${isSidebarExpanded ? 'w-80' : 'w-16'
            } transition-all duration-300 ease-in-out flex-shrink-0 relative z-30`}
        >
          <SchemaSidebar
            schema={schema}
            history={history}
            isExpanded={isSidebarExpanded}
            toggleExpanded={setIsSidebarExpanded}
            onRestoreHistory={handleLoadQuery}
            onNewQuery={handleReset}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-center px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 transition-colors relative">
            <button
              onClick={handleReset}
              className="font-semibold text-lg tracking-tight hidden md:block hover:text-primary transition-colors text-slate-900 dark:text-white"
            >
              Natural Language to SQL Query Generator
            </button>
            <div className="absolute right-6 flex items-center gap-1">
              <button
                onClick={toggleColorMode}
                className="group relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {colorMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              <a
                href="https://github.com/fdemirciler/natural_language_to_sql_query_generator"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Github size={20} />
                <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  View on GitHub
                </span>
              </a>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full pb-20">
              {/* Intro Text */}
              <div className="mb-8 space-y-4">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ask questions about your data in plain English. AI understands your intent, writes the SQL query, and the app
                  runs the query securely on the database. The model only sees your schema, never your data.
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Fully secure, authenticated, and ready for any connected database. Explore it on the sample{' '}
                  <a
                    href="https://www.postgresql.org/ftp/projects/pgFoundry/dbsamples/world/world-1.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    World cities
                  </a>
                  {' '}PostgreSQL database.
                </p>
              </div>

              {/* Chat Interface */}
              <ChatInterface
                onSubmit={handleQuestionSubmit}
                isLoading={loadingState === LoadingState.GENERATING_SQL}
                error={error}
              />

              {/* Error Message */}
              {error && loadingState !== LoadingState.GENERATING_SQL && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 mt-6">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Empty State */}
              {loadingState === LoadingState.IDLE && !sqlQuery && <EmptyState onSelectQuery={handleSuggestionClick} />}

              {/* Active Query View */}
              {(sqlQuery || loadingState === LoadingState.EXECUTING_QUERY) && (
                <div className="space-y-6 mt-6">
                  {explanation && (
                    <div className="text-slate-500 dark:text-slate-400 text-sm italic ml-1 border-l-2 border-slate-300 dark:border-slate-700 pl-3 py-1">
                      AI Note: {explanation}
                    </div>
                  )}

                  <SqlEditor
                    sql={sqlQuery}
                    onRun={() => executeQuery(sqlQuery)}
                    onSqlChange={handleSqlUpdate}
                    isLoading={loadingState === LoadingState.EXECUTING_QUERY}
                  />

                  {loadingState === LoadingState.EXECUTING_QUERY && (
                    <div className="h-64 w-full bg-surface rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                      <span className="text-sm font-medium animate-pulse">Executing Query on Database...</span>
                    </div>
                  )}

                  {loadingState === LoadingState.SUCCESS && results.length > 0 && <ResultsView data={results} />}

                  {loadingState === LoadingState.SUCCESS && results.length === 0 && (
                    <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500">
                      No results found for this query.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
