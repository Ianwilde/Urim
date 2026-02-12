
import React from 'react';
import { AutoScanResult } from '../types';
import { Sparkles, Languages } from 'lucide-react';

interface CloudyBubbleProps {
  result: AutoScanResult | null;
  isThinking: boolean;
}

export const CloudyBubble: React.FC<CloudyBubbleProps> = ({ result, isThinking }) => {
  if (!result && !isThinking) return null;

  return (
    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-xs pointer-events-none z-20">
      <div className={`
        relative p-6 rounded-[3rem] backdrop-blur-2xl border-2 transition-all duration-700 animate-float
        ${isThinking 
          ? 'bg-indigo-500/20 border-indigo-400/40 scale-95 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
          : 'bg-white/95 border-white shadow-2xl scale-100 shadow-indigo-500/40'
        }
      `}>
        {/* Tail */}
        <div className={`
          absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rotate-45 border-r-2 border-b-2 transition-all duration-700
          ${isThinking ? 'bg-indigo-500/20 border-indigo-400/20' : 'bg-white border-white'}
        `} />

        {isThinking ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
               <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
               <div className="absolute inset-0 w-8 h-8 bg-indigo-400 blur-lg opacity-40 animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Revealing...</span>
          </div>
        ) : result && result.confidence > 0.4 ? (
          <div className="space-y-3 animate-in fade-in zoom-in duration-500 ease-out">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                {result.detectedLanguage}
              </span>
              <Languages className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-slate-900 font-black leading-tight text-xl tracking-tight">
              {result.englishTranslation}
            </p>
            {result.clarification && (
              <p className="text-slate-500 text-xs leading-relaxed border-t border-slate-100 pt-3 italic font-medium">
                {result.clarification}
              </p>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Text...</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
