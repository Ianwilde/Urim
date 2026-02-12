
import React from 'react';
import { X, Copy, Check, Languages, Sparkles, ChevronDown } from 'lucide-react';
import { ScanResult } from '../types';

interface ResultOverlayProps {
  result: ScanResult | null;
  onClose: () => void;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({ result, onClose }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!result) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full bg-slate-900 rounded-t-[3rem] border-t border-white/10 flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Grabber Handle */}
        <div className="w-full flex justify-center py-4">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-xl font-black text-white">Refinement</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-10">
          {/* Detected Section */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Original Handwriting</h3>
            <div className="p-5 bg-white/5 rounded-3xl text-slate-400 italic text-lg leading-relaxed border border-white/5">
              "{result.originalText}"
            </div>
          </section>

          {/* Corrected Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Divine English</h3>
              <button 
                onClick={() => copyToClipboard(result.correctedText, 'corrected')}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {copied === 'corrected' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied === 'corrected' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-6 bg-indigo-500/10 border-2 border-indigo-500/20 rounded-[2rem] text-white text-xl font-semibold leading-relaxed shadow-inner">
              {result.correctedText}
            </div>
          </section>

          {/* Spanish Section */}
          {result.spanishText && (
            <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Spanish Translation
                </h3>
                <button 
                  onClick={() => copyToClipboard(result.spanishText!, 'spanish')}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {copied === 'spanish' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied === 'spanish' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-6 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] text-white text-xl font-semibold leading-relaxed">
                {result.spanishText}
              </div>
            </section>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-900 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/30 active:scale-95 transition-transform"
          >
            Clear & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
