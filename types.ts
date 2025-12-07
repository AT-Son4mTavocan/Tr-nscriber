export interface TranscriptionState {
  text: string;
  isProcessing: boolean;
  error: string | null;
}

export interface AudioRecordingState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number; // in seconds
}

export enum TranscriptionStatus {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
