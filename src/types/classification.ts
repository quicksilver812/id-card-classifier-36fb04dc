export interface ClassificationResult {
  id: string;
  filename: string;
  imageUrl: string;
  classification: 'aadhar' | 'pancard';
  confidence: number;
}

export interface ModelInfo {
  name: string;
  file: File;
  loaded: boolean;
}
