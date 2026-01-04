
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
      setError('PROTOCOL ERROR: Only .pdf or .txt formats are accepted.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      setTimeout(() => setIsParsing(false), 1500);
    };

    if (selectedFile.type.includes('text/plain') || selectedFile.name.endsWith('.txt')) {
      reader.readAsText(selectedFile);
    } else {
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
    <div className="max-w-4xl mx-auto px-6 animate-fadeIn">
      <div className="glass-card p-12 md:p-20 rounded-[4rem] relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Neural Scan</h2>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gating Threshold: 70% Affinity</p>
            </div>
          </div>
          {file && (
            <button 
              onClick={() => { setFile(null); setError(null); }}
              className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              Flush Buffer
            </button>
          )}
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer w-full h-[400px] rounded-[3.5rem] border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center overflow-hidden
            ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[0.98]' : 'border-slate-200 bg-white/30 hover:bg-white/60'}
            ${file ? 'border-emerald-300 bg-emerald-50/20' : ''}
          `}
        >
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" accept=".pdf,.txt" />

          {isParsing && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="w-full h-1 bg-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-scanLine"></div>
            </div>
          )}

          <div className="text-center space-y-6 px-10">
            {!file ? (
              <>
                <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center border border-indigo-100 mx-auto group-hover:scale-110 transition-transform">
                  <i className="fas fa-file-upload text-3xl text-indigo-600"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Drop Resume Artifact</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                    Upload your profile in <span className="text-indigo-600">PDF</span> or <span className="text-indigo-600">TXT</span> for deep vector analysis.
                  </p>
                </div>
              </>
            ) : (
              <div className="animate-fadeIn space-y-6">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border-2 ${isParsing ? 'bg-indigo-50 border-indigo-200 animate-pulse' : 'bg-emerald-50 border-emerald-200'}`}>
                  <i className={`fas ${isParsing ? 'fa-spinner fa-spin text-indigo-600' : 'fa-check-double text-emerald-500'} text-4xl`}></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isParsing ? 'Scanning Vectors...' : 'Calibration Active'}
                  </h3>
                  <div className="px-5 py-2 bg-white rounded-full border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest inline-block">
                    {file.name} — {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-shake">
            <i className="fas fa-exclamation-triangle text-rose-500"></i>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div className="mt-16">
          <button 
            onClick={triggerAnalysis}
            disabled={!file || isParsing}
            className="btn-crystal w-full py-6 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] disabled:opacity-30"
          >
            {isParsing ? 'Processing Payload...' : 'Initiate Deep Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};
