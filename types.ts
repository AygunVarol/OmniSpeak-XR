export interface CommunicationCard {
  id: string;
  label: string;
  icon?: string; // Using generic icon names or emojis
  color: string;
  type: 'core' | 'context' | 'upload';
}

export enum AppMode {
  GRID = 'GRID',
  CAMERA = 'CAMERA',
  UPLOAD = 'UPLOAD'
}

export interface AnalysisResult {
  suggestedPhrases: string[];
  detectedObjects: string[];
}
