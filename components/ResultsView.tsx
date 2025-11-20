import React, { useEffect, useState, useRef } from 'react';
import { SurveyData, PollResult, Submission } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Share2, CheckCircle, ArrowLeft, Loader2, PieChart, Download } from 'lucide-react';
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
        });
        const link = document.createElement('a');
        link.download = `eyeroniq-resultados-${data.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Export failed", err);
        alert("No se pudo exportar la imagen.");
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

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin w-12 h-12 text-neutral-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
        <div className="p-2 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 
        </div>
        <span className="font-medium">Volver al Dashboard</span>
      </button>

      <div ref={resultsRef} className="p-8 bg-black">
        <div className="text-center mb-16 animate-fadeIn">
            <div className="w-20 h-20 bg-neutral-800 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-700 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]">
            <PieChart className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Resultados de Preferencia</h2>
            <p className="text-neutral-400 text-lg bg-neutral-900/50 inline-block px-6 py-2 rounded-full border border-white/5">{submissions.length} respuestas registradas</p>
            <p className="text-neutral-600 text-sm mt-2 uppercase tracking-widest">{data.title}</p>
        </div>

        <div className="grid gap-10">
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