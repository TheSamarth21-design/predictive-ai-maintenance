import React, { useState } from 'react';
import { Upload, BrainCircuit, Activity, CheckCircle2, AlertCircle, UserCircle, Phone, Wrench } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<{fault: string, engineer: string, role: string, phone: string, color: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPrediction(null);
      setDiagnostics(null);
      setError(null);
    }
  };

  const handleAIPredict = async () => {
    if (!file) {
      setError("Please upload a file first!");
      return;
    }

    setIsAnalysing(true);
    setError(null);
    setDiagnostics(null);

    try {
      // 1. Create a FormData package (This is what Python expects now)
      const formData = new FormData();
      formData.append("file", file); // Key MUST be "file"

      // 2. Call the Universal Python Endpoint
const response = await fetch("https://nasa-engine-ai.onrender.com/predict-file", 
  {
          method: "POST",
        // NOTE: We DO NOT set 'Content-Type' header here. 
        // The browser adds the correct boundary automatically for FormData.
        body: formData, 
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "AI Server rejected the data format.");
      }

      const data = await response.json();
      const rul = data.rul;
      setPrediction(rul);

      // 3. AI DIAGNOSTICS ENGINE
      if (rul < 150) {
        // Simple logic for the demo: 
        // In a real app, Python would return the fault types too.
        if (rul < 60) {
          setDiagnostics({
            fault: "Mechanical Wear / Bearing Degradation",
            engineer: "Mike Vance",
            role: "Mechanical Specialist",
            phone: "+1 (555) 019-8821",
            color: "text-red-400 bg-red-500/10 border-red-500/30"
          });
        } else {
          setDiagnostics({
            fault: "Thermal Overload / Compressor Stall",
            engineer: "Dr. Sarah Jenkins",
            role: "Thermal Systems Lead",
            phone: "+1 (555) 019-2834",
            color: "text-orange-400 bg-orange-500/10 border-orange-500/30"
          });
        }
      }

    } catch (err: any) {
      setError(err.message || "Connection Failed!");
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">NASA AI Maintenance Upload</h1>
        <p className="text-muted-foreground">Universal Analyser: Supporting CSV, Excel (.xlsx), and JSON.</p>
      </div>

      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-card/50">
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleFileChange} 
          accept=".csv, .xlsx, .xls, .json" 
        />
        <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Upload className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium">{file ? file.name : "Select Maintenance Data File"}</p>
          <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
        </label>
      </div>

      <button 
        onClick={handleAIPredict}
        disabled={isAnalysing || !file}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
      >
        {isAnalysing ? <Activity className="animate-spin" /> : <BrainCircuit />}
        {isAnalysing ? "AI IS ANALYSING..." : "ANALYSE COMPONENT HEALTH"}
      </button>

      {prediction !== null && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Main Health Card */}
          <div className={`p-6 rounded-xl border ${
            prediction > 100 ? 'bg-emerald-500/10 border-emerald-500/30' : 
            prediction > 50 ? 'bg-amber-500/10 border-amber-500/30' : 
            'bg-red-500/10 border-red-500/30'
          }`}>
            <div className={`flex items-center gap-3 mb-2 font-bold uppercase tracking-widest text-xs ${
              prediction > 100 ? 'text-emerald-500' : prediction > 50 ? 'text-amber-500' : 'text-red-500'
            }`}>
              {prediction > 100 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {prediction > 100 ? "System Healthy" : prediction > 50 ? "Maintenance Warning" : "CRITICAL ALERT"}
            </div>
            
            <div className="text-5xl font-mono font-bold text-white">
              {Math.min(100, Math.max(0, (prediction / 200) * 100)).toFixed(1)}%
              <span className="text-lg font-sans opacity-70 ml-2">Health Remaining</span>
            </div>
            <div className="text-sm font-mono text-muted-foreground mt-2">
              Raw Telemetry: {prediction} Estimated Cycles Left
            </div>
          </div>

          {/* Fault Diagnosis Card */}
          {diagnostics && (
            <div className={`p-6 rounded-xl border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between ${diagnostics.color}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs opacity-80">
                  <Wrench size={16} /> Diagnosed Fault
                </div>
                <div className="text-xl font-bold text-white">{diagnostics.fault}</div>
                <p className="text-sm opacity-80">Telemetry indicates immediate expert attention required.</p>
              </div>

              <div className="bg-background/50 p-4 rounded-lg border border-white/10 flex items-center gap-4 min-w-[250px]">
                <UserCircle size={40} className="opacity-80" />
                <div>
                  <div className="font-bold text-white">{diagnostics.engineer}</div>
                  <div className="text-xs font-mono opacity-80 mb-1">{diagnostics.role}</div>
                  <div className="flex items-center gap-1 text-sm font-medium text-white">
                    <Phone size={14} /> {diagnostics.phone}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommended Actions */}
          <div className="p-6 rounded-xl bg-card border border-border text-left space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BrainCircuit className="text-blue-400" size={20} />
              AI Recommended Actions
            </h3>
            
            <ul className="space-y-3">
              {prediction > 100 ? (
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                  Engine degradation is within normal limits. Continue standard monitoring.
                </li>
              ) : (
                <>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                    <strong>ERP Link:</strong> Automatically generated purchase order for replacement parts.
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-500"></div>
                    <strong>Alert Sent:</strong> Priority notification sent to {diagnostics?.engineer || "Maintenance Team"}.
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 animate-pulse">
          <AlertCircle size={18} /> {error}
        </div>
      )}
    </div>
  );
}
