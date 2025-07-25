import React, { useState } from 'react';
import { consultTheOracle } from '../services/geminiKitten';
import { ScarabIcon, PaperPlaneIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { Post } from '../types';

interface OracleWidgetProps {
  posts: Post[];
}

const OracleWidget: React.FC<OracleWidgetProps> = ({ posts }) => {
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setAiResponse(null);
    try {
      const result = await consultTheOracle(prompt, posts);
      setAiResponse(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to receive wisdom from the Oracle. ${e.message}`);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <section className="my-12 p-6 bg-slate-800/70 rounded-lg border border-slate-700 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <ScarabIcon className="w-8 h-8 text-accent" />
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Consult the Oracle</h2>
      </div>
      <p className="text-slate-400 mb-6">
        Seek knowledge of the currents flowing through the Genesis. Ask for a summary of the feed or to find the most impactful decrees.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1">
            Your Query
          </label>
          <textarea
            id="prompt"
            rows={2}
            className="block w-full rounded-md border-0 bg-slate-700/80 py-2 px-3 text-slate-200 ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 transition"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., What is the prevailing sentiment today?"
            aria-label="Question for the Oracle"
          />
        </div>
        <button
          onClick={handleAsk}
          disabled={isLoading || !prompt.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-sm hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-live="polite"
        >
          {isLoading ? 'Divining...' : 'Ask the Oracle'}
          {!isLoading && <PaperPlaneIcon className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="mt-6">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
      </div>

      {aiResponse && (
        <div className="mt-8 pt-6 border-t border-slate-700 animate-fade-in" aria-label="Oracle's Response">
            <div className="flex items-start gap-3">
                 <div className="flex-shrink-0">
                    <ScarabIcon className="w-6 h-6 text-accent mt-1" />
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 w-full">
                    <p className="text-slate-300 whitespace-pre-wrap">{aiResponse}</p>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};

export default OracleWidget;
