export type ProposalId = 'A' | 'B' | 'C' | 'D';

export interface Proposal {
  id: ProposalId;
  label: string;
  color?: string;
}

export type QuestionType = 'IMAGE' | 'PALETTE';

export interface QuestionConfig {
  id: string;
  text: string;
  type: QuestionType;
  // Maps Proposal ID ('A', 'B', 'C', 'D') to asset data
  assets: Record<string, string>; 
}

export interface BrandConfig {
  id: ProposalId;
  name: string;
  color: string;
}

export interface SurveyData {
  id?: string; // Supabase ID
  title: string;
  isActive: boolean;
  brands: BrandConfig[]; // Now we store the brand config (2-4 items)
  questions: QuestionConfig[];
}

export interface Submission {
  id: string;
  survey_id: string;
  answers: Record<string, ProposalId>;
  created_at: string;
}

export interface PollResult {
  questionId: string;
  votes: Record<string, number>;
}

export enum AppMode {
  PUBLIC_SURVEY = 'PUBLIC_SURVEY',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_EDITOR = 'ADMIN_EDITOR',
  ADMIN_RESULTS = 'ADMIN_RESULTS',
}

// Types for the creation wizard
export interface Feature {
  id: string;
  label: string;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
  assets: Record<string, string>; // Maps feature.id to asset URL/String
}

export interface SurveyConfig {
  title: string;
  industry: string;
  brands: Brand[];
  features: Feature[];
}

export const DEFAULT_QUESTIONS_TEMPLATE: QuestionConfig[] = [
  {
    id: 'identity',
    text: '¿Cuál de estas identidades te da más ganas de entrar a este negocio?',
    type: 'IMAGE',
    assets: {}
  },
  {
    id: 'color',
    text: '¿Qué paleta de color te parece más atractiva visualmente?',
    type: 'PALETTE',
    assets: {}
  },
  {
    id: 'logo',
    text: '¿Qué logo entiendes mejor a simple vista?',
    type: 'IMAGE',
    assets: {}
  },
  {
    id: 'packaging',
    text: '¿Qué propuesta se ve mejor aplicada a los empaques?',
    type: 'IMAGE',
    assets: {}
  },
  {
    id: 'uniform',
    text: '¿Qué propuesta se ve más profesional en uniforme?',
    type: 'IMAGE',
    assets: {}
  },
  {
    id: 'trust',
    text: '¿En qué propuesta confiarías más para comprar?',
    type: 'IMAGE',
    assets: {}
  }
];

export const BRAND_COLORS = [
  '#3b82f6', // blue (A)
  '#ef4444', // red (B)
  '#10b981', // green (C)
  '#f59e0b', // yellow (D)
];