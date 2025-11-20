import { createClient } from '@supabase/supabase-js';
import { SurveyData, Submission } from '../types';

// Configuration from user prompt
const SUPABASE_URL = 'https://xmnwkinofdpltexzoaxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbndraW5vZmRwbHRleHpvYXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzEzMjQsImV4cCI6MjA3OTIwNzMyNH0.0gvXSto9FyBYwNA_L3wJIfgFEen3eqfVBffY-WkkJEc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- STORAGE METHODS ---

export const uploadAsset = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to the 'survey-assets' bucket
    const { error: uploadError } = await supabase.storage
      .from('survey-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading to storage:", uploadError);
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data } = supabase.storage
      .from('survey-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Failed to upload asset:", error);
    throw error;
  }
};

// --- DB METHODS ---

export const fetchSurveys = async () => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((s: any) => ({
      id: s.id,
      ...s.config,
      isActive: s.is_active
    }));
  } catch (error) {
    console.error("Error fetching surveys:", error);
    // Return empty array instead of crashing
    return [];
  }
};

export const getActiveSurvey = async () => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error) return null;
    
    return {
      id: data.id,
      ...data.config,
      isActive: data.is_active
    } as SurveyData;
  } catch (error) {
    console.error("Error fetching active survey:", error);
    return null;
  }
};

export const createSurvey = async (surveyData: SurveyData) => {
  try {
    const { title, isActive, ...config } = surveyData;
    
    // If this one is active, set all others to inactive
    if (isActive) {
      await supabase
        .from('surveys')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); 
    }

    const { data, error } = await supabase
      .from('surveys')
      .insert([{
        title,
        is_active: isActive,
        config: { title, isActive, ...config }
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating survey:", error);
    throw error;
  }
};

export const deleteSurvey = async (id: string) => {
  try {
    // 1. Delete all submissions associated with this survey first
    const { error: subError } = await supabase
      .from('submissions')
      .delete()
      .eq('survey_id', id);

    if (subError) {
      console.warn("Could not delete associated submissions:", subError);
      throw new Error(`Error al borrar respuestas vinculadas: ${subError.message}`);
    }

    // 2. Delete the survey and request count of deleted rows
    // 'count: exact' allows us to check if something was actually deleted
    const { error, count } = await supabase
      .from('surveys')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) throw error;

    // 3. Verify deletion happened
    if (count === 0) {
      throw new Error("No se eliminó ningún registro. Verifique los permisos (Policies) de DELETE en Supabase.");
    }

  } catch (error) {
    console.error("Error deleting survey:", error);
    throw error;
  }
};

export const setSurveyActive = async (id: string) => {
  try {
    // First, set all surveys to inactive
    await supabase
      .from('surveys')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to apply to all rows if RLS allows

    // Then set the specific survey to active
    const { error } = await supabase
      .from('surveys')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error activating survey:", error);
    throw error;
  }
};

export const submitResponse = async (surveyId: string, answers: Record<string, any>) => {
  try {
    const { error } = await supabase
      .from('submissions')
      .insert([{
        survey_id: surveyId,
        answers
      }]);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error submitting response:", error);
    throw error;
  }
};

export const fetchResults = async (surveyId: string) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('survey_id', surveyId);
      
    if (error) throw error;
    return data as Submission[];
  } catch (error) {
    console.error("Error fetching results:", error);
    return [];
  }
};