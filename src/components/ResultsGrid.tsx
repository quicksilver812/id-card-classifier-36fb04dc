import { ClassificationResult } from "@/types/classification";
import { ImageTile } from "./ImageTile";
import { FileCheck, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ResultsGridProps {
  results: ClassificationResult[];
}

type FilterType = 'all' | 'aadhar' | 'pancard';

export function ResultsGrid({ results }: ResultsGridProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredResults = results.filter(r => 
    filter === 'all' ? true : r.classification === filter
  );

  const aadharCount = results.filter(r => r.classification === 'aadhar').length;
  const pancardCount = results.filter(r => r.classification === 'pancard').length;

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Classification Results</h2>
            <p className="text-sm text-muted-foreground">{results.length} documents processed</p>
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-secondary text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setFilter('aadhar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === 'aadhar' 
                ? 'bg-aadhar/10 text-aadhar' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-aadhar" />
            Aadhar ({aadharCount})
          </button>
          <button
            onClick={() => setFilter('pancard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === 'pancard' 
                ? 'bg-pancard/10 text-pancard' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-pancard" />
            PAN ({pancardCount})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredResults.map((result, index) => (
          <ImageTile key={result.id} result={result} index={index} />
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No documents match the current filter
        </div>
      )}
    </div>
  );
}
