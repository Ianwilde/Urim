
export interface ScanResult {
  originalText: string;
  correctedText: string;
  spanishText?: string;
  timestamp: number;
}

export interface AutoScanResult {
  detectedLanguage: string;
  englishTranslation: string;
  clarification?: string;
  confidence: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  AUTO_SCANNING = 'AUTO_SCANNING',
  ERROR = 'ERROR'
}
