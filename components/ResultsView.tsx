
import React, { useEffect, useState, useRef } from 'react';
import { SurveyData, PollResult, Submission } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Loader2, PieChart, Download, Trophy, Medal, Crown } from 'lucide-react';
import { fetchResults } from '../services/supabaseClient';
import html2canvas from 'html2canvas';

interface ResultsViewProps {
  data: SurveyData;
  onBack: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, onBack }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.id) {
        fetchResults(data.id).then(subs => {
            setSubmissions(subs);
            setLoading(false);
        }).catch(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [data.id]);

  const handleExportPng = async () => {
    if (resultsRef.current) {
      try {
        const canvas = await html2canvas(resultsRef.current, {
          backgroundColor: '#000000',
          scale: 2, // Better quality
          useCORS: true, // Important for images
          allowTaint: true,
        });
        const link = document.createElement('a');
        link.download = `eyeroniq-resultados-${data.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Export failed", err);
        alert("No se pudo exportar la imagen. Verifica que las imágenes tengan permisos CORS.");
      }
    }
  };

  // Process Results
  const results: PollResult[] = data.questions.map(q => {
    const votes: Record<string, number> = {};
    data.brands.forEach(b => votes[b.id] = 0);

    submissions.forEach(sub => {
        const choice = sub.answers[q.id];
        if (choice && votes[choice] !== undefined) {
            votes[choice]++;
        }
    });

    return { questionId: q.id, votes };
  });

  // Calculate Rankings
  const totalVotesMap: Record<string, number> = {};
  data.brands.forEach(b => totalVotesMap[b.id] = 0);

  results.forEach(r => {
      Object.entries(r.votes).forEach(([brandId, count]) => {
          if (totalVotesMap[brandId] !== undefined) {
              totalVotesMap[brandId] += count;
          }
      });
  });

  // Get image from the LAST question for context
  const lastQuestion = data.questions[data.questions.length - 1];

  const rankedBrands = data.brands.map(brand => ({
    ...brand,
    totalVotes: totalVotesMap[brand.id] || 0,
    // Get the asset for this brand from the last question
    finalImage: lastQuestion?.assets[brand.id] || null
  })).sort((a, b) => b.totalVotes - a.totalVotes);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin w-12 h-12 text-neutral-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
        <div className="p-2 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 
        </div>
        <span className="font-medium">Volver al Dashboard</span>
      </button>

      <div ref={resultsRef} className="p-8 bg-black min-h-screen">
        <div className="text-center mb-16 animate-fadeIn">
            <div className="w-20 h-20 bg-neutral-800 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-700 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]">
            <PieChart className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Resultados de Preferencia</h2>
            <p className="text-neutral-400 text-lg bg-neutral-900/50 inline-block px-6 py-2 rounded-full border border-white/5">{submissions.length} respuestas registradas</p>
            <p className="text-neutral-600 text-sm mt-2 uppercase tracking-widest">{data.title}</p>

            {/* PODIUM SECTION */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-center max-w-4xl mx-auto">
                
                {/* 2nd Place (Left) */}
                {rankedBrands[1] && (
                    <div className="order-2 md:order-1 flex flex-col items-center">
                        <div className="w-full bg-neutral-900/80 border border-neutral-700 rounded-2xl overflow-hidden shadow-lg relative group hover:-translate-y-2 transition-transform duration-300">
                             <div className="h-48 overflow-hidden bg-neutral-800 relative">
                                {rankedBrands[1].finalImage ? (
                                    <img src={rankedBrands[1].finalImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-600">Sin Imagen</div>
                                )}
                                <div className="absolute top-2 left-2 bg-neutral-400 text-black font-bold px-3 py-1 rounded-full text-xs shadow-md flex items-center gap-1">
                                    <Medal className="w-3 h-3" /> 2do Lugar
                                </div>
                             </div>
                             <div className="p-4 text-center border-t border-neutral-700">
                                <h3 className="font-bold text-neutral-300 text-lg">{rankedBrands[1].name}</h3>
                                <div className="text-neutral-500 font-medium text-sm mt-1">{rankedBrands[1].totalVotes} votos</div>
                             </div>
                        </div>
                        <div className="h-16 w-full bg-neutral-800/30 mt-2 rounded-t-lg mx-4"></div>
                    </div>
                )}

                {/* 1st Place (Center) */}
                {rankedBrands[0] && (
                    <div className="order-1 md:order-2 flex flex-col items-center z-10 -mt-8 md:-mt-0">
                         <div className="w-full bg-neutral-900 border border-yellow-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(234,179,8,0.2)] relative group hover:-translate-y-3 transition-transform duration-300">
                             <div className="absolute -inset-0.5 bg-gradient-to-b from-yellow-400 to-yellow-600 opacity-20 blur-sm"></div>
                             <div className="relative h-64 overflow-hidden bg-neutral-800">
                                {rankedBrands[0].finalImage ? (
                                    <img src={rankedBrands[0].finalImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-600">Sin Imagen</div>
                                )}
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black font-extrabold px-4 py-2 rounded-bl-2xl shadow-lg flex items-center gap-2">
                                    <Crown className="w-4 h-4" /> GANADOR
                                </div>
                             </div>
                             <div className="relative p-6 text-center border-t border-yellow-500/20 bg-neutral-900">
                                <h3 className="font-bold text-white text-2xl tracking-tight">{rankedBrands[0].name}</h3>
                                <div className="text-yellow-500 font-bold text-lg mt-2 flex items-center justify-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    {rankedBrands[0].totalVotes} votos
                                </div>
                             </div>
                        </div>
                        <div className="h-24 w-full bg-neutral-800/50 mt-2 rounded-t-lg mx-2 border-t border-white/5"></div>
                    </div>
                )}

                {/* 3rd Place (Right) */}
                {rankedBrands[2] && (
                    <div className="order-3 flex flex-col items-center">
                        <div className="w-full bg-neutral-900/80 border border-orange-900/50 rounded-2xl overflow-hidden shadow-lg relative group hover:-translate-y-2 transition-transform duration-300">
                             <div className="h-40 overflow-hidden bg-neutral-800 relative">
                                {rankedBrands[2].finalImage ? (
                                    <img src={rankedBrands[2].finalImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-600">Sin Imagen</div>
                                )}
                                <div className="absolute top-2 left-2 bg-orange-700 text-orange-100 font-bold px-3 py-1 rounded-full text-xs shadow-md flex items-center gap-1">
                                    <Medal className="w-3 h-3" /> 3er Lugar
                                </div>
                             </div>
                             <div className="p-4 text-center border-t border-neutral-800">
                                <h3 className="font-bold text-neutral-400 text-lg">{rankedBrands[2].name}</h3>
                                <div className="text-neutral-600 font-medium text-sm mt-1">{rankedBrands[2].totalVotes} votos</div>
                             </div>
                        </div>
                        <div className="h-10 w-full bg-neutral-800/30 mt-2 rounded-t-lg mx-6"></div>
                    </div>
                )}
            </div>
            
            <p className="mt-8 text-neutral-500 text-sm">
                * Imágenes de referencia tomadas de la pregunta final: "{lastQuestion?.text}"
            </p>
        </div>

        <div className="grid gap-10 max-w-4xl mx-auto">
            {data.questions.map((q) => {
            const result = results.find(r => r.questionId === q.id);
            if (!result) return null;

            const chartData = data.brands.map(b => ({
                name: b.name,
                votes: result.votes[b.id] || 0,
                fill: b.color
            }));

            // Find winner
            const maxVotes = Math.max(...Object.values(result.votes));
            const winners = Object.entries(result.votes).filter(([_, v]) => v === maxVotes && v > 0).map(([k]) => k);
            const winnerName = winners.length === 1 
                ? data.brands.find(b => b.id === winners[0])?.name 
                : winners.length > 1 ? 'Empate' : 'Sin votos';

            return (
                <div key={q.id} className="bg-neutral-900/80 p-8 rounded-3xl shadow-lg border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <h3 className="text-xl font-bold text-neutral-200 max-w-lg leading-relaxed">{q.text}</h3>
                    <div className="px-5 py-2 bg-black/40 rounded-lg border border-white/10 text-sm font-medium text-neutral-400 whitespace-nowrap">
                    Ganador: <span className="text-white font-bold ml-1 uppercase tracking-wider">{winnerName}</span>
                    </div>
                </div>
                
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#262626" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#a3a3a3', fontWeight: 500, fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                        <Tooltip 
                        cursor={{ fill: '#ffffff05' }}
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            backgroundColor: '#171717',
                            color: '#f5f5f5',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' 
                        }}
                        itemStyle={{ color: '#e5e5e5' }}
                        />
                        <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>
            );
            })}
        </div>
        <div className="mt-10 text-center text-neutral-700 text-xs">
            Generado por eyeroniq
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button 
            onClick={handleExportPng}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
        >
          <Download className="w-5 h-5" /> Descargar PNG
        </button>
      </div>
    </div>
  );
};
