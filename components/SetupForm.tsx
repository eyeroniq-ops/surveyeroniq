
import React, { useState, useRef } from 'react';
import { Plus, Trash2, ArrowRight, Palette, Layers, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Brand, BRAND_COLORS } from '../types';

interface SetupFormProps {
  onComplete: (title: string, industry: string, brands: Brand[]) => void;
}

interface BrandInput {
  id: string;
  name: string;
  logoUrl: string | null;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onComplete }) => {
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('');
  
  // Initialize with 3 empty brand slots
  const [brands, setBrands] = useState<BrandInput[]>([
    { id: '1', name: '', logoUrl: null },
    { id: '2', name: '', logoUrl: null },
    { id: '3', name: '', logoUrl: null }
  ]);

  const handleBrandNameChange = (index: number, value: string) => {
    const newBrands = [...brands];
    newBrands[index].name = value;
    setBrands(newBrands);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newBrands = [...brands];
      newBrands[index].logoUrl = url;
      setBrands(newBrands);
    }
  };

  const removeImage = (index: number) => {
    const newBrands = [...brands];
    newBrands[index].logoUrl = null;
    setBrands(newBrands);
  };

  const addBrandSlot = () => {
    if (brands.length < 8) {
      setBrands([...brands, { id: Date.now().toString(), name: '', logoUrl: null }]);
    }
  };

  const removeBrandSlot = (index: number) => {
    if (brands.length > 3) {
      const newBrands = brands.filter((_, i) => i !== index);
      setBrands(newBrands);
    }
  };

  const isValid = 
    title.trim().length > 0 && 
    industry.trim().length > 0 && 
    brands.filter(b => b.name.trim().length > 0).length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const validBrands: Brand[] = brands
      .filter(b => b.name.trim().length > 0)
      .map((b, index) => ({
        id: `brand-${index}-${Date.now()}`,
        name: b.name.trim(),
        color: BRAND_COLORS[index % BRAND_COLORS.length],
        logoUrl: b.logoUrl || undefined,
        assets: {}, // Initialize empty assets map
      }));

    onComplete(title, industry, validBrands);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Visual Identity Poll</h2>
        <p className="text-slate-500">Compare brand aesthetics. Upload logos, mockups, or typefaces for a market study.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        {/* Survey Details */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Survey Project Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 2024 Rebranding Comparison"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              Design Context / Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Premium Coffee Shops"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {/* Brands Input */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-slate-700">
              Brands & Primary Logos (Min. 3)
            </label>
            <button
              type="button"
              onClick={addBrandSlot}
              disabled={brands.length >= 8}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Brand
            </button>
          </div>

          <div className="space-y-4">
            {brands.map((brand, index) => (
              <div key={brand.id} className="flex gap-3 items-center animate-fadeIn p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                
                {/* Visual Asset Upload */}
                <div className="relative group flex-shrink-0">
                  <input 
                    type="file" 
                    id={`upload-${index}`} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e)}
                  />
                  
                  {brand.logoUrl ? (
                    <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden relative bg-white">
                      <img src={brand.logoUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-black/50 hover:bg-red-500 text-white p-0.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label 
                      htmlFor={`upload-${index}`}
                      className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-slate-400 hover:text-indigo-500"
                      title="Upload Main Logo"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </label>
                  )}
                  
                  {/* Color indicator overlay */}
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white" 
                    style={{ backgroundColor: BRAND_COLORS[index % BRAND_COLORS.length] }}
                  ></div>
                </div>

                {/* Name Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={brand.name}
                    onChange={(e) => handleBrandNameChange(index, e.target.value)}
                    placeholder={`Brand ${index + 1} Name`}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  />
                </div>

                {brands.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeBrandSlot(index)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2 italic flex items-center gap-1">
             <Upload className="w-3 h-3" /> Upload the main logo or avatar for each brand here. You can add specific mockups for each criteria in the next steps.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
              isValid 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Identify Design Features <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
