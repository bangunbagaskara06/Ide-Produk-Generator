
import React, { useState, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppState, Step } from './types';
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

 const handleExport = () => {
    if (!isReportComplete) return;
    setLoader('exporting', true);

    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const margin = 40;
    const maxLineWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight = 20) => {
      if (y + neededHeight > doc.internal.pageSize.height - margin) {
        doc.addPage();
        y = margin;
      }
    };
    
    const addSectionTitle = (title: string) => {
        checkPageBreak(30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 188, 212); // Cyan color
        doc.text(title, margin, y);
        y += 25;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(margin, y - 15, pageWidth - margin, y - 15);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(45, 55, 72); // slate-700
    };
    
    const addText = (text: string | string[], options: any = {}) => {
        checkPageBreak(20);
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(text, maxLineWidth);
        doc.text(splitText, margin, y, options);
        y += doc.getTextDimensions(splitText).h + 10;
    };
    
    const addKeyValue = (key: string, value: string) => {
        checkPageBreak(15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(key, margin, y);
        doc.setFont('helvetica', 'normal');
        const valueX = margin + 120;
        const splitValue = doc.splitTextToSize(value, pageWidth - valueX - margin);
        doc.text(splitValue, valueX, y);
        y += doc.getTextDimensions(splitValue).h + 5;
    };

    // --- RENDER PDF ---
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Laporan Ide Produk Generator', pageWidth / 2, y, { align: 'center' });
    y += 30;
    
    // Step 1: Market Analysis
    addSectionTitle('1. Analisis Pasar');
    const { inputs: i1, result: r1, selectedNeed } = appState.step1;
    addKeyValue('Lokasi:', i1.location || 'Tidak ditentukan');
    addKeyValue('Industri:', i1.customIndustry || i1.industries.join(', ') || 'Tidak ditentukan');
    addKeyValue('Target Audiens:', i1.audience || 'Tidak ditentukan');
    addKeyValue('Skala Bisnis:', i1.scale);
    addKeyValue('Modal:', i1.capital ? `Rp ${parseInt(i1.capital).toLocaleString('id-ID')}` : 'Tidak ditentukan');
    y += 10;
    addText(r1?.summary || '');
    y += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Kebutuhan Pasar Teridentifikasi:', margin, y);
    y += 15;
    r1?.market_needs.forEach(need => {
        addKeyValue(`- ${need.need} (Skor: ${need.score})`, need.description);
    });

    // Step 2: Product Recommendation
    if (selectedNeed) {
        addSectionTitle('2. Rekomendasi Produk');
        addKeyValue('Kebutuhan Dipilih:', `${selectedNeed.need} - ${selectedNeed.description}`);
        y+=10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Analisis Mendalam:', margin, y);
        y+=15;
        // Simple markdown stripper
        const cleanAnalysis = appState.step2.inDepthAnalysis?.content.replace(/##\s/g, '').replace(/\*\*/g, '').replace(/-\s/g, '  - ');
        addText(cleanAnalysis || '');
        
        y+=10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Rekomendasi Produk:', margin, y);
        y+=15;
        appState.step2.productRecs?.forEach(rec => {
            addKeyValue(`- ${rec.name} (Skor: ${rec.score})`, `Manfaat: ${rec.benefits}\nTantangan: ${rec.weaknesses}`);
        });
    }

    // Step 3: MVP Guide
    if (appState.step2.selectedProduct) {
        addSectionTitle('3. Panduan MVP');
        addKeyValue('Produk Dipilih:', appState.step2.selectedProduct.name);
        y += 15;
        const head = [['Tahap', 'Aktivitas', 'Waktu', 'Biaya (Rp)']];
        const body = appState.step3.mvpGuide?.mvp_steps.map(s => [s.tahap, s.aktivitas, s.estimasi_waktu, s.estimasi_biaya_rp.toLocaleString('id-ID')]) || [];
        autoTable(doc, { head, body, startY: y, theme: 'grid' });
        y = (doc as any).lastAutoTable.finalY + 20;
    }

    // Step 4: Promo Strategy
    if (appState.step4.promoStrategy) {
        addSectionTitle('4. Strategi Promosi');
        const { startDate, endDate } = appState.step4.inputs;
        addKeyValue('Periode Promosi:', `${startDate} s/d ${endDate}`);
        y += 15;
        const head = [['Timeline', 'Kegiatan', 'Tools', 'Biaya (Rp)', 'Deadline']];
        const body = appState.step4.promoStrategy?.promo_plan.map(p => [p.timeline, p.kegiatan, p.tools, p.estimasi_biaya_rp.toLocaleString('id-ID'), p.deadline]) || [];
        autoTable(doc, { head, body, startY: y, theme: 'grid' });
        y = (doc as any).lastAutoTable.finalY + 20;
    }
    
    doc.save('Laporan_Ide_Produk.pdf');
    setLoader('exporting', false);
};


  const isReportComplete = !!appState.step4.promoStrategy;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="w-full lg:w-4/5 mx-auto">
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
                    const stepIndex = STEPS.findIndex(s => s.id === currentStep);
                    const isActive = stepIndex >= index;
                    const isPassed = stepIndex > index;
                    return (
                        <React.Fragment key={id}>
                            <div 
                              className={`flex flex-col items-center ${isPassed ? 'cursor-pointer' : 'cursor-default'}`}
                              onClick={isPassed ? () => scrollToStep(id) : undefined}
                              aria-label={isPassed ? `Kembali ke ${title}` : title}
                            >
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

            {appState.step1.selectedNeed && (
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
            
            {appState.step2.selectedProduct && (
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

            {appState.step3.mvpGuide && (
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
