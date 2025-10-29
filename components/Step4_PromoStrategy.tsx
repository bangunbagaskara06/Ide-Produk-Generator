
import React from 'react';
import { AppState, Step4State } from '../types';
import * as geminiService from '../services/geminiService';
import { Megaphone, Calendar, Users } from 'lucide-react';
import LoadingAnimation from './shared/LoadingAnimation';
import ResultSection from './shared/ResultSection';

interface Step4Props {
  state: AppState;
  setState: (data: Partial<Step4State>) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const Step4PromoStrategy: React.FC<Step4Props> = ({ state, setState, isLoading, setLoading }) => {
  const { step1, step2, step4 } = state;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({ inputs: { ...state.step4.inputs, [name]: value } });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const strategy = await geminiService.getPromoStrategy(
      step2.selectedProduct!.name,
      step1.inputs.audience,
      step4.inputs.startDate,
      step4.inputs.endDate
    );
    if (strategy) {
      setState({ promoStrategy: strategy });
    }
    setLoading(false);
  };
  
  if (!step2.selectedProduct) return null;

  return (
    <section className="p-6 bg-slate-800 rounded-xl border border-slate-700">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
        <Megaphone className="text-cyan-400" />
        Strategi Promosi
      </h2>
      
      {!step4.promoStrategy && (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-slate-700/50 rounded-lg">
                <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Users size={18} /> Target Audiens
                </label>
                <p className="text-white bg-slate-700 p-2 rounded">{step1.inputs.audience || "Umum (sesuai analisis)"}</p>
            </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Calendar size={18} /> Tanggal Mulai Promosi <span className="text-red-500">*</span>
              </label>
              <input
                type="date" name="startDate" required
                value={step4.inputs.startDate} onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Calendar size={18} /> Tanggal Selesai Promosi <span className="text-red-500">*</span>
              </label>
              <input
                type="date" name="endDate" required
                value={step4.inputs.endDate} onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <button 
            type="submit" disabled={isLoading || !step4.inputs.startDate || !step4.inputs.endDate}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
          >
            {isLoading ? 'Membuat Strategi...' : 'Buat Strategi Promosi'}
          </button>
        </form>
      )}

      {isLoading && <div className="mt-8"><LoadingAnimation /></div>}

      {step4.promoStrategy && !isLoading && (
        <ResultSection title={`Rencana Promosi untuk: ${step2.selectedProduct.name}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-3 font-semibold text-white">Timeline</th>
                  <th className="p-3 font-semibold text-white">Kegiatan</th>
                  <th className="p-3 font-semibold text-white">Keterangan</th>
                  <th className="p-3 font-semibold text-white">Tools</th>
                  <th className="p-3 font-semibold text-white">Est. Waktu</th>
                  <th className="p-3 font-semibold text-white">Est. Biaya (Rp)</th>
                  <th className="p-3 font-semibold text-white">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {step4.promoStrategy.promo_plan.map((item, index) => (
                  <tr key={index} className="border-b border-slate-700">
                    <td className="p-3 align-top font-bold">{item.timeline}</td>
                    <td className="p-3 align-top font-semibold text-cyan-400">{item.kegiatan}</td>
                    <td className="p-3 align-top">{item.keterangan}</td>
                    <td className="p-3 align-top">{item.tools}</td>
                    <td className="p-3 align-top">{item.estimasi_waktu}</td>
                    <td className="p-3 align-top text-right">{item.estimasi_biaya_rp.toLocaleString('id-ID')}</td>
                    <td className="p-3 align-top">{item.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultSection>
      )}
    </section>
  );
};

export default Step4PromoStrategy;
