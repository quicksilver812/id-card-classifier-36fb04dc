import { ClassificationResult } from "@/types/classification";
import { Badge } from "@/components/ui/badge";

interface ImageTileProps {
  result: ClassificationResult;
  index: number;
}

export function ImageTile({ result, index }: ImageTileProps) {
  const isAadhar = result.classification === 'aadhar';
  
  return (
    <div 
      className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-md animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, boxShadow: '0 2px 8px -2px hsl(214 32% 91% / 0.8)' }}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] relative overflow-hidden bg-secondary">
        <img
          src={result.imageUrl}
          alt={result.filename}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Confidence Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant="secondary" 
            className="bg-background/80 backdrop-blur-sm text-foreground font-mono text-xs"
          >
            {(result.confidence * 100).toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4">
        <p className="text-sm font-medium text-foreground truncate mb-2" title={result.filename}>
          {result.filename}
        </p>
        
        <Badge 
          className={`
            font-medium text-xs uppercase tracking-wide
            ${isAadhar 
              ? 'bg-aadhar/10 text-aadhar border-aadhar/30 hover:bg-aadhar/20' 
              : 'bg-pancard/10 text-pancard border-pancard/30 hover:bg-pancard/20'}
          `}
          variant="outline"
        >
          {isAadhar ? 'Aadhar Card' : 'PAN Card'}
        </Badge>
      </div>

      {/* Hover Glow Effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
        ${isAadhar ? 'bg-aadhar/5' : 'bg-pancard/5'}
      `} />
    </div>
  );
}
