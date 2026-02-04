
import React, { useState, useRef } from 'react';
import './ResumeBenchmarking.css';

interface ResumeBenchmarkingProps {
  onUpload: (text: string) => void;
}

export const ResumeBenchmarking: React.FC<ResumeBenchmarkingProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('text/plain') && !selectedFile.name.endsWith('.txt')) {
      setError('PROTOCOL ERROR: Only .pdf or .txt formats are accepted.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      // Simulate neural parsing delay for UX
      setTimeout(() => setIsParsing(false), 1500);
    };

    if (selectedFile.type.includes('text/plain') || selectedFile.name.endsWith('.txt')) {
      reader.readAsText(selectedFile);
    } else {
      // PDF handling would go here, for now just simulating
      setTimeout(() => setIsParsing(false), 2000);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const triggerAnalysis = async () => {
    if (!file) return;
    const text = await file.text();
    onUpload(text);
  };

  return (
    <div className="resume-theme-container min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-center animate-fadeIn">
        
        {/* Main Glass Dropzone Card */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative resume-glass-card w-full max-w-4xl min-h-[520px] rounded-[4rem] p-12 md:p-20 flex flex-col items-center justify-center text-center transition-all duration-700 cursor-pointer overflow-hidden
            ${isDragging ? 'scale-[0.98] border-[#6366F1]/30 bg-indigo-50/20' : ''}
            ${file ? 'cursor-default' : 'hover:bg-white/40'}
          `}
        >
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" accept=".pdf,.txt" />

          {/* Stardust / Cloud Glow Internal Decorations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 blur-[120px] rounded-full"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative z-10 space-y-12 w-full max-w-lg mx-auto">
            {/* Centered Icon Box */}
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl shadow-[0_15px_30px_rgba(88,50,216,0.1)] transition-all duration-500 border ${
                file ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-[#EEF2FF] border-[#6366F1]/10 text-[#5832D8]'
              }`}>
                <i className={`fas ${file ? 'fa-check-double' : 'fa-file-pdf'} ${isParsing ? 'animate-pulse' : ''}`}></i>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-[#1E293B] tracking-tighter">
                {file ? (isParsing ? 'Scanning Vectors...' : 'Calibration Ready') : 'Drop Resume Artifact'}
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed opacity-80">
                {file 
                  ? `Artifact "${file.name}" initialized and ready for deep vector analysis.` 
                  : 'Upload your profile in PDF or TXT for deep vector analysis.'}
              </p>
            </div>

            {/* Action Buttons / Progress */}
            <div className="pt-4">
              {file ? (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <button 
                    onClick={triggerAnalysis}
                    disabled={isParsing}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#1D7BFF] to-[#5832D8] text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200/50 hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {isParsing ? 'Initializing Parser...' : 'Initiate Deployment Analysis'}
                  </button>
                  <button 
                    onClick={() => { setFile(null); setError(null); }}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                    Flush Buffer and Rescan
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#F8FAFC] rounded-full border border-slate-200/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <i className="fas fa-shield-halved text-[#5832D8]/40"></i>
                  Encrypted Transfer Protocol
                </div>
              )}
            </div>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="absolute bottom-10 left-10 right-10 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-shake z-20">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">
                <i className="fas fa-exclamation"></i>
              </div>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
            </div>
          )}

          {/* Parsing Scan-Line Animation */}
          {isParsing && (
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#5832D8]/20 to-transparent shadow-[0_0_40px_rgba(88,50,216,0.3)] animate-scanLine absolute top-0"></div>
            </div>
          )}
        </div>

        {/* Support Label */}
        <div className="mt-12 text-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-50">
             HireAI Neural Infrastructure v4.2.0 • Data Sovereignty Verified
           </p>
        </div>

      </div>
    </div>
  );
};
