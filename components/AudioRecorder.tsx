import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Trash2, Upload, AlertCircle, PlayCircle } from 'lucide-react';
import { formatDuration } from '../utils/audioHelpers';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
  onClear: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isProcessing, onClear }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        onRecordingComplete(blob);
        stopTimer();
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsVisualizerActive(true);
      startTimer();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsVisualizerActive(false);
    }
  };

  const startTimer = () => {
    setDuration(0);
    timerIntervalRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleClear = () => {
    setAudioBlob(null);
    setDuration(0);
    setError(null);
    onClear();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
        setError("Please upload a valid audio or video file.");
        return;
      }
      setAudioBlob(file);
      setError(null);
      // Hack to get duration roughly for UI or just set specific state
      setDuration(0); 
      onRecordingComplete(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 relative overflow-hidden">
        
        {/* Visualizer Background (Simplified) */}
        {isVisualizerActive && (
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex items-center justify-center">
             <div className="w-64 h-64 bg-blue-500 rounded-full animate-pulse-ring"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">
              {isRecording ? 'Listening...' : audioBlob ? 'Audio Ready' : 'Start Recording'}
            </h2>
            <p className="text-slate-500 mt-1">
              {isRecording 
                ? formatDuration(duration) 
                : audioBlob 
                  ? "Ready to transcribe" 
                  : "Tap the microphone to begin"}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="group relative flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Start Recording"
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center justify-center w-20 h-20 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 transition-all focus:outline-none focus:ring-4 focus:ring-red-200 animate-pulse"
                aria-label="Stop Recording"
              >
                <Square className="w-8 h-8 fill-current" />
              </button>
            )}

            {audioBlob && !isRecording && (
              <div className="flex flex-col items-center animate-fade-in">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <PlayCircle className="w-10 h-10 text-green-600" />
                 </div>
                 {isProcessing && <p className="text-sm text-blue-600 font-medium animate-pulse">Transcribing...</p>}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-4 w-full justify-center pt-2 border-t border-slate-100 mt-2">
             <button 
                onClick={triggerFileUpload}
                disabled={isRecording || isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
             >
               <Upload className="w-4 h-4" />
               Upload File
             </button>
             <input 
               type="file" 
               accept="audio/*,video/*" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleFileUpload}
             />

             {audioBlob && !isRecording && !isProcessing && (
                <button 
                  onClick={handleClear}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Audio
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
