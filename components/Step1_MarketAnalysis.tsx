
import React from 'react';
import { Lightbulb, MapPin, Target, Users, DollarSign, Building, Search } from 'lucide-react';
import { Step1State, MarketNeed } from '../types';
import * as geminiService from '../services/geminiService';
import LoadingAnimation from './shared/LoadingAnimation';
import ResultSection from './shared/ResultSection';
import CapsuleButton from './shared/CapsuleButton';

const INDUSTRIES = ["Teknologi", "F&B", "Fashion", "Pendidikan", "Kesehatan", "Hiburan", "Agrikultur", "Properti"];
const BUSINESS_SCALES = ["Mikro", "Kecil", "Menengah", "Besar"];

interface Step1Props {
  state: Step1State;
  setState: (data: Partial<Step1State>) => void;
  onComplete: (data: Step1State) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const Step1MarketAnalysis: React.FC<Step1Props> = ({ state, setState, onComplete, isLoading, setLoading }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setState({ inputs: { ...state.inputs, [name]: value } });
  };
  
  const handleIndustryToggle = (industry: string) => {
      const newIndustries = state.inputs.industries.includes(industry)
          ? state.inputs.industries.filter(i => i !== industry)
          : [...state.inputs.industries, industry];
      setState({ inputs: { ...state.inputs, industries: newIndustries, customIndustry: '' } });
  };
  
  const handleCustomIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState({ inputs: { ...state.inputs, customIndustry: e.target.value, industries: [] } });
  };

  const handleNeedClick = (need: MarketNeed) => {
    const newState = { ...state, selectedNeed: need };
    setState({ selectedNeed: need });
    onComplete(newState);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await geminiService.analyzeMarket(state.inputs);
    setLoading(false);
    if (result) {
        setState({ result });
    }
  };

  return (
    <section className="p-6 bg-slate-800 rounded-xl border border-slate-700">
      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
        <Lightbulb className="text-cyan-400" />
        Analisis Pasar
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Row 1: Lokasi & Industri */}
        <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <MapPin size={18} /> Lokasi <span className="text-slate-500 text-sm">(Opsional)</span>
              </label>
              <input
                type="text" name="location" placeholder="Contoh: Jakarta"
                value={state.inputs.location} onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Building size={18} /> Skala Bisnis <span className="text-slate-500 text-sm">(Opsional)</span>
              </label>
              <select
                name="scale" value={state.inputs.scale} onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {BUSINESS_SCALES.map(scale => <option key={scale} value={scale}>{scale}</option>)}
              </select>
            </div>
        </div>
        
        {/* Industri */}
        <div>
          <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Search size={18} /> Pilih Industri <span className="text-slate-500 text-sm">(Opsional)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
              {INDUSTRIES.map(industry => (
                  <CapsuleButton 
                      key={industry}
                      label={industry}
                      isActive={state.inputs.industries.includes(industry)}
                      onClick={() => handleIndustryToggle(industry)}
                  />
              ))}
          </div>
          <input
              type="text"
              name="customIndustry"
              placeholder="Atau masukkan industri lainnya..."
              value={state.inputs.customIndustry}
              onChange={handleCustomIndustryChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        
        {/* Row 2: Audience & Modal */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Users size={18} /> Target Audiens <span className="text-slate-500 text-sm">(Opsional)</span>
            </label>
            <input
              type="text" name="audience" placeholder="Contoh: Mahasiswa, Ibu Rumah Tangga"
              value={state.inputs.audience} onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <DollarSign size={18} /> Modal (Rupiah) <span className="text-slate-500 text-sm">(Opsional)</span>
            </label>
            <input
              type="number" name="capital" placeholder="Contoh: 10000000"
              value={state.inputs.capital} onChange={handleInputChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
        
        <button 
          type="submit" disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
        >
          {isLoading ? 'Menganalisis...' : <> <Search size={20}/> Analisis Pasar Sekarang</>}
        </button>
      </form>

      {isLoading && <div className="mt-8"><LoadingAnimation /></div>}

      {state.result && !isLoading && (
        <div className="mt-8 space-y-6">
            <ResultSection title="Ringkasan Analisis Pasar">
                <p style={{ whiteSpace: 'pre-wrap' }}>{state.result.summary}</p>
            </ResultSection>

            <ResultSection title="Rekomendasi Kebutuhan Pasar">
                <p className="text-slate-400 mb-4">Klik pada salah satu kebutuhan di bawah ini untuk melanjutkan ke tahap rekomendasi produk.</p>
                <div className="space-y-4">
                    {state.result.market_needs.map((need, index) => (
                        <div key={index} onClick={() => handleNeedClick(need)}
                            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-cyan-500 hover:bg-slate-700 cursor-pointer transition-all">
                            <div className="flex justify-between items-start">
                                <h4 className="text-lg font-bold text-cyan-400">{need.need}</h4>
                                <div className="text-right ml-4 flex-shrink-0">
                                    <span className="text-xl font-bold text-white">{need.score}</span>
                                    <span className="text-xs text-slate-400 block">/100 Skor</span>
                                </div>
                            </div>
                            <p className="text-slate-300 mt-1">{need.description}</p>
                        </div>
                    ))}
                </div>
            </ResultSection>

            {state.result.sources && state.result.sources.length > 0 && (
                <ResultSection title="Sumber Data">
                    <ul className="list-disc pl-5 space-y-1">
                        {state.result.sources.map((source, index) => source.web && (
                            <li key={index}>
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </ResultSection>
            )}
        </div>
      )}
    </section>
  );
};

export default Step1MarketAnalysis;
