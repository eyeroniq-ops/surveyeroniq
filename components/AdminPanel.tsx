import React, { useState, useEffect } from 'react';
import { QuestionConfig, ProposalId, DEFAULT_QUESTIONS_TEMPLATE, SurveyData, BrandConfig, BRAND_COLORS, AppMode } from '../types';
import { Plus, Trash2, Save, BarChart3, Eye, X, ArrowLeft, Database, Loader2, AlertTriangle, CheckCircle2, Image as ImageIcon, Wand2, Power, LogOut } from 'lucide-react';
import { createSurvey, fetchSurveys, uploadAsset, deleteSurvey, setSurveyActive } from '../services/supabaseClient';

interface AdminPanelProps {
  onNavigate: (mode: AppMode, surveyData?: SurveyData) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const [view, setView] = useState<'LIST' | 'EDIT'>('LIST');
  const [surveysList, setSurveysList] = useState<SurveyData[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Editor State
  const [title, setTitle] = useState('Nueva Encuesta Visual');
  const [brands, setBrands] = useState<BrandConfig[]>([
    { id: 'A', name: 'Opción A', color: BRAND_COLORS[0] },
    { id: 'B', name: 'Opción B', color: BRAND_COLORS[1] }
  ]);
  const [questions, setQuestions] = useState<QuestionConfig[]>(DEFAULT_QUESTIONS_TEMPLATE);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({}); 

  useEffect(() => {
    if (view === 'LIST') {
        loadSurveys();
    }
  }, [view]);

  const loadSurveys = async () => {
    setIsLoadingList(true);
    try {
      const data = await fetchSurveys();
      setSurveysList(data);
    } catch (err) {
      console.error("Failed to fetch surveys", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleDeleteSurvey = async (id: string, title: string) => {
      if (!id) return;
      if (window.confirm(`¿Estás seguro de que deseas eliminar la encuesta "${title}"? Esta acción no se puede deshacer y borrará todas las respuestas asociadas.`)) {
          setProcessingId(id);
          try {
              await deleteSurvey(id);
              await loadSurveys();
          } catch (error: any) {
              console.error("Error deleting survey:", error);
              if (error.message && error.message.includes('violates row-level security')) {
                  alert("Error de permisos: No puedes eliminar registros. Verifica las políticas RLS en Supabase.");
              } else {
                  alert(`Error al eliminar: ${error.message || "Revisa la consola para más detalles."}`);
              }
          } finally {
            setProcessingId(null);
          }
      }
  };

  const handleActivateSurvey = async (id: string) => {
      if (!id) return;
      setProcessingId(id);
      try {
          await setSurveyActive(id);
          await loadSurveys();
      } catch (error: any) {
        if (error.message && error.message.includes('violates row-level security')) {
            alert("Error de permisos: Verifica las políticas RLS (Enable update for all) en Supabase.");
        } else {
            alert("Error al activar encuesta.");
        }
      } finally {
        setProcessingId(null);
      }
  };

  const handleCreateNew = () => {
    setTitle('Nueva Encuesta Visual');
    setBrands([
        { id: 'A', name: 'Opción A', color: BRAND_COLORS[0] },
        { id: 'B', name: 'Opción B', color: BRAND_COLORS[1] }
    ]);
    setQuestions(JSON.parse(JSON.stringify(DEFAULT_QUESTIONS_TEMPLATE))); 
    setView('EDIT');
  };

  const handleFillDemo = () => {
    setTitle('Identidad Turística: Puebla Colonial vs Moderna');
    
    const demoBrands: BrandConfig[] = [
        { id: 'A', name: 'Puebla Tradicional', color: '#1e40af' }, // Azul Talavera
        { id: 'B', name: 'Puebla Vanguardista', color: '#be185d' } // Rosa Mexicano/Moderno
    ];
    setBrands(demoBrands);

    // Deep copy template
    const demoQuestions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS_TEMPLATE));

    // Q1: Identidad General (Architecture)
    demoQuestions[0].text = "¿Qué identidad representa mejor la esencia de Puebla?";
    demoQuestions[0].assets['A'] = 'https://images.unsplash.com/photo-1565620720513-e3e32f622237?auto=format&fit=crop&w=600&q=80'; // Puebla Cathedral/Center
    demoQuestions[0].assets['B'] = 'https://images.unsplash.com/photo-1518182170546-0766bd6f6a56?auto=format&fit=crop&w=600&q=80'; // Modern Abstract

    // Q2: Paleta (Colores)
    demoQuestions[1].text = "¿Qué paleta de colores sientes más atractiva?";
    demoQuestions[1].assets['A'] = '#1e40af,#ffffff,#eab308'; // Talavera Blue, White, Gold
    demoQuestions[1].assets['B'] = '#18181b,#db2777,#a855f7'; // Dark, Neon Pink, Violet

    // Q3: Logo Concept (Signage)
    demoQuestions[2].text = "¿Qué estilo gráfico conecta mejor?";
    demoQuestions[2].assets['A'] = 'https://images.unsplash.com/photo-1588612380887-de8349813777?auto=format&fit=crop&w=600&q=80'; // Tile pattern
    demoQuestions[2].assets['B'] = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80'; // Neon light

    // Q4: Souvenirs / Packaging
    demoQuestions[3].assets['A'] = 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80'; // Pottery
    demoQuestions[3].assets['B'] = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80'; // Minimalist box

    // Q5: Vibe / Uniform (People)
    demoQuestions[4].assets['A'] = 'https://images.unsplash.com/photo-1589464885069-6c3e1e979275?auto=format&fit=crop&w=600&q=80'; // Traditional dress/classic
    demoQuestions[4].assets['B'] = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'; // Fashion modern

    // Q6: Trust / Atmosphere
    demoQuestions[5].assets['A'] = 'https://images.unsplash.com/photo-1569388330292-7a6a84156db0?auto=format&fit=crop&w=600&q=80'; // Historic street
    demoQuestions[5].assets['B'] = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'; // Skyscraper

    setQuestions(demoQuestions);
  };

  const handleAddBrand = () => {
    if (brands.length >= 4) return;
    const nextId = brands.length === 2 ? 'C' : 'D';
    const nextColor = BRAND_COLORS[brands.length];
    setBrands([...brands, { id: nextId as ProposalId, name: `Opción ${nextId}`, color: nextColor }]);
  };

  const handleRemoveBrand = () => {
    if (brands.length <= 2) return;
    setBrands(brands.slice(0, -1));
  };

  const handleImageUpload = async (qIndex: number, brandId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `${qIndex}-${brandId}`;
    setUploadingState(prev => ({ ...prev, [key]: true }));

    try {
      const publicUrl = await uploadAsset(file);
      const newQuestions = [...questions];
      newQuestions[qIndex].assets[brandId] = publicUrl;
      setQuestions(newQuestions);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error al subir imagen. Asegúrate de haber ejecutado el Script SQL en Supabase para crear el bucket 'survey-assets'.");
    } finally {
      setUploadingState(prev => ({ ...prev, [key]: false }));
    }
  };

  // Palette Helpers
  const updatePalette = (qIndex: number, brandId: string, colorStr: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].assets[brandId] = colorStr;
    setQuestions(newQuestions);
  };

  const addColorToPalette = (qIndex: number, brandId: string) => {
    const current = questions[qIndex].assets[brandId];
    const colors = current ? current.split(',') : [];
    if (colors.length < 4) {
      colors.push('#000000');
      updatePalette(qIndex, brandId, colors.join(','));
    }
  };

  const removeColorFromPalette = (qIndex: number, brandId: string, colorIndex: number) => {
    const current = questions[qIndex].assets[brandId];
    const colors = current.split(',');
    colors.splice(colorIndex, 1);
    updatePalette(qIndex, brandId, colors.join(','));
  };

  const changeColorValue = (qIndex: number, brandId: string, colorIndex: number, newVal: string) => {
    const current = questions[qIndex].assets[brandId];
    const colors = current.split(',');
    colors[colorIndex] = newVal;
    updatePalette(qIndex, brandId, colors.join(','));
  };

  const handleSaveSurvey = async () => {
    setIsSaving(true);
    const newSurvey: SurveyData = {
        title,
        isActive: true,
        brands,
        questions
    };
    try {
        await createSurvey(newSurvey);
        setView('LIST');
        loadSurveys();
    } catch (e: any) {
        console.error(e);
        if (e.message && e.message.includes('violates row-level security policy')) {
            alert(`ERROR DE PERMISOS (RLS Code 42501)\n\nTu base de datos Supabase está bloqueando la creación.\n\nSOLUCIÓN:\nEjecuta el script SQL proporcionado en el chat para habilitar las políticas de inserción (Enable insert for anon).`);
        } else {
            alert("Error guardando encuesta: " + (e.message || "Error desconocido"));
        }
    } finally {
        setIsSaving(false);
    }
  };

  // --- RENDER LIST ---
  if (view === 'LIST') {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Panel de Administración</h2>
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded uppercase">Modo Editor</span>
                    </div>
                    <p className="text-neutral-400 mt-1">Gestiona tus encuestas y monitorea resultados.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => onNavigate(AppMode.PUBLIC_SURVEY)}
                        className="bg-neutral-800 text-neutral-400 px-4 py-3 rounded-xl font-medium hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Salir
                    </button>
                    <button 
                        onClick={handleCreateNew}
                        className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
                    >
                        <Plus className="w-5 h-5" /> Crear Encuesta
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {isLoadingList ? (
                   <div className="text-center py-20 text-neutral-500">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-neutral-400" />
                      Cargando encuestas...
                   </div>
                ) : surveysList.length === 0 ? (
                    <div className="p-16 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-500 bg-neutral-900/30">
                        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No hay encuestas activas.</p>
                        <p className="text-sm mt-1">Crea una nueva para comenzar.</p>
                    </div>
                ) : (
                    surveysList.map((survey, idx) => (
                        <div key={idx} className={`
                            bg-neutral-900/50 p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all
                            ${survey.isActive ? 'border-green-900/50 shadow-[0_0_30px_-10px_rgba(34,197,94,0.1)]' : 'border-neutral-800 hover:border-neutral-700'}
                        `}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-xl text-neutral-200">{survey.title}</h3>
                                    {survey.isActive && (
                                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            Activa
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-neutral-500 flex items-center gap-2">
                                    <span>{survey.brands.length} Opciones</span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                                    <span>{survey.questions.length} Preguntas</span>
                                </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleActivateSurvey(survey.id!)}
                                    disabled={survey.isActive || processingId === survey.id}
                                    title="Activar encuesta"
                                    className={`
                                        flex-1 md:flex-none px-4 py-2.5 rounded-xl font-medium border transition-all flex items-center justify-center gap-2
                                        ${survey.isActive 
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20 opacity-50 cursor-default' 
                                            : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-green-900/30 hover:text-green-400 hover:border-green-800'
                                        }
                                    `}
                                >
                                    {processingId === survey.id && !survey.isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                                    {survey.isActive ? 'Publicada' : 'Publicar'}
                                </button>

                                <div className="h-auto w-px bg-neutral-800 hidden md:block mx-1"></div>

                                <button 
                                    onClick={() => onNavigate(AppMode.ADMIN_RESULTS, survey)}
                                    className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-xl hover:bg-neutral-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <BarChart3 className="w-4 h-4" /> Resultados
                                </button>
                                <button 
                                    onClick={() => onNavigate(AppMode.PUBLIC_SURVEY, survey)}
                                    className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" /> Ver
                                </button>
                                <button 
                                    onClick={() => handleDeleteSurvey(survey.id!, survey.title)}
                                    disabled={processingId === survey.id}
                                    className="px-3 py-2.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                                    title="Eliminar encuesta"
                                >
                                    {processingId === survey.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
  }

  // --- RENDER EDITOR ---
  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => setView('LIST')} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-all">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold text-white">Configurar Encuesta</h2>
        </div>
        <button 
            onClick={handleFillDemo}
            className="px-4 py-2 bg-neutral-800 text-neutral-400 text-sm font-semibold rounded-lg border border-neutral-700 hover:bg-neutral-700 hover:text-white transition-all flex items-center gap-2"
        >
            <Wand2 className="w-4 h-4" /> Llenar Demo (Puebla)
        </button>
      </div>

      <div className="bg-neutral-900/80 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
        
        {/* Step 1: Basic Config */}
        <div className="mb-12 border-b border-white/5 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
                <label className="block text-sm font-bold text-neutral-400 mb-3 uppercase tracking-wider">Título de la Encuesta</label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-neutral-500 outline-none text-white placeholder-neutral-600 transition-all"
                    placeholder="Escribe un título..."
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-neutral-400 mb-3 uppercase tracking-wider">Opciones a Comparar</label>
                <div className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex gap-2">
                        {brands.map(b => (
                            <div key={b.id} className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-white/10" style={{backgroundColor: b.color}}>
                                {b.id}
                            </div>
                        ))}
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-2"></div>
                    <div className="flex gap-2">
                        <button onClick={handleAddBrand} disabled={brands.length >= 4} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"><Plus className="w-5 h-5" /></button>
                        <button onClick={handleRemoveBrand} disabled={brands.length <= 2} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Step 2: Questions & Assets */}
        <div className="space-y-16">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-xl flex items-center justify-center font-bold text-lg">
                  {qIdx + 1}
                </div>
                <h3 className="text-xl font-bold text-neutral-200 tracking-tight">{q.text}</h3>
                <span className="ml-auto text-[10px] font-bold px-3 py-1.5 bg-neutral-800 text-neutral-400 rounded-full uppercase tracking-widest border border-white/5">
                  {q.type === 'IMAGE' ? 'Imágenes' : 'Paleta'}
                </span>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-${brands.length} gap-6`}>
                {brands.map((brand) => {
                  const uploadKey = `${qIdx}-${brand.id}`;
                  const isUploading = uploadingState[uploadKey];

                  return (
                    <div key={brand.id} className="bg-black/30 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="text-center font-bold text-neutral-500 mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                          <span className="w-2 h-2 rounded-full" style={{backgroundColor: brand.color}}></span>
                          {brand.name}
                      </div>
                      
                      {q.type === 'IMAGE' ? (
                        // IMAGE UPLOAD AREA
                        <div className="aspect-square rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-800/50 relative overflow-hidden group hover:border-neutral-500 transition-all">
                          {isUploading ? (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 z-10">
                               <Loader2 className="w-8 h-8 animate-spin text-neutral-500 mb-3" />
                               <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Subiendo...</span>
                             </div>
                          ) : null}
                          
                          {q.assets[brand.id] ? (
                            <>
                              <img src={q.assets[brand.id]} className="w-full h-full object-contain p-4" alt="" />
                              <button 
                                onClick={() => {
                                  const newQ = [...questions];
                                  newQ[qIdx].assets[brand.id] = '';
                                  setQuestions(newQ);
                                }}
                                className="absolute top-3 right-3 bg-red-500/90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 hover:scale-105"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                              </div>
                              <span className="text-xs text-neutral-500 group-hover:text-neutral-300 font-bold uppercase tracking-wider">Subir Imagen</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(qIdx, brand.id, e)} />
                            </label>
                          )}
                        </div>
                      ) : (
                        // PALETTE EDITOR
                        <div className="min-h-[200px] flex flex-col justify-center">
                           <div className="flex-1 flex flex-col gap-3 mb-4 justify-center items-center">
                              {(q.assets[brand.id] || '').split(',').filter(Boolean).map((color, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-3 w-full max-w-[80%]">
                                  <div className="relative w-10 h-10 rounded-full shadow-sm overflow-hidden ring-1 ring-white/20">
                                    <input 
                                        type="color" 
                                        value={color} 
                                        onChange={(e) => changeColorValue(qIdx, brand.id, cIdx, e.target.value)}
                                        className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer p-0 border-0" 
                                    />
                                  </div>
                                  <span className="text-xs font-mono text-neutral-500 flex-1">{color}</span>
                                  <button 
                                    onClick={() => removeColorFromPalette(qIdx, brand.id, cIdx)}
                                    className="text-neutral-600 hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                           </div>
                           {(q.assets[brand.id] || '').split(',').length < 4 && (
                             <button 
                               onClick={() => addColorToPalette(qIdx, brand.id)}
                               className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-neutral-500 text-xs font-bold hover:bg-neutral-800/50 flex items-center justify-center gap-2 transition-all hover:text-neutral-300"
                             >
                               <Plus className="w-3 h-3" /> AGREGAR COLOR
                             </button>
                           )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex justify-end sticky bottom-6 z-20">
            <button
                onClick={handleSaveSurvey}
                disabled={isSaving}
                className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] hover:bg-neutral-200 hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 border border-white/10 backdrop-blur-xl"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
                    </>
                ) : (
                    <><Save className="w-5 h-5" /> Publicar Encuesta</>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};