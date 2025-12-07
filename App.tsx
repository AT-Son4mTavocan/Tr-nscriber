import React, { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import TranscriptionResult from './components/TranscriptionResult';
import { transcribeAudio } from './services/geminiService';

const App: React.FC = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudioReady = useCallback(async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setTranscription('');

    try {
      const result = await transcribeAudio(blob);
      setTranscription(result);
    } catch (err) {
      console.error(err);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleClear = () => {
    setTranscription('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Gemini Scribe
            </h1>
          </div>
          <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center">
        
        <div className="w-full max-w-3xl space-y-8">
          
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Transform Speech to Text
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Record your voice or upload an audio file to instantly generate a verbatim transcription.
            </p>
          </div>

          <AudioRecorder 
            onRecordingComplete={handleAudioReady} 
            isProcessing={isProcessing}
            onClear={handleClear}
          />

          {error && (
            <div className="w-full max-w-xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="w-full">
            <TranscriptionResult 
              text={transcription} 
              isProcessing={isProcessing} 
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Gemini Audio Scribe. Built with React & Tailwind.</p>
      </footer>
    </div>
  );
};

export default App;
