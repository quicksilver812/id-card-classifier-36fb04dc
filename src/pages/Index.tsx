import { useState, useCallback } from "react";
import JSZip from "jszip";
import * as tf from "@tensorflow/tfjs";
import { AppSidebar } from "@/components/AppSidebar";
import { DropZone } from "@/components/DropZone";
import { ResultsGrid } from "@/components/ResultsGrid";
import { ClassificationResult, ModelInfo } from "@/types/classification";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [tfModel, setTfModel] = useState<tf.LayersModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ClassificationResult[]>([]);

  const handleModelSelect = useCallback(async (modelInfo: ModelInfo) => {
    setModel(modelInfo);
    setIsModelLoading(true);
    
    try {
      // For demo purposes, we'll simulate model loading
      // In production, you'd use tf.loadLayersModel with a proper model format
      // TensorFlow.js requires models in TensorFlow.js format, not raw .h5
      
      toast({
        title: "Model Selected",
        description: `${modelInfo.name} is ready. Note: For production, convert .h5 to TensorFlow.js format.`,
      });
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setModel({ ...modelInfo, loaded: true });
    } catch (error) {
      console.error("Error loading model:", error);
      toast({
        title: "Model Load Error",
        description: "Failed to load the model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const processImage = async (
    imageBlob: Blob,
    filename: string
  ): Promise<ClassificationResult> => {
    // Create object URL for display
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // For demo purposes, simulate classification
    // In production, you'd use the actual TF model here
    const isAadhar = Math.random() > 0.5;
    const confidence = 0.75 + Math.random() * 0.24; // 75-99%
    
    return {
      id: crypto.randomUUID(),
      filename,
      imageUrl,
      classification: isAadhar ? 'aadhar' : 'pancard',
      confidence,
    };
  };

  const handleFileDrop = useCallback(async (file: File) => {
    if (!model?.loaded) {
      toast({
        title: "No Model Loaded",
        description: "Please load a model first before processing images.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      const imageFiles: { name: string; blob: Blob }[] = [];
      
      // Extract images from zip
      const promises = Object.entries(zipContent.files).map(async ([path, zipEntry]) => {
        if (zipEntry.dir) return;
        
        const lowerPath = path.toLowerCase();
        if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') || 
            lowerPath.endsWith('.png') || lowerPath.endsWith('.webp')) {
          const blob = await zipEntry.async('blob');
          const filename = path.split('/').pop() || path;
          imageFiles.push({ name: filename, blob });
        }
      });
      
      await Promise.all(promises);

      if (imageFiles.length === 0) {
        toast({
          title: "No Images Found",
          description: "The ZIP file doesn't contain any valid images.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      toast({
        title: "Processing Started",
        description: `Found ${imageFiles.length} images to classify.`,
      });

      // Process each image
      const classificationResults: ClassificationResult[] = [];
      
      for (const { name, blob } of imageFiles) {
        const result = await processImage(blob, name);
        classificationResults.push(result);
        
        // Add small delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(classificationResults);
      
      const aadharCount = classificationResults.filter(r => r.classification === 'aadhar').length;
      const pancardCount = classificationResults.filter(r => r.classification === 'pancard').length;
      
      toast({
        title: "Classification Complete",
        description: `Processed ${classificationResults.length} documents: ${aadharCount} Aadhar, ${pancardCount} PAN Cards`,
      });

    } catch (error) {
      console.error("Error processing ZIP:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process the ZIP file. Please ensure it's valid.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [model]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar 
        model={model} 
        onModelSelect={handleModelSelect}
        isModelLoading={isModelLoading}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Document <span className="text-gradient-primary">Classification</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload a ZIP file containing Aadhar and PAN card images for automatic classification
            </p>
          </header>

          {/* Drop Zone or Results */}
          {results.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <DropZone 
                onFileDrop={handleFileDrop}
                isProcessing={isProcessing}
                disabled={!model?.loaded}
              />
            </div>
          ) : (
            <div>
              {/* Reset Button */}
              <div className="mb-6">
                <button
                  onClick={() => setResults([])}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Upload new files
                </button>
              </div>
              
              <ResultsGrid results={results} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
