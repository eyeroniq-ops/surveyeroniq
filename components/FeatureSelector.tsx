import React, { useEffect, useState } from 'react';
import { Check, RefreshCw, ArrowRight, Sparkles, Palette } from 'lucide-react';
import { generateSurveyFeatures } from '../services/geminiService';
import { Feature, SurveyConfig } from '../types';

interface FeatureSelectorProps {
  config: SurveyConfig;
  onComplete: (features: Feature[]) => void;
  onBack: () => void;
}

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({ config, onComplete, onBack }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFeatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeatures = async () => {
    setLoading(true);
    const brandNames = config.brands.map(b => b.name);
    const generated = await generateSurveyFeatures(config.industry, brandNames);
    setFeatures(generated);
    // Auto-select first 4 by default
    setSelectedIds(new Set(generated.slice(0, 4).map(f => f.id)));
    setLoading(false);
  };

  const toggleFeature = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleContinue = () => {
    const selectedFeatures = features.filter(f => selectedIds.has(f.id));
    onComplete(selectedFeatures);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Analyzing Visual Identity...</h3>
        <p className="text-slate-500">Gemini is extracting key design attributes for {config.industry}.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Select Design Attributes</h2>
          <p className="text-slate-500">Choose which visual elements you want to compare in the survey.</p>
        </div>
        <button 
          onClick={fetchFeatures}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Regenerate Criteria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {features.map((feature) => {
          const isSelected = selectedIds.has(feature.id);
          return (
            <div
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 relative group ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md'
                  : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <Palette className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <h3 className={`font-bold text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {feature.label}
                  </h3>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </div>
              <p className={`text-sm leading-relaxed pl-6 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedIds.size === 0}
          className={`flex-1 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
            selectedIds.size > 0
              ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 transform hover:-translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5" /> Start Visual Survey
        </button>
      </div>
    </div>
  );
};