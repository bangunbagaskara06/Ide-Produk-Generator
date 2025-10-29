
import React, { useEffect } from 'react';
import { AppState, Step3State } from '../types';
import * as geminiService from '../services/geminiService';
import { ClipboardList } from 'lucide-react';
import LoadingAnimation from './shared/LoadingAnimation';
import ResultSection from './shared/ResultSection';

interface Step3Props {
  state: AppState;
  setState: (data: Partial<Step3State>) => void;
  onComplete: (data: Step3State) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const Step3MvpGuide: React.FC<Step3Props> = ({ state, setState, onComplete, isLoading, setLoading }) => {
  const { step1, step2, step3 } = state;

  useEffect(() => {
    if (step2.selectedProduct && !step3.mvpGuide && !isLoading) {
      const fetchGuide = async () => {
        setLoading(true);
        const guide = await geminiService.getMvpGuide(step2.selectedProduct!.name, step1.inputs.audience, step1.inputs.capital);
        if (guide) {
          setState({ mvpGuide: guide });
        }
        setLoading(false);
      };
      fetchGuide();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step2.selectedProduct]);

  if (!step2.selectedProduct) return null;

  return (
    <section className="p-6 bg-slate-800 rounded-xl border border-slate-700">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
        <ClipboardList className="text-cyan-400" />
        Panduan Pembuatan MVP
      </h2>
      
      <ResultSection title={`Panduan MVP untuk: ${step2.selectedProduct.name}`}>
        {isLoading ? <LoadingAnimation /> : (
          step3.mvpGuide ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="p-3 font-semibold text-white">Tahap</th>
                    <th className="p-3 font-semibold text-white">Aktivitas</th>
                    <th className="p-3 font-semibold text-white">Detail</th>
                    <th className="p-3 font-semibold text-white">Estimasi Waktu</th>
                    <th className="p-3 font-semibold text-white">Estimasi Biaya (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {step3.mvpGuide.mvp_steps.map((item, index) => (
                    <tr key={index} className="border-b border-slate-700">
                      <td className="p-3 align-top font-bold">{item.tahap}</td>
                      <td className="p-3 align-top font-semibold text-cyan-400">{item.aktivitas}</td>
                      <td className="p-3 align-top">{item.detail}</td>
                      <td className="p-3 align-top">{item.estimasi_waktu}</td>
                      <td className="p-3 align-top text-right">{item.estimasi_biaya_rp.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={() => onComplete(step3)}
                className="mt-6 w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                Lanjutkan ke Strategi Promosi
              </button>
            </div>
          ) : <p>Gagal memuat panduan MVP.</p>
        )}
      </ResultSection>
    </section>
  );
};

export default Step3MvpGuide;
