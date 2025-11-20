import React, { useState } from 'react';
import { SurveyData, ProposalId } from '../types';
import { Check, ChevronRight, Award, AlertCircle, MousePointerClick } from 'lucide-react';
import { submitResponse } from '../services/supabaseClient';

interface SurveyViewProps {
  data: SurveyData;
  onComplete: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({ data, onComplete }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, ProposalId>>({}); // questionId -> selected ProposalId
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = data.questions[currentQIndex];
  const isLast = currentQIndex === data.questions.length - 1;

  // Responsive Grid for Cards
  const gridCols = data.brands.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-5xl' : 
                   data.brands.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-6xl' : 
                   'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl';

  const handleVote = (proposalId: ProposalId) => {
    setVotes(prev => ({ ...prev, [currentQ.id]: proposalId }));
  };

  const handleNext = async () => {
    if (isLast) {
      setIsSubmitting(true);
      try {
        await submitResponse(data.id || 'demo', votes);
        onComplete();
      } catch (e) {
        console.error(e);
        alert("Hubo un error al enviar. Intenta nuevamente.");
        setIsSubmitting(false);
      }
    } else {
      setCurrentQIndex(prev => prev + 1);
      window.scrollTo(0,0);
    }
  };

  const progress = ((currentQIndex + 1) / data.questions.length) * 100;

  if (!currentQ) return <div className="text-white">Cargando...</div>;

  return (
    <div className="mx-auto flex flex-col items-center pb-32 pt-4">
      
      {/* Progress Indicator */}
      <div className="w-full max-w-2xl mb-10 px-4">
        <div className="flex justify-between text-xs font-bold text-neutral-500 uppercase mb-3 tracking-wider">
          <span>Progreso</span>
          <span className="text-neutral-400">{currentQIndex + 1} / {data.questions.length}</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-800/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div className="h-full bg-white transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Question Header */}
      <div className="text-center mb-16 animate-fadeIn max-w-4xl px-4">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 drop-shadow-lg tracking-tight">
          {currentQ.text}
        </h2>
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-neutral-900/80 backdrop-blur-md rounded-full border border-white/10 text-neutral-400 text-sm font-medium shadow-xl">
           <MousePointerClick className="w-4 h-4 text-neutral-200" /> 
           Selecciona una tarjeta para votar
        </div>
      </div>

      {/* Cards Grid */}
      <div className={`grid ${gridCols} gap-8 w-full mb-12 px-4`}>
        {data.brands.map((brand) => {
          const isSelected = votes[currentQ.id] === brand.id;
          const asset = currentQ.assets[brand.id];

          return (
            <div 
              key={brand.id}
              onClick={() => handleVote(brand.id)}
              className={`
                relative cursor-pointer rounded-3xl transition-all duration-500 group flex flex-col overflow-hidden
                transform perspective-1000 border
                ${isSelected 
                  ? 'border-white shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] scale-[1.02] -translate-y-2 z-10 ring-1 ring-white/50' 
                  : 'border-transparent shadow-2xl bg-white hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(255,255,255,0.1)] opacity-90 hover:opacity-100'
                }
              `}
            >
              {/* The Card Itself - Always White as requested */}
              <div className="bg-white h-full flex flex-col">
                  {/* Card Header/Brand Stripe */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: brand.color }}></div>

                  {/* Image Area */}
                  <div className={`
                    flex-1 flex items-center justify-center relative bg-neutral-50/50
                    transition-colors duration-300 overflow-hidden
                  `}>
                    {currentQ.type === 'IMAGE' ? (
                      <div className={`w-full flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500 ${isLast ? 'aspect-[9/16]' : 'aspect-square'}`}>
                        {asset ? (
                          <>
                            <img 
                              src={asset} 
                              alt={`Opción ${brand.name}`} 
                              className={`w-full h-full drop-shadow-xl transition-transform duration-500
                                ${isLast ? 'object-cover' : 'object-cover scale-110'}
                              `}
                            />
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-neutral-300">
                            <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm font-medium">Imagen pendiente</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      // PALETTE VIEW
                      <div className="w-full aspect-square flex flex-col gap-6 items-center justify-center py-8">
                        <div className="flex flex-wrap justify-center gap-4">
                          {(asset || '').split(',').filter(Boolean).map((color, idx) => (
                            <div 
                              key={idx} 
                              className="w-20 h-20 rounded-full shadow-xl border-4 border-white transform transition-transform hover:scale-110 hover:rotate-6 hover:z-10 ring-1 ring-black/5" 
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selection Checkmark Overlay */}
                    <div className={`
                        absolute inset-0 bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center z-20
                        ${isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}>
                      <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                          <Check className="w-8 h-8 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={`px-6 py-6 border-t flex justify-between items-center transition-colors bg-white border-neutral-100`}>
                    <div className="flex items-center gap-3">
                        <span 
                          className={`w-3 h-3 rounded-full shadow-sm ring-1 ring-black/5`} 
                          style={{ backgroundColor: brand.color }}
                        />
                        <span className="font-bold tracking-tight text-lg text-neutral-900">
                          {brand.name}
                        </span>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'border-black bg-black text-white scale-110' : 'border-neutral-200 text-transparent group-hover:border-neutral-400'}
                    `}>
                      <Check className="w-3 h-3 stroke-[4]" />
                    </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-8 left-0 right-0 px-4 z-50 pointer-events-none">
        <div className="max-w-md mx-auto w-full pointer-events-auto">
            <button
            onClick={handleNext}
            disabled={!votes[currentQ.id] || isSubmitting}
            className={`w-full px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform duration-300 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-xl
                ${votes[currentQ.id] 
                ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.2)]' 
                : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                }
            `}
            >
            {isSubmitting ? (
                <span className="flex items-center gap-2">Enviando...</span>
            ) : (
                <span className="flex items-center gap-2">
                    {isLast ? 'Finalizar Encuesta' : 'Siguiente'}
                    {isLast ? <Award className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </span>
            )}
            </button>
        </div>
      </div>
    </div>
  );
};