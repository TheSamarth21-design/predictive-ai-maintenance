import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, ShieldAlert, Wrench, TrendingUp, Loader2, X, CheckCircle2, Clock, DollarSign, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MachineAnalysis {
  id: string;
  riskScore: number;
  status: 'Normal' | 'Warning' | 'Critical';
  predictedFailure?: string;
  failureTimeframe?: string;
  anomalies: string[];
  recommendations: string[];
  affectedParts?: string[];
  repairSteps?: string[];
  impactIfIgnored?: string;
}

interface AnalysisResult {
  summary: string;
  machines: MachineAnalysis[];
  overallRisk: number;
  costSavingsEstimate?: string;
  criticalAlerts: string[];
  patterns: string[];
}

interface HistoryEntry {
  id: string;
  file_name: string;
  rows_analyzed: number;
  overall_risk: number;
  cost_savings_estimate: string | null;
  summary: string;
  critical_alerts: string[];
  patterns: string[];
  machines: MachineAnalysis[];
  created_at: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await (supabase.from('prediction_results') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setHistory(data as unknown as HistoryEntry[]);
  };

  const parseFile = useCallback((f: File) => {
    setFile(f);
    setAnalysis(null);
    setSelectedMachine(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        
        if (json.length === 0) {
          toast.error('File is empty or could not be parsed');
          return;
        }
        
        const cols = Object.keys(json[0]);
        setColumns(cols);
        setParsedData(json);
        toast.success(`Parsed ${json.length} rows with ${cols.length} columns`);
      } catch {
        toast.error('Failed to parse file. Ensure it is a valid CSV or Excel file.');
      }
    };
    reader.readAsBinaryString(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  }, [parseFile]);

  const analyzeWithAI = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setSelectedMachine(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-sensor-data', {
        body: { sensorData: parsedData, columns },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis);

      // Save to database
      await (supabase.from('prediction_results') as any).insert({
        file_name: file?.name || 'unknown',
        rows_analyzed: data.rowsAnalyzed,
        overall_risk: data.analysis.overallRisk,
        cost_savings_estimate: data.analysis.costSavingsEstimate || null,
        summary: data.analysis.summary,
        critical_alerts: data.analysis.criticalAlerts,
        patterns: data.analysis.patterns,
        machines: data.analysis.machines,
      });
      fetchHistory();

      toast.success(`AI analysis complete — ${data.rowsAnalyzed} rows analyzed`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (score: number) =>
    score > 70 ? 'text-danger' : score > 40 ? 'text-caution' : 'text-safe';

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setAnalysis({
      summary: entry.summary,
      machines: entry.machines,
      overallRisk: entry.overall_risk,
      costSavingsEstimate: entry.cost_savings_estimate || undefined,
      criticalAlerts: entry.critical_alerts,
      patterns: entry.patterns,
    });
    setSelectedMachine(null);
    setShowHistory(false);
    toast.success(`Loaded analysis from ${format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}`);
  };

  const statusBadge = (status: string) =>
    status === 'Critical' ? 'status-critical' : status === 'Warning' ? 'status-warning' : 'status-running';

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">AI Sensor Data Upload</h2>
          <p className="text-muted-foreground text-sm">Upload Excel/CSV sensor data for AI-powered fault prediction and maintenance analysis</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <History size={14} />
          History ({history.length})
        </button>
      </header>

      {/* History Panel */}
      {showHistory && (
        <div className="card-industrial p-4 space-y-2 max-h-[300px] overflow-y-auto">
          <h3 className="section-title mb-2">Previous Analyses</h3>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No previous analyses yet.</p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                onClick={() => loadHistoryEntry(entry)}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border hover:border-ai/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={16} className="text-ai" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')} · {entry.rows_analyzed} rows
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm font-bold ${riskColor(entry.overall_risk)}`}>
                    {entry.overall_risk}% risk
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(entry.critical_alerts || []).length} alerts
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`card-industrial p-8 border-2 border-dashed cursor-pointer transition-all text-center ${
          dragOver ? 'border-ai bg-ai/5' : 'border-border hover:border-ai/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
        />
        <Upload size={40} className={`mx-auto mb-3 ${dragOver ? 'text-ai' : 'text-muted-foreground'}`} />
        <p className="text-foreground font-medium">Drop CSV or Excel file here, or click to browse</p>
        <p className="text-muted-foreground text-xs mt-1">Supports .csv, .xlsx, .xls — sensor data with columns like Machine, Temperature, Vibration, Pressure, RPM, Load</p>
      </div>

      {/* File Info & Preview */}
      {file && parsedData.length > 0 && (
        <div className="card-industrial p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-ai" />
              <div>
                <p className="text-foreground font-medium text-sm">{file.name}</p>
                <p className="text-muted-foreground text-xs">{parsedData.length} rows · {columns.length} columns</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setFile(null); setParsedData([]); setColumns([]); setAnalysis(null); }}
                className="btn-secondary flex items-center gap-1 text-xs"
              >
                <X size={12} /> Clear
              </button>
              <button
                onClick={analyzeWithAI}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                {loading ? 'Analyzing...' : 'Predict Faults with AI'}
              </button>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {columns.map(c => (
                    <th key={c} className="data-label text-left py-2 px-3 whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {columns.map(c => (
                      <td key={c} className="py-1.5 px-3 font-mono text-foreground/80 whitespace-nowrap">
                        {String(row[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 10 && (
              <p className="text-muted-foreground text-xs text-center py-2">Showing 10 of {parsedData.length} rows</p>
            )}
          </div>
        </div>
      )}

      {/* Loading Animation */}
      {loading && (
        <div className="card-industrial p-8 text-center space-y-3">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-ai/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-ai/40 animate-pulse" />
            <Loader2 size={32} className="absolute inset-4 text-ai animate-spin" />
          </div>
          <p className="text-ai font-medium">AI Engine Analyzing Sensor Data...</p>
          <p className="text-muted-foreground text-xs">Detecting anomalies, predicting failures, generating recommendations</p>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysis && !loading && (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="card-industrial p-5 border-l-4 border-l-ai">
            <h3 className="section-title mb-2">AI Prediction Summary</h3>
            <p className="text-foreground/80 text-sm leading-relaxed">{analysis.summary}</p>
            <div className="flex gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className={riskColor(analysis.overallRisk)} />
                <span className="text-xs text-muted-foreground">Overall Risk:</span>
                <span className={`font-mono font-bold ${riskColor(analysis.overallRisk)}`}>{analysis.overallRisk}%</span>
              </div>
              {analysis.costSavingsEstimate && (
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-safe" />
                  <span className="text-xs text-muted-foreground">Est. Savings:</span>
                  <span className="font-mono font-bold text-safe">{analysis.costSavingsEstimate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-danger" />
                <span className="text-xs text-muted-foreground">Critical Alerts:</span>
                <span className="font-mono font-bold text-danger">{analysis.criticalAlerts.length}</span>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          {analysis.criticalAlerts.length > 0 && (
            <div className="card-industrial p-4 border-l-4 border-l-danger">
              <h4 className="section-title text-danger mb-2">⚠ Critical Alerts</h4>
              <ul className="space-y-1">
                {analysis.criticalAlerts.map((alert, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <ShieldAlert size={12} className="text-danger mt-0.5 shrink-0" />
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Machine Cards */}
          <div>
            <h3 className="section-title mb-3">Machine-Level Predictions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.machines.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMachine(selectedMachine?.id === m.id ? null : m)}
                  className={`card-industrial p-4 cursor-pointer transition-all hover:border-ai/30 ${
                    selectedMachine?.id === m.id ? 'border-ai ring-1 ring-ai/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-foreground text-sm">{m.id}</span>
                    <span className={`status-badge ${statusBadge(m.status)}`}>{m.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          m.riskScore > 70 ? 'bg-danger' : m.riskScore > 40 ? 'bg-caution' : 'bg-safe'
                        }`}
                        style={{ width: `${m.riskScore}%` }}
                      />
                    </div>
                    <span className={`font-mono text-xs font-bold ${riskColor(m.riskScore)}`}>{m.riskScore}%</span>
                  </div>
                  {m.predictedFailure && (
                    <p className="text-xs text-caution flex items-center gap-1">
                      <Clock size={10} /> {m.failureTimeframe || 'Soon'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{m.anomalies.length} anomalies detected</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Machine Detail */}
          {selectedMachine && (
            <div className="card-industrial p-5 space-y-4 border-l-4 border-l-ai animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="section-title">Detailed Analysis: {selectedMachine.id}</h3>
                <button onClick={() => setSelectedMachine(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              {selectedMachine.predictedFailure && (
                <div className="bg-danger/10 border border-danger/20 rounded-md p-3">
                  <p className="text-sm font-medium text-danger">Predicted Failure</p>
                  <p className="text-sm text-foreground/80 mt-1">{selectedMachine.predictedFailure}</p>
                  {selectedMachine.failureTimeframe && (
                    <p className="text-xs text-caution mt-1 flex items-center gap-1">
                      <Clock size={10} /> Estimated timeframe: {selectedMachine.failureTimeframe}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Anomalies */}
                <div>
                  <h4 className="data-label mb-2">ANOMALIES DETECTED</h4>
                  <ul className="space-y-1">
                    {selectedMachine.anomalies.map((a, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-2">
                        <AlertTriangle size={10} className="text-caution mt-0.5 shrink-0" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="data-label mb-2">AI RECOMMENDATIONS</h4>
                  <ul className="space-y-1">
                    {selectedMachine.recommendations.map((r, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-2">
                        <Wrench size={10} className="text-ai mt-0.5 shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Affected Parts */}
              {selectedMachine.affectedParts && selectedMachine.affectedParts.length > 0 && (
                <div>
                  <h4 className="data-label mb-2">AFFECTED PARTS</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMachine.affectedParts.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-secondary rounded text-xs font-mono text-foreground/80">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Repair Steps */}
              {selectedMachine.repairSteps && selectedMachine.repairSteps.length > 0 && (
                <div>
                  <h4 className="data-label mb-2">REPAIR STEPS</h4>
                  <ol className="space-y-1">
                    {selectedMachine.repairSteps.map((s, i) => (
                      <li key={i} className="text-xs text-foreground/70 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-ai/20 text-ai flex items-center justify-center shrink-0 text-[9px] font-bold">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Impact */}
              {selectedMachine.impactIfIgnored && (
                <div className="bg-danger/5 border border-danger/10 rounded-md p-3">
                  <h4 className="data-label text-danger mb-1">IMPACT IF NOT MAINTAINED</h4>
                  <p className="text-xs text-foreground/70">{selectedMachine.impactIfIgnored}</p>
                </div>
              )}
            </div>
          )}

          {/* Patterns */}
          {analysis.patterns.length > 0 && (
            <div className="card-industrial p-4">
              <h4 className="section-title mb-2">Historical Patterns Detected</h4>
              <ul className="space-y-1">
                {analysis.patterns.map((p, i) => (
                  <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                    <CheckCircle2 size={12} className="text-ai mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
