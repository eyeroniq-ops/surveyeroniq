
import React, { useState } from 'react';
import { Brand, Feature, SurveyConfig } from '../types';
import { Upload, ArrowRight, Check, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';

interface AssetUploaderProps {
  config: SurveyConfig;
  onComplete: (updatedBrands: Brand[]) => void;
  onBack: () => void;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({ config, onComplete, onBack }) => {
  const [currentFeatureIdx, setCurrentFeatureIdx] = useState(0);
  // Deep copy brands to avoid mutating props directly until save
  const [localBrands, setLocalBrands] = useState<Brand[]>(JSON.parse(JSON.stringify(config.brands)));

  const currentFeature = config.features[currentFeatureIdx];
  const isLast = currentFeatureIdx === config.features.length - 1;

  const handleFileUpload = (brandIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newBrands = [...localBrands];
      const brand = newBrands[brandIndex];
      
      if (!brand.assets) brand.assets = {};
      brand.assets[currentFeature.id] = url;
      
      setLocalBrands(newBrands);
    }
  };

  const removeAsset = (brandIndex: number) => {
    const newBrands = [...localBrands];
    const brand = newBrands[brandIndex];
    if (brand.assets) {
      delete brand.assets[currentFeature.id];
    }
    setLocalBrands(newBrands);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(localBrands);
    } else {
      setCurrentFeatureIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentFeatureIdx > 0) {
      setCurrentFeatureIdx(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Visual Evidence</h2>
          <p className="text-slate-500">Add specific mockups, screenshots, or photos for each design criterion.</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Criterion {currentFeatureIdx + 1} / {config.features.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Sidebar: Feature Info */}
        <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col">
          <div className="mb-6">
             <h3 className="text-xl font-bold text-slate-800 mb-3">{currentFeature.label}</h3>
             <p className="text-slate-600 leading-relaxed">{currentFeature.description}</p>
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-200">
             <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Upcoming Criteria</h4>
             <ul className="space-y-2">
               {config.features.slice(currentFeatureIdx + 1, currentFeatureIdx + 4).map((f, i) => (
                 <li key={f.id} className="text-sm text-slate-500 truncate flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    {f.label}
                 </li>
               ))}
               {config.features.length > currentFeatureIdx + 4 && (
                 <li className="text-xs text-slate-400 pl-3.5">+ {config.features.length - (currentFeatureIdx + 4)} more</li>
               )}
             </ul>
          </div>
        </div>

        {/* Main Area: Brand Uploads */}
        <div className="flex-1 p-8 bg-white">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" />
            Upload images for "{currentFeature.label}"
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {localBrands.map((brand, idx) => {
              const currentAsset = brand.assets?.[currentFeature.id];
              
              return (
                <div key={brand.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-all bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color }}></div>
                    <span className="font-bold text-slate-700 truncate">{brand.name}</span>
                  </div>

                  <div className="relative aspect-video bg-white rounded-lg border-2 border-dashed border-slate-300 overflow-hidden group hover:border-indigo-400 transition-colors">
                    {currentAsset ? (
                      <>
                        <img src={currentAsset} alt="Asset" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => removeAsset(idx)}
                          className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                           <Check className="w-3 h-3" /> Uploaded
                        </div>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/30 transition-colors">
                        <ImageIcon className="w-8 h-8 text-slate-300 mb-2 group-hover:text-indigo-400" />
                        <span className="text-xs text-slate-400 font-medium group-hover:text-indigo-600">Click to upload</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(idx, e)}
                        />
                      </label>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center text-slate-400">
                    {currentAsset ? "Image ready for survey" : `Use ${brand.name}'s main logo if skipped`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrev}
          className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <button
          onClick={handleNext}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          {isLast ? 'Start Assessment' : 'Next Criteria'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
