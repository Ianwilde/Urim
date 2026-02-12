
import React, { useState, useCallback, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { ResultOverlay } from './components/ResultOverlay';
import { CloudyBubble } from './components/CloudyBubble';
import { processHandwrittenText, autoTranslateText } from './services/geminiService';
import { ScanResult, AutoScanResult, AppStatus } from './types';
import { Languages, AlertCircle, Zap, Gem, Download } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [autoResult, setAutoResult] = useState<AutoScanResult | null>(null);
  const [translateToSpanish, setTranslateToSpanish] = useState(false);
  const [autoTranslateMode, setAutoTranslateMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleCapture = async (base64: string) => {
    setStatus(AppStatus.SCANNING);
    setError(null);
    try {
      const data = await processHandwrittenText(base64, translateToSpanish);
      setResult({
        ...data,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(err);
      setError("Text was too blurry. Try holding the phone steadier.");
      setStatus(AppStatus.ERROR);
    } finally {
      if (status !== AppStatus.ERROR) {
        setStatus(AppStatus.IDLE);
      }
    }
  };

  const handleAutoCapture = useCallback(async (base64: string) => {
    if (status !== AppStatus.IDLE) return;
    
    setStatus(AppStatus.AUTO_SCANNING);
    try {
      const data = await autoTranslateText(base64);
      if (data) {
        setAutoResult(data);
      }
    } catch (err) {
      console.warn("Auto-scan silent fail");
    } finally {
      setStatus(AppStatus.IDLE);
    }
  }, [status]);

  return (
    <div className="relative h-screen w-screen flex flex-col bg-black font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Dynamic Top Bar */}
      <header className="absolute top-0 left-0 right-0 px-6 pt-12 pb-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Smooth White Stone Icon with Gray Background */}
          <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40 border border-white/5">
            <div className="w-6 h-5 bg-slate-100 rounded-[50%] shadow-inner flex items-center justify-center transform rotate-[-15deg]">
              <div className="w-full h-full bg-white opacity-60 blur-[1px] rounded-full" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight leading-none text-white drop-shadow-lg">
              Urim & Tummin
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 active:scale-90 transition-transform flex items-center justify-center"
              aria-label="Install App"
            >
              <Download className="w-5 h-5 text-indigo-400" />
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 relative">
        <CameraView 
          onCapture={handleCapture} 
          onAutoCapture={handleAutoCapture}
          isLoading={status === AppStatus.SCANNING} 
          autoMode={autoTranslateMode}
        />

        {/* Real-time Cloudy Bubble */}
        {autoTranslateMode && (
          <CloudyBubble 
            result={autoResult} 
            isThinking={status === AppStatus.AUTO_SCANNING} 
          />
        )}
        
        {/* Error Notification */}
        {error && (
          <div className="absolute top-28 left-4 right-4 z-40 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-red-500 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold flex-1">{error}</p>
              <button onClick={() => setError(null)} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase">OK</button>
            </div>
          </div>
        )}

        {/* Floating Controls Overlay - Bottom Safe Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-30">
          <div className="max-w-md mx-auto flex items-end justify-between gap-4">
            {/* Auto Toggle */}
            <button
              onClick={() => {
                setAutoTranslateMode(!autoTranslateMode);
                if (!autoTranslateMode) setAutoResult(null);
              }}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 p-4 rounded-3xl transition-all duration-300 border-2
                ${autoTranslateMode 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30' 
                  : 'bg-white/5 border-white/10 text-white/50 backdrop-blur-md'
                }
              `}
            >
              <Zap className={`w-6 h-6 ${autoTranslateMode ? 'fill-white animate-pulse' : ''}`} />
              <span className="text-[10px] font-black tracking-widest uppercase">Auto Scan</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setTranslateToSpanish(!translateToSpanish)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 p-4 rounded-3xl transition-all duration-300 border-2
                ${translateToSpanish 
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/30' 
                  : 'bg-white/5 border-white/10 text-white/50 backdrop-blur-md'
                }
              `}
            >
              <Languages className="w-6 h-6" />
              <span className="text-[10px] font-black tracking-widest uppercase">Target: {translateToSpanish ? 'ES' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Result UI - Mobile Bottom Sheet */}
        <ResultOverlay 
          result={result} 
          onClose={() => {
            setResult(null);
            setStatus(AppStatus.IDLE);
          }} 
        />
      </main>
    </div>
  );
};

export default App;
