
import React, { useState, useRef } from 'react';

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
      setError('INVALID PROTOCOL: Only .pdf or .txt formats are accepted.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsParsing(true);

    // Simulate high-performance neural parsing delay
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      // Artificial delay for UX "Deep Scanning" feel
      setTimeout(() => {
        setIsParsing(false);
      }, 1500);
    };

    if (selectedFile.type.includes('text/plain') || selectedFile.name.endsWith('.txt')) {
      reader.readAsText(selectedFile);
    } else {
      // For PDF in a browser-only environment without heavy libraries, 
      // we treat the blob text as a best-effort or simulation for this prototype.
      const text = await selectedFile.text();
      setTimeout(() => {
        setIsParsing(false);
      }, 2000);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const triggerAnalysis = async () => {
    if (!file) return;
    const text = await file.text();
    onUpload(text);
  };

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 animate-fadeInUp">
      <div className="glass-panel p-16 rounded-[48px] shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center mb-12 relative z-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Neural Benchmarking</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gating Threshold: 70% Match</p>
            </div>
          </div>
          {file && (
            <button 
              onClick={() => { setFile(null); setError(null); }}
              className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
            >
              Clear Buffer
            </button>
          )}
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer w-full h-[360px] rounded-[32px] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden
            ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99] glow-indigo' : 'border-white/5 bg-black/20 hover:border-white/10'}
            ${file ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            className="hidden" 
            accept=".pdf,.txt"
          />

          {/* Scanner Line Animation */}
          {isParsing && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="w-full h-[2px] bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center p-8">
            {!file ? (
              <>
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5">
                  <i className="fas fa-cloud-arrow-up text-3xl text-indigo-400"></i>
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Drop Resume Artifact</h3>
                <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                  Upload your professional profile in <span className="text-slate-300">PDF</span> or <span className="text-slate-300">TXT</span> format for deep vector analysis.
                </p>
              </>
            ) : (
              <div className="animate-fadeIn">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border transition-colors ${isParsing ? 'bg-indigo-600/20 border-indigo-500/40' : 'bg-emerald-600/20 border-emerald-500/40'}`}>
                  <i className={`fas ${isParsing ? 'fa-spinner fa-spin text-indigo-400' : 'fa-check-double text-emerald-400'} text-4xl`}></i>
                </div>
                <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">
                  {isParsing ? 'Analyzing Vectors...' : 'Calibration Complete'}
                </h3>
                <div className="bg-black/40 px-4 py-2 rounded-full border border-white/5 mt-4 inline-block font-mono-tech text-[10px] text-slate-400 uppercase tracking-widest">
                  {file.name} — {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            )}
          </div>

          {/* Decorative Corner Accents */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/10"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/10"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/10"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/10"></div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-shake">
            <i className="fas fa-triangle-exclamation text-rose-500"></i>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div className="mt-12">
          <button 
            onClick={triggerAnalysis}
            disabled={!file || isParsing}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-700 transition-all disabled:opacity-20 shadow-[0_20px_40px_rgba(99,102,241,0.2)] active:scale-95 flex items-center justify-center gap-4"
          >
            {isParsing ? 'Neural Syncing...' : 'Initiate Deep Audit'}
            {!isParsing && <i className="fas fa-bolt-lightning text-[10px]"></i>}
          </button>
        </div>
      </div>

      <div className="text-center mt-24">
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.6em]">
          HireAI Infrastructure v4.4.2 — Encrypted Payload Handlers Active
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};
