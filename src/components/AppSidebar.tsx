import { useState } from "react";
import { Upload, FileCode2, CheckCircle, AlertCircle, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelInfo } from "@/types/classification";

interface AppSidebarProps {
  model: ModelInfo | null;
  onModelSelect: (model: ModelInfo) => void;
  isModelLoading: boolean;
}

export function AppSidebar({ model, onModelSelect, isModelLoading }: AppSidebarProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.h5')) {
      onModelSelect({ name: file.name, file, loaded: false });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.h5')) {
      onModelSelect({ name: file.name, file, loaded: false });
    }
  };

  return (
    <aside className="w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">DocClassifier</h1>
            <p className="text-xs text-muted-foreground">ID Document Analysis</p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-6 flex-1">
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          Model Configuration
        </h2>

        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
            ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}
          `}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".h5"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <FileCode2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Select .h5 Model</p>
              <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse</p>
            </div>
          </div>
        </div>

        {/* Model Status */}
        {model && (
          <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-start gap-3">
              {isModelLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin mt-0.5" />
              ) : model.loaded ? (
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{model.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isModelLoading ? 'Loading model...' : model.loaded ? 'Model ready' : 'Pending load'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">
          <p>Supports Keras .h5 models</p>
          <p className="mt-1">for Aadhar & PAN classification</p>
        </div>
      </div>
    </aside>
  );
}
