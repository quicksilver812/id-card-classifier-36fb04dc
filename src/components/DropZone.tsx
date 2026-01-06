import { useState } from "react";
import { Upload, FileArchive, Loader2 } from "lucide-react";

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  isProcessing: boolean;
  disabled: boolean;
}

export function DropZone({ onFileDrop, isProcessing, disabled }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || isProcessing) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      onFileDrop(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      onFileDrop(file);
    }
  };

  return (
    <div
      className={`
        relative w-full max-w-2xl mx-auto rounded-2xl border-2 border-dashed p-12 
        transition-all duration-300 ease-out
        ${disabled ? 'opacity-50 cursor-not-allowed border-muted' : 
          dragOver ? 'border-primary bg-primary/5 scale-[1.02] glow-primary' : 
          'border-border hover:border-primary/50 hover:bg-secondary/30'}
        ${isProcessing ? 'pointer-events-none' : ''}
      `}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        disabled={disabled || isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="flex flex-col items-center gap-6 text-center">
        {isProcessing ? (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Processing Documents...</h3>
              <p className="text-muted-foreground mt-2">Extracting and classifying images</p>
            </div>
          </>
        ) : (
          <>
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
              ${dragOver ? 'bg-primary/20 scale-110' : 'bg-secondary'}
            `}>
              {dragOver ? (
                <Upload className="w-10 h-10 text-primary" />
              ) : (
                <FileArchive className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {disabled ? 'Load a model first' : 'Drop your ZIP file here'}
              </h3>
              <p className="text-muted-foreground mt-2">
                {disabled 
                  ? 'Select a .h5 model from the sidebar to begin'
                  : 'or click to browse • Contains images to classify'}
              </p>
            </div>
            {!disabled && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-aadhar" />
                  Aadhar
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-pancard" />
                  PAN Card
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
