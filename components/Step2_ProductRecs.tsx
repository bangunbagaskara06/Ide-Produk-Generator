
import React, { useEffect } from 'react';
import { AppState, Step2State, ProductRecommendation } from '../types';
import * as geminiService from '../services/geminiService';
import { Gift, BarChart2, Briefcase } from 'lucide-react';
import LoadingAnimation from './shared/LoadingAnimation';
import ResultSection from './shared/ResultSection';
import ReactMarkdown from 'react-markdown';

interface Step2Props {
  state: AppState;
  setState: (data: Partial<Step2State>) => void;
  onComplete: (data: Step2State) => void;
  isLoadingAnalysis: boolean;
  setLoadingAnalysis: (isLoading: boolean) => void;
  isLoadingRecs: boolean;
  setLoadingRecs: (isLoading: boolean) => void;
}

const Step2ProductRecs: React.FC<Step2Props> = ({ state, setState, onComplete, isLoadingAnalysis, setLoadingAnalysis, isLoadingRecs, setLoadingRecs }) => {
  const { step1, step2 } = state;

  useEffect(() => {
    if (step1.selectedNeed && !step2.inDepthAnalysis && !isLoadingAnalysis) {
      const fetchAnalysis = async () => {
        setLoadingAnalysis(true);
        const analysis = await geminiService.getInDepthAnalysis(step1.selectedNeed!.need, step1.inputs.audience, step1.inputs.capital);
        if (analysis) {
          setState({ inDepthAnalysis: { content: analysis } });
        }
        setLoadingAnalysis(false);
      };
      fetchAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step1.selectedNeed]);

  useEffect(() => {
    if (step2.inDepthAnalysis && !step2.productRecs && !isLoadingRecs) {
      const fetchRecs = async () => {
        setLoadingRecs(true);
        const recs = await geminiService.getProductRecommendations(step2.inDepthAnalysis!.content);
        if (recs) {
          setState({ productRecs: recs });
        }
        setLoadingRecs(false);
      };
      fetchRecs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step2.inDepthAnalysis]);

  const handleProductSelect = (product: ProductRecommendation) => {
    const newState = { ...step2, selectedProduct: product };
    setState({ selectedProduct: product });
    onComplete(newState);
  };

  if (!step1.selectedNeed) return null;

  return (
    <section className="p-6 bg-slate-800 rounded-xl border border-slate-700">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
        <Gift className="text-cyan-400" />
        Rekomendasi Produk
      </h2>

      <ResultSection title="Analisis Mendalam Kebutuhan Pasar" icon={<BarChart2 />}>
        <h4 className="text-xl font-bold text-cyan-400 mb-2">{step1.selectedNeed.need}</h4>
        <p className="text-slate-400 mb-4">{step1.selectedNeed.description}</p>
        <div className="border-t border-slate-700 pt-4">
          {isLoadingAnalysis ? <LoadingAnimation /> : (
            step2.inDepthAnalysis ? <ReactMarkdown>{step2.inDepthAnalysis.content}</ReactMarkdown> : <p>Gagal memuat analisis.</p>
          )}
        </div>
      </ResultSection>

      {step2.inDepthAnalysis && (
        <ResultSection title="Hasil Rekomendasi Produk" icon={<Briefcase />}>
          {isLoadingRecs ? <LoadingAnimation /> : (
            step2.productRecs ? (
              <div className="space-y-4">
                {step2.productRecs.sort((a,b) => b.score - a.score).map((product, index) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-lg font-bold text-cyan-400">{product.name}</h4>
                      <div className="text-right flex-shrink-0">
                          <span className="text-xl font-bold text-white">{product.score}</span>
                          <span className="text-xs text-slate-400 block">/100 Skor</span>
                      </div>
                    </div>
                    <div className="mt-3 grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong className="text-green-400 block mb-1">Manfaat:</strong>
                            <p className="text-slate-300">{product.benefits}</p>
                        </div>
                        <div>
                            <strong className="text-amber-400 block mb-1">Tantangan:</strong>
                            <p className="text-slate-300">{product.weaknesses}</p>
                        </div>
                    </div>
                    <button
                      onClick={() => handleProductSelect(product)}
                      className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                      Pilih & Lanjutkan
                    </button>
                  </div>
                ))}
              </div>
            ) : <p>Gagal memuat rekomendasi produk.</p>
          )}
        </ResultSection>
      )}
    </section>
  );
};

export default Step2ProductRecs;
