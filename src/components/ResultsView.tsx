import React, { useState, useMemo, useEffect } from 'react';
import { Download, ArrowUpDown, ArrowUp, ArrowDown, Database, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResultsViewProps {
  data: any[];
}

type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc';
};

const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  }, [data]);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortConfig.key!];
      const valB = b[sortConfig.key!];

      if (valA < valB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedData.length);
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const downloadCsv = () => {
    const headers = columns.join(',');
    const rows = sortedData
      .map((row) =>
        columns
          .map((col) => {
            let val = row[col];
            if (val === null || val === undefined) return '';
            val = val.toString().replace(/"/g, '""');
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              val = `"${val}"`;
            }
            return val;
          })
          .join(',')
      )
      .join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden mt-6 transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold text-sm">
          <Database size={16} className="text-primary" />
          <span>Query Result</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {data.length} rows
          </span>
        </div>

        <button
          onClick={downloadCsv}
          className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[150px]">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none group"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-2">
                    {col.replace(/_/g, ' ')}
                    <span className="text-slate-400 group-hover:text-primary">
                      {sortConfig.key === col ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {currentData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                {columns.map((col) => (
                  <td key={`${i}-${col}`} className="px-6 py-3 whitespace-nowrap">
                    {row[col]?.toString() || 'null'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 ? (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Showing <span className="font-medium text-slate-900 dark:text-slate-200">{startIndex + 1}</span> to{' '}
            <span className="font-medium text-slate-900 dark:text-slate-200">{endIndex}</span> of{' '}
            <span className="font-medium text-slate-900 dark:text-slate-200">{sortedData.length}</span> results
          </div>

          <div className="flex items-center gap-4 mx-auto sm:mx-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 text-right">
          Total {sortedData.length} results
        </div>
      )}
    </div>
  );
};

export default ResultsView;
