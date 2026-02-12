
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, XCircle, Zap, Crosshair } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  onAutoCapture?: (base64: string) => void;
  isLoading: boolean;
  autoMode: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onAutoCapture, isLoading, autoMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setStream(newStream);
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!autoMode || !onAutoCapture) return;

    const interval = setInterval(() => {
      if (!isLoading && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
          onAutoCapture(base64);
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [autoMode, isLoading, onAutoCapture]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
      }
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center bg-slate-950">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black mb-4 text-white">Divine Vision Denied</h2>
        <p className="text-slate-400 mb-10 leading-relaxed text-sm">Please enable camera permissions in your system settings to allow Urim & Tummin to see.</p>
        <button 
          onClick={startCamera}
          className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
        >
          Enable Vision
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Target Focus Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
        <div className={`
          w-full aspect-[4/3] max-w-sm border-2 rounded-[3rem] relative transition-all duration-1000 ease-out
          ${autoMode ? 'border-indigo-400/40 scale-100' : 'border-white/10 scale-110'}
        `}>
          {/* Scanning Lines */}
          {autoMode && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
          )}

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-indigo-400 rounded-tl-[3rem] -translate-x-3 -translate-y-3" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-indigo-400 rounded-tr-[3rem] translate-x-3 -translate-y-3" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-indigo-400 rounded-bl-[3rem] -translate-x-3 translate-y-3" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-indigo-400 rounded-br-[3rem] translate-x-3 translate-y-3" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Crosshair className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Manual Shutter Button - Only visible if autoMode is OFF */}
      {!autoMode && (
        <div className="absolute bottom-40 left-0 right-0 flex justify-center z-40 animate-in zoom-in fade-in duration-500">
          <button
            onClick={captureFrame}
            disabled={isLoading}
            className={`
              relative w-28 h-28 rounded-full border-[6px] border-white/20 flex items-center justify-center
              active:scale-90 transition-all shadow-2xl
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}
            `}
          >
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-indigo-500/20 shadow-2xl">
              {isLoading ? (
                <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
              ) : (
                <Camera className="w-10 h-10 text-indigo-600" />
              )}
            </div>
          </button>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
