import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, Cpu, AlertTriangle, AlertOctagon, Info, Download } from 'lucide-react';
import { SAMPLE_LOGS, type LogEntry } from '@/lib/syncplant-data';

export default function LogsPage() {
  const [logs, setLogs] = useState(SAMPLE_LOGS);
  const [customLog, setCustomLog] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | { critical: string[]; warnings: string[]; actions: string[] }>(null);
  const [filter, setFilter] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.level === filter);

  const analyzeLog = () => {
    const text = customLog || logs.map(l => `[${l.level}] ${l.source}: ${l.message}`).join('\n');
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setAnalysisResult({
        critical: [
          'TR-01: Core temperature 12°C above critical threshold — imminent thermal runaway',
          'TR-01: Vibration at 0.9g indicates advanced bearing degradation',
          'HP-07: Bearing temperature anomaly correlates with Aug 2024 failure pattern',
        ],
        warnings: [
          'TR-01: Pressure 25 PSI above normal operating range',
          'HP-07: Hydraulic pressure fluctuation may indicate seal wear',
          'WD-03: Arc voltage instability suggests power supply degradation',
        ],
        actions: [
          'IMMEDIATE: Initiate TR-01 controlled shutdown and dispatch emergency team',
          'URGENT (72h): Schedule HP-07 bearing alignment and seal inspection',
          'PLANNED: Replace WD-03 power supply module during next maintenance window',
          'MONITOR: Increase TR-01 sensor polling frequency to 500ms intervals',
        ],
      });
      setAnalyzing(false);
    }, 2500);
  };

  const exportLogs = () => {
    const headers = 'Timestamp,Level,Source,Message\n';
    const rows = logs.map(l => `"${l.timestamp}","${l.level}","${l.source}","${l.message}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'syncplant-logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Log Analysis</h2>
          <p className="text-muted-foreground text-sm">AI-powered log scanning and anomaly detection</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportLogs} className="btn-secondary flex items-center gap-2">
            <Download size={14} /> Export Logs
          </button>
          <button onClick={analyzeLog} className="btn-primary flex items-center gap-2" disabled={analyzing}>
            <Cpu size={14} /> {analyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>
      </header>

      {/* Custom Log Input */}
      <div className="card-industrial p-4">
        <p className="data-label mb-2">Paste or Upload Logs for Analysis</p>
        <textarea
          value={customLog}
          onChange={(e) => setCustomLog(e.target.value)}
          placeholder="Paste machine logs here... or click 'Analyze with AI' to scan system logs"
          className="w-full bg-background border border-border rounded-md p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ai h-24 resize-none"
        />
      </div>

      {/* Scanning Animation */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card-industrial p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-ai/5 to-transparent scan-line" />
            <div className="text-center relative z-10">
              <Cpu size={32} className="text-ai mx-auto mb-3 animate-spin" />
              <p className="text-sm font-bold text-foreground">AI Scanning Logs...</p>
              <p className="text-xs text-muted-foreground mt-1">Analyzing patterns, detecting anomalies, correlating events</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="card-industrial border-danger/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon size={16} className="text-danger" />
                <h4 className="text-xs font-bold text-danger uppercase">Critical Issues ({analysisResult.critical.length})</h4>
              </div>
              <ul className="space-y-2">
                {analysisResult.critical.map((c, i) => (
                  <li key={i} className="text-xs text-foreground/80 bg-danger/5 p-2 rounded border border-danger/20">{c}</li>
                ))}
              </ul>
            </div>
            <div className="card-industrial border-caution/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-caution" />
                <h4 className="text-xs font-bold text-caution uppercase">Warnings ({analysisResult.warnings.length})</h4>
              </div>
              <ul className="space-y-2">
                {analysisResult.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-foreground/80 bg-caution/5 p-2 rounded border border-caution/20">{w}</li>
                ))}
              </ul>
            </div>
            <div className="card-industrial border-ai/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={16} className="text-ai" />
                <h4 className="text-xs font-bold text-ai uppercase">Suggested Actions ({analysisResult.actions.length})</h4>
              </div>
              <ul className="space-y-2">
                {analysisResult.actions.map((a, i) => (
                  <li key={i} className="text-xs text-foreground/80 bg-ai/5 p-2 rounded border border-ai/20">{a}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Table */}
      <div className="card-industrial p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="section-title">System Logs</h3>
          <div className="flex gap-1">
            {(['ALL', 'ERROR', 'WARN', 'INFO'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] px-2 py-1 rounded font-mono font-bold transition-colors ${
                  filter === f ? 'bg-ai/20 text-ai border border-ai/30' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filtered.map(log => (
            <div key={log.id} className="flex items-center gap-3 text-xs py-2 border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
              <span className="font-mono text-muted-foreground w-28 shrink-0">{log.timestamp}</span>
              <span className={`status-badge w-14 text-center ${
                log.level === 'ERROR' ? 'status-critical' : log.level === 'WARN' ? 'status-warning' : 'status-running'
              }`}>{log.level}</span>
              <span className="font-mono text-ai w-12 shrink-0">{log.source}</span>
              <span className="text-foreground/70">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
