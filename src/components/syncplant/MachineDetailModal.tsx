import { motion, AnimatePresence } from 'framer-motion';
import { X, Thermometer, Wind, Gauge, RotateCw, BrainCircuit, Activity } from 'lucide-react';
import type { Machine } from '@/lib/syncplant-data';
import { useState } from 'react'; // Added for AI State

interface Props {
  machine: Machine | null;
  onClose: () => void;
}

const REPAIR_STEPS: Record<string, string[]> = {
  'Critical': [
    'Initiate emergency shutdown protocol',
    'Isolate affected system from plant grid',
    'Deploy emergency maintenance team',
    'Replace damaged components',
    'Recalibrate all sensors post-repair',
    'Run 4-hour burn-in test before resuming',
  ],
  'Warning': [
    'Inspect flagged components during next shift',
    'Lubricate secondary gear assembly',
    'Recalibrate vibration sensors',
    'Check for loose mounting bolts',
    'Monitor for 24h post-maintenance',
  ],
  'Running': [
    'Continue standard monitoring protocol',
    'Schedule next routine inspection per calendar',
  ],
};

export default function MachineDetailModal({ machine, onClose }: Props) {
  // --- NEW AI PREDICTION LOGIC ---
  const [rul, setRul] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const getAIPrediction = async () => {
    if (!machine) return;
    setLoadingAI(true);
    
    try {
      // Mapping your UI data to the 21 NASA sensor inputs
      // We use real values for the ones we have, and static baselines for the rest
      const sensorInput = [
        machine.temp, machine.vibration, machine.pressure, machine.rpm,
        14.62, 21.61, 554.36, 2388.06, 9046.19, 1.30, 47.47, 521.66, 
        2388.02, 8138.62, 8.41, 0.03, 392, 2388, 100, 39.06, 23.41
      ];

const response = await fetch("http://127.0.0.1:8000/predict",
  {
          method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensors: sensorInput }),
      });

      const data = await response.json();
      setRul(data.rul);
    } catch (error) {
      console.error("AI Server Offline. Make sure your Python script is running!", error);
      alert("AI Server is offline! Run 'python3 main.py' in your nasa_project folder.");
    } finally {
      setLoadingAI(false);
    }
  };
  // -------------------------------

  return (
    <AnimatePresence>
      {machine && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-card border border-border w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
              <div>
                <h3 className="text-xl font-bold text-foreground">{machine.id} — {machine.name}</h3>
                <p className="text-muted-foreground text-xs font-mono">LAST SERVICE: {machine.lastService} | NEXT: {machine.nextService}</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Diagnostics */}
              <div className="space-y-6">
                <div>
                  <p className="data-label mb-2">AI Diagnosis</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {machine.status === 'Critical'
                      ? `Critical anomaly detected. Core temperature at ${machine.temp}°C exceeds safe operating limit. Vibration at ${machine.vibration}g indicates imminent mechanical failure. Probability of catastrophic failure within 12 hours: 82%.`
                      : machine.status === 'Warning'
                      ? `Warning-level anomaly in vibration pattern (${machine.vibration}g). Pattern matches pre-failure signature. Bearing alignment recommended within 72 hours. Failure probability: ${machine.risk}%.`
                      : `All parameters within normal operating ranges. No anomalies detected. System health: ${machine.health}%.`
                    }
                  </p>
                </div>

                {/* --- NEW NASA AI PREDICTION SECTION --- */}
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit size={18} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 tracking-wider uppercase">NASA Turbofan Predictor</span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-foreground">
                      {loadingAI ? "..." : rul !== null ? rul : "--"}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">CYCLES REMAINING</span>
                  </div>

                  <button 
                    onClick={getAIPrediction}
                    disabled={loadingAI}
                    className="w-full mt-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-widest uppercase rounded transition-all flex items-center justify-center gap-2"
                  >
                    <Activity size={12} />
                    {loadingAI ? "Analysing Sensors..." : "Run AI Prediction"}
                  </button>
                </div>
                {/* --------------------------------------- */}

                {/* Sensor Readouts */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Thermometer, label: 'TEMPERATURE', value: `${machine.temp}°C`, warn: machine.temp > 80 },
                    { icon: Wind, label: 'VIBRATION', value: `${machine.vibration}g`, warn: machine.vibration > 0.4 },
                    { icon: Gauge, label: 'PRESSURE', value: `${machine.pressure} PSI`, warn: machine.pressure > 130 },
                    { icon: RotateCw, label: 'RPM', value: `${machine.rpm}`, warn: false },
                  ].map((s, i) => (
                    <div key={i} className="card-industrial p-3">
                      <s.icon size={14} className={s.warn ? 'text-caution' : 'text-ai'} />
                      <div className="text-lg font-mono text-foreground mt-1">{s.value}</div>
                      <div className="data-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Maintenance History */}
                <div>
                  <p className="data-label mb-2">Maintenance History</p>
                  <div className="space-y-2">
                    {machine.history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-secondary/50 p-2 rounded border border-border">
                        <div>
                          <span className="font-mono text-muted-foreground">{h.date}</span>
                          <span className={`ml-2 ${h.type === 'Emergency' ? 'text-danger' : 'text-safe'}`}>{h.type}</span>
                        </div>
                        <span className="text-foreground/70">${h.cost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="space-y-4">
                <p className="data-label">Recommended Actions</p>
                <ul className="space-y-2">
                  {(REPAIR_STEPS[machine.status] || REPAIR_STEPS['Running']).map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-foreground/80 bg-secondary/30 p-2.5 rounded border border-border">
                      <div className="w-5 h-5 rounded-full bg-ai/20 text-ai flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {/* Effect if not maintained */}
                <div className="card-industrial border-danger/30 bg-danger/5 p-4">
                  <p className="data-label text-danger mb-1">⚠ Effect if Not Maintained</p>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {machine.risk > 70
                      ? `Catastrophic failure within 12-48 hours. Estimated emergency repair cost: $${(machine.history[0]?.cost || 5000) * 3}. Potential collateral damage to adjacent systems. Full production line shutdown for 24-72 hours.`
                      : machine.risk > 40
                      ? `Progressive degradation over 1-2 weeks. Component failure cost increases 3-5x if not addressed promptly. Risk of cascading failures to connected subsystems.`
                      : `Minimal short-term impact. Routine maintenance ensures continued optimal performance and extends equipment lifespan.`
                    }
                  </p>
                </div>

                <button className="w-full py-3 btn-primary text-sm mt-4">
                  SCHEDULE MAINTENANCE NOW
                </button>
                <button className="w-full py-2.5 btn-secondary text-sm">
                  GENERATE DETAILED REPORT
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
