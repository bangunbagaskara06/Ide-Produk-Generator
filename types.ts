
export interface MarketNeed {
  need: string;
  description: string;
  score: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface MarketAnalysisResult {
  summary: string;
  market_needs: MarketNeed[];
  sources: GroundingChunk[];
}

export interface InDepthAnalysisResult {
  content: string;
}

export interface ProductRecommendation {
  name: string;
  score: number;
  benefits: string;
  weaknesses: string;
}

export interface MvpStep {
  tahap: number;
  aktivitas: string;
  detail: string;
  estimasi_waktu: string;
  estimasi_biaya_rp: number;
}

export interface MvpGuide {
  mvp_steps: MvpStep[];
}

export interface PromoPlanItem {
  timeline: string;
  kegiatan: string;
  keterangan: string;
  tools: string;
  estimasi_waktu: string;
  estimasi_biaya_rp: number;
  deadline: string;
}

export interface PromoStrategy {
  promo_plan: PromoPlanItem[];
}

export interface Step1State {
  inputs: {
    location: string;
    industries: string[];
    customIndustry: string;
    audience: string;
    scale: string;
    capital: string;
  };
  result: MarketAnalysisResult | null;
  selectedNeed: MarketNeed | null;
}

export interface Step2State {
  inDepthAnalysis: InDepthAnalysisResult | null;
  productRecs: ProductRecommendation[] | null;
  selectedProduct: ProductRecommendation | null;
}

export interface Step3State {
  mvpGuide: MvpGuide | null;
}

export interface Step4State {
  inputs: {
    startDate: string;
    endDate: string;
  };
  promoStrategy: PromoStrategy | null;
}

export interface AppState {
  step1: Step1State;
  step2: Step2State;
  step3: Step3State;
  step4: Step4State;
}

export type Step = 'marketAnalysis' | 'productRecs' | 'mvpGuide' | 'promoStrategy';
