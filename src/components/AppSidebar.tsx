import { useState } from "react";
import { Upload, FileCode2, CheckCircle, AlertCircle, Cpu, ChevronLeft, ChevronRight, Download, FolderArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelInfo, ClassificationResult } from "@/types/classification";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/hooks/use-toast";

interface AppSidebarProps {
  model: ModelInfo | null;
  onModelSelect: (model: ModelInfo) => void;
  isModelLoading: boolean;
  results: ClassificationResult[];
}

export function AppSidebar({ model, onModelSelect, isModelLoading, results }: AppSidebarProps) {
  const [dragOver, setDragOver] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async () => {
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "Process some documents first before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const zip = new JSZip();
      const aadharFolder = zip.folder("aadhar_cards");
      const pancardFolder = zip.folder("pan_cards");

      for (const result of results) {
        // Fetch the blob from the object URL
        const response = await fetch(result.imageUrl);
        const blob = await response.blob();

        if (result.classification === 'aadhar') {
          aadharFolder?.file(result.filename, blob);
        } else {
          pancardFolder?.file(result.filename, blob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "classified_documents.zip");

      const aadharCount = results.filter(r => r.classification === 'aadhar').length;
      const pancardCount = results.filter(r => r.classification === 'pancard').length;

      toast({
        title: "Export Complete",
        description: `Exported ${aadharCount} Aadhar and ${pancardCount} PAN cards.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to create the ZIP file.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside 
      className={`
        h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 
        shadow-sidebar transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-72'}
      `}
    >
      {/* Header */}
      <div className={`p-4 border-b border-sidebar-border flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">DocClassifier</h1>
              <p className="text-xs text-muted-foreground">ID Document Analysis</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Model Selection */}
      <div className={`p-4 flex-1 overflow-y-auto ${collapsed ? 'px-2' : ''}`}>
        {!collapsed && (
          <h2 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Model Configuration
          </h2>
        )}

        <div
          className={`
            relative border-2 border-dashed rounded-lg text-center transition-all duration-200
            ${collapsed ? 'p-3' : 'p-6'}
            ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
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
          
          <div className="flex flex-col items-center gap-2">
            <div className={`rounded-full bg-secondary flex items-center justify-center ${collapsed ? 'w-8 h-8' : 'w-12 h-12'}`}>
              <FileCode2 className={`text-muted-foreground ${collapsed ? 'w-4 h-4' : 'w-6 h-6'}`} />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-medium text-foreground">Select .h5 Model</p>
                <p className="text-xs text-muted-foreground mt-1">Drag & drop or click</p>
              </div>
            )}
          </div>
        </div>

        {/* Model Status */}
        {model && !collapsed && (
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

        {model && collapsed && (
          <div className="mt-4 flex justify-center">
            {isModelLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : model.loaded ? (
              <CheckCircle className="w-5 h-5 text-primary" />
            ) : (
              <AlertCircle className="w-5 h-5 text-accent" />
            )}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className={`p-4 border-t border-sidebar-border ${collapsed ? 'px-2' : ''}`}>
        {!collapsed && (
          <h2 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Export Results
          </h2>
        )}
        <Button
          onClick={handleExport}
          disabled={results.length === 0 || isExporting}
          className={`w-full ${collapsed ? 'px-0' : ''}`}
          variant={results.length > 0 ? "default" : "secondary"}
        >
          {isExporting ? (
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          ) : (
            <FolderArchive className={`w-4 h-4 ${collapsed ? '' : 'mr-2'}`} />
          )}
          {!collapsed && (isExporting ? 'Exporting...' : 'Export Classified ZIP')}
        </Button>
        {!collapsed && results.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {results.length} documents ready
          </p>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground">
            <p>Supports Keras .h5 models</p>
            <p className="mt-1">for Aadhar & PAN classification</p>
          </div>
        </div>
      )}
    </aside>
  );
}
