import { useState, useRef, useEffect } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface ChatInterfaceProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSubmit, isLoading = false, error, success }) => {
  const [question, setQuestion] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [question]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
      setQuestion('');
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="space-y-4 mb-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md p-2 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-md p-2 text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your data..."
            disabled={isLoading}
            className="w-full resize-none min-h-[50px] p-4 pr-14 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-none outline-none font-normal"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              } else if (e.key === 'Enter' && e.shiftKey) {
                setTimeout(resizeTextarea, 0);
              }
            }}
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Submit question"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
