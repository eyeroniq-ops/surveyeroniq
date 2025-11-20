import { GoogleGenAI, Type } from "@google/genai";
import { Feature } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSurveyFeatures = async (
  industry: string,
  brands: string[]
): Promise<Feature[]> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Estoy creando una encuesta de comparación de identidad visual de marca para la industria de: ${industry}.
    Las marcas que se comparan son: ${brands.join(", ")}.
    
    Genera 6 características de comparación distintas y centradas en el diseño visual (criterios) que sean relevantes para comparar la estética y la identidad visual de estas marcas.
    NO incluyas características no visuales como servicio al cliente, precio o funcionalidad.
    Céntrate SOLO en aspectos visuales.
    Ejemplos de características: "Versatilidad del Logo", "Armonía de la Paleta de Colores", "Elección de Tipografía", "Estética del Empaque", "Diseño UI del Sitio Web", "Coherencia Visual".
    
    Proporciona el nombre de la característica (label) y una breve descripción (description) en ESPAÑOL para ayudar al usuario a entender qué elemento visual específico está calificando.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "El nombre de la característica visual (ej. Diseño del Logo)" },
              description: { type: Type.STRING, description: "Una breve explicación del aspecto visual (max 12 palabras)" },
            },
            required: ["label", "description"],
          },
        },
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    
    return rawData.map((item: any, index: number) => ({
      id: `feature-${index}-${Date.now()}`,
      label: item.label,
      description: item.description,
    }));
  } catch (error) {
    console.error("Failed to generate features:", error);
    // Fallback if AI fails (Spanish)
    return [
      { id: 'f1', label: 'Distinción del Logo', description: 'Memorabilidad y singularidad de la marca.' },
      { id: 'f2', label: 'Paleta de Colores', description: 'Impacto emocional y armonía de los colores.' },
      { id: 'f3', label: 'Tipografía', description: 'Legibilidad y personalidad de las fuentes usadas.' },
      { id: 'f4', label: 'Coherencia Visual', description: 'Coherencia del diseño en diferentes puntos de contacto.' },
      { id: 'f5', label: 'Modernidad', description: 'Qué tan contemporáneo y actual se siente el diseño.' },
    ];
  }
};

export const generateAnalysis = async (
  surveyTitle: string,
  winner: string
): Promise<string> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    Analiza los resultados de una encuesta de identidad visual titulada "${surveyTitle}".
    La propuesta ganadora es: ${winner}.
    Escribe una breve conclusión en español explicando por qué esta opción podría haber sido la más atractiva visualmente.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Failed to generate analysis:", error);
    return "No se pudo generar el análisis.";
  }
};
