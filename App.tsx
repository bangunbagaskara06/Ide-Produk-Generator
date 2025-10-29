
import React, { useState, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MarketAnalysisResult, ProductRecommendation, MvpStep, PromoPlanItem, AppState, Step } from './types';
import Step1MarketAnalysis from './components/Step1_MarketAnalysis';
import Step2ProductRecs from './components/Step2_ProductRecs';
import Step3MvpGuide from './components/Step3_MvpGuide';
import Step4PromoStrategy from './components/Step4_PromoStrategy';
import { Download, Rocket } from 'lucide-react';

const initialState: AppState = {
  step1: {
    inputs: { location: '', industries: [], customIndustry: '', audience: '', scale: 'Kecil', capital: '' },
    result: null,
    selectedNeed: null,
  },
  step2: {
    inDepthAnalysis: null,
    productRecs: null,
    selectedProduct: null,
  },
  step3: {
    mvpGuide: null,
  },
  step4: {
    inputs: { startDate: '', endDate: ''},
    promoStrategy: null,
  },
};

const STEPS: { id: Step; title: string }[] = [
    { id: 'marketAnalysis', title: '1. Analisis Pasar' },
    { id: 'productRecs', title: '2. Rekomendasi Produk' },
    { id: 'mvpGuide', title: '3. Panduan MVP' },
    { id: 'promoStrategy', title: '4. Strategi Promosi' },
];


export default function App() {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [currentStep, setCurrentStep] = useState<Step>('marketAnalysis');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const reportRef = useRef<HTMLDivElement>(null);
  const stepRefs = {
    marketAnalysis: useRef<HTMLDivElement>(null),
    productRecs: useRef<HTMLDivElement>(null),
    mvpGuide: useRef<HTMLDivElement>(null),
    promoStrategy: useRef<HTMLDivElement>(null),
  };

  const setLoader = (loaderId: string, value: boolean) => {
    setIsLoading(prev => ({...prev, [loaderId]: value}));
  }

  const handleReset = () => {
    setAppState(initialState);
    setCurrentStep('marketAnalysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToStep = useCallback((step: Step) => {
    stepRefs[step].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleStepCompletion = (nextStep: Step, data: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...data }));
    setCurrentStep(nextStep);
    setTimeout(() => scrollToStep(nextStep), 100);
  };
  
  const handleExport = async () => {
    if (!reportRef.current) return;
    setLoader('exporting', true);
    
    const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0f172a', // slate-900
        scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const canvasHeightInPdf = pdfWidth / ratio;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeightInPdf);
    heightLeft -= (pdfHeight * imgHeight / canvasHeightInPdf);

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeightInPdf);
        heightLeft -= (pdfHeight * imgHeight / canvasHeightInPdf);
    }
    
    pdf.save('Laporan_Ide_Produk.pdf');
    setLoader('exporting', false);
  };

  const isReportComplete = !!appState.step4.promoStrategy;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-2">
            <Rocket className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Ide Produk Generator</h1>
          </div>
          <p className="text-slate-400 text-lg">Ubah ide brilian menjadi bisnis nyata dengan bantuan AI.</p>
        </header>

        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg py-4 mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                {STEPS.map(({ id, title }, index) => {
                    const isActive = STEPS.findIndex(s => s.id === currentStep) >= index;
                    return (
                        <React.Fragment key={id}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                                    {index + 1}
                                </div>
                                <p className={`mt-2 text-xs sm:text-sm text-center font-semibold transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`}>{title}</p>
                            </div>
                            {index < STEPS.length - 1 && <div className={`flex-1 h-1 rounded ${isActive ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>

        <main id="report-content" ref={reportRef} className="space-y-12">
            <div ref={stepRefs.marketAnalysis}>
              <Step1MarketAnalysis 
                  state={appState.step1} 
                  setState={(data) => setAppState(prev => ({...prev, step1: {...prev.step1, ...data}}))}
                  onComplete={(data) => {
                      setAppState(prev => ({ ...prev, step1: data }));
                      setCurrentStep('productRecs');
                      setTimeout(() => scrollToStep('productRecs'), 100);
                  }}
                  isLoading={isLoading['step1']}
                  setLoading={(val) => setLoader('step1', val)}
              />
            </div>

            {currentStep !== 'marketAnalysis' && (
              <div ref={stepRefs.productRecs}>
                <Step2ProductRecs
                  state={appState}
                  setState={(data) => setAppState(prev => ({...prev, step2: {...prev.step2, ...data}}))}
                  onComplete={(data) => {
                      setAppState(prev => ({ ...prev, step2: data }));
                      setCurrentStep('mvpGuide');
                      setTimeout(() => scrollToStep('mvpGuide'), 100);
                  }}
                  isLoadingAnalysis={isLoading['step2_analysis']}
                  setLoadingAnalysis={(val) => setLoader('step2_analysis', val)}
                  isLoadingRecs={isLoading['step2_recs']}
                  setLoadingRecs={(val) => setLoader('step2_recs', val)}
                />
              </div>
            )}
            
            {(currentStep === 'mvpGuide' || currentStep === 'promoStrategy') && (
              <div ref={stepRefs.mvpGuide}>
                <Step3MvpGuide
                  state={appState}
                  setState={(data) => setAppState(prev => ({...prev, step3: {...prev.step3, ...data}}))}
                  onComplete={(data) => {
                      setAppState(prev => ({ ...prev, step3: data }));
                      setCurrentStep('promoStrategy');
                      setTimeout(() => scrollToStep('promoStrategy'), 100);
                  }}
                  isLoading={isLoading['step3']}
                  setLoading={(val) => setLoader('step3', val)}
                />
              </div>
            )}

            {currentStep === 'promoStrategy' && (
               <div ref={stepRefs.promoStrategy}>
                <Step4PromoStrategy
                  state={appState}
                  setState={(data) => setAppState(prev => ({...prev, step4: {...prev.step4, ...data}}))}
                  isLoading={isLoading['step4']}
                  setLoading={(val) => setLoader('step4', val)}
                />
              </div>
            )}
        </main>
        
        {isReportComplete && (
          <div className="mt-12 text-center p-6 border-2 border-dashed border-slate-700 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Laporan Anda Telah Selesai!</h2>
              <p className="text-slate-400 mb-6">Anda sekarang dapat mengunduh laporan lengkap atau memulai analisis baru.</p>
              <div className="flex justify-center gap-4">
                  <button
                      onClick={handleExport}
                      disabled={isLoading['exporting']}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                  >
                      {isLoading['exporting'] ? 'Mengekspor...' : <><Download size={20} /> Unduh Laporan (PDF)</>}
                  </button>
                  <button
                      onClick={handleReset}
                      className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                  >
                      Mulai Lagi
                  </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
