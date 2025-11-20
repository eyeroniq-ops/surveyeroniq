import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminPanel } from './components/AdminPanel';
import { SurveyView } from './components/SurveyView';
import { ResultsView } from './components/ResultsView';
import { AppMode, SurveyData } from './types';
import { getActiveSurvey } from './services/supabaseClient';
import { Loader2, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.PUBLIC_SURVEY);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Initial load - try to get active survey
    loadActiveSurvey();
  }, []);

  const loadActiveSurvey = async () => {
    setLoading(true);
    try {
        const active = await getActiveSurvey();
        if (active) {
            setSurveyData(active);
        }
    } catch (e) {
        console.error("Could not load survey", e);
    } finally {
        setLoading(false);
    }
  };

  const handleNavigate = (newMode: AppMode, data?: SurveyData) => {
    if (data) setSurveyData(data);
    setMode(newMode);
    if (newMode === AppMode.PUBLIC_SURVEY) {
        setSubmitted(false);
        if (!data) loadActiveSurvey();
    }
    window.scrollTo(0, 0);
  };

  const handleSurveyComplete = () => {
    setSubmitted(true);
  };

  const toggleAdmin = () => {
      if (mode === AppMode.ADMIN_DASHBOARD || mode === AppMode.ADMIN_EDITOR || mode === AppMode.ADMIN_RESULTS) {
          if (window.confirm("¿Salir del modo administrador?")) {
            setMode(AppMode.PUBLIC_SURVEY);
            loadActiveSurvey(); // reload public state
          }
      } else {
          // Password check
          const password = prompt("Introduce la contraseña de administrador:");
          if (password === "eyeroniq2025") {
            setMode(AppMode.ADMIN_DASHBOARD);
          } else if (password !== null) {
            alert("Contraseña incorrecta");
          }
      }
  };

  return (
    <Layout onAdminClick={toggleAdmin} isAdmin={mode !== AppMode.PUBLIC_SURVEY}>
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-10 h-10 animate-spin text-neutral-600" />
        </div>
      )}

      {/* Public Survey View */}
      {!loading && mode === AppMode.PUBLIC_SURVEY && (
        <>
            {submitted ? (
                <div className="text-center py-20 animate-fadeIn max-w-3xl mx-auto px-4">
                    <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_-10px_rgba(255,255,255,0.2)]">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tight">¡Gracias por tu opinión!</h2>
                    
                    <div className="bg-neutral-900 border border-neutral-800 p-8 md:p-12 rounded-3xl text-left shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <p className="text-xl text-neutral-300 mb-6 leading-relaxed relative z-10">
                          Esta encuesta fue creada por <span className="font-bold text-white">eyeroniq</span>.
                        </p>
                        <p className="text-lg text-neutral-400 mb-8 leading-relaxed relative z-10">
                          Si quieres conocer más de los servicios haz click aquí y obtén 10% de descuento en tu primer proyecto.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); alert("Redirigiendo a eyeroniq para descuento..."); }}
                            className="flex-1 py-4 px-6 bg-white hover:bg-neutral-200 text-black font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-3 group-hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                          >
                            Obtener 10% de Descuento <ArrowRight className="w-5 h-5" />
                          </a>
                          
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); alert("Redirigiendo a sitio web..."); }}
                            className="flex-1 py-4 px-6 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-lg rounded-xl transition-all flex items-center justify-center gap-3 border border-neutral-700"
                          >
                            Conoce más de eyeroniq <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                    </div>

                    <button onClick={() => window.location.reload()} className="mt-12 text-neutral-500 hover:text-white transition-colors text-sm font-medium uppercase tracking-wider">
                      Volver al inicio
                    </button>
                </div>
            ) : surveyData ? (
                <SurveyView 
                    data={surveyData} 
                    onComplete={handleSurveyComplete} 
                />
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-neutral-500">No hay encuestas activas en este momento.</h2>
                    <p className="text-neutral-600 mt-2">Por favor, vuelve más tarde.</p>
                </div>
            )}
        </>
      )}

      {/* Admin Views */}
      {!loading && mode === AppMode.ADMIN_DASHBOARD && (
          <AdminPanel onNavigate={handleNavigate} />
      )}

      {!loading && mode === AppMode.ADMIN_RESULTS && surveyData && (
          <ResultsView data={surveyData} onBack={() => setMode(AppMode.ADMIN_DASHBOARD)} />
      )}

    </Layout>
  );
};

export default App;