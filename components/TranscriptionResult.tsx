import React from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface TranscriptionResultProps {
  text: string;
  isProcessing: boolean;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ text, isProcessing }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text && !isProcessing) {
    return (
      <div className="text-center text-slate-400 py-12 flex flex-col items-center">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>No transcription yet. Record or upload audio to begin.</p>
      </div>
    );
  }

  if (isProcessing && !text) {
     return (
        <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
     );
  }

  return (
    <div className="relative group bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-3xl mx-auto">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-blue-600"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="prose prose-slate max-w-none">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Transcription</h3>
        <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
          {text}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult;
