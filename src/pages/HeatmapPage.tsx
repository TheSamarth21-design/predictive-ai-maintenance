import { useState } from 'react';
import { motion } from 'framer-motion';
import { MACHINES } from '@/lib/syncplant-data';
import MachineDetailModal from '@/components/syncplant/MachineDetailModal';
import type { Machine } from '@/lib/syncplant-data';

export default function HeatmapPage() {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sorted = [...MACHINES].sort((a, b) => b.risk - a.risk);

  const getRiskColor = (risk: number) => {
    if (risk > 80) return 'bg-danger/80 border-danger/60';
    if (risk > 60) return 'bg-danger/40 border-danger/30';
    if (risk > 40) return 'bg-caution/40 border-caution/30';
    if (risk > 20) return 'bg-caution/20 border-caution/20';
    return 'bg-safe/20 border-safe/20';
  };

  const getRiskTextColor = (risk: number) => {
    if (risk > 60) return 'text-danger';
    if (risk > 40) return 'text-caution';
    return 'text-safe';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Risk Heatmap</h2>
        <p className="text-muted-foreground text-sm">Visual risk assessment across all monitored assets</p>
      </header>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MACHINES.map(m => (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.03 }}
            onHoverStart={() => setHoveredId(m.id)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => setSelectedMachine(m)}
            className={`relative p-5 rounded-lg border cursor-pointer transition-all ${getRiskColor(m.risk)}`}
          >
            <div className="text-center">
              <p className="font-mono font-bold text-foreground text-lg">{m.id}</p>
              <p className="text-xs text-foreground/60 mb-2">{m.name}</p>
              <p className={`text-3xl font-mono font-bold ${getRiskTextColor(m.risk)}`}>{m.risk}%</p>
              <p className="data-label mt-1">RISK</p>
            </div>

            {hoveredId === m.id && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full z-10 bg-card border border-border rounded-md p-3 shadow-xl w-48"
              >
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`${m.status === 'Critical' ? 'text-danger' : m.status === 'Warning' ? 'text-caution' : 'text-safe'}`}>{m.status}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span className="font-mono">{m.temp}°C</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vibration</span><span className="font-mono">{m.vibration}g</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Health</span><span className="font-mono">{m.health}%</span></div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Risk Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-industrial p-4">
          <h3 className="section-title mb-3">Risk Ranking</h3>
          <div className="space-y-2">
            {sorted.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 text-xs py-2 border-b border-border/30 last:border-0">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-foreground text-[10px]">{i + 1}</span>
                <span className="font-mono font-bold text-foreground w-12">{m.id}</span>
                <span className="flex-1 text-muted-foreground">{m.name}</span>
                <div className="w-24 bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${m.risk > 60 ? 'bg-danger' : m.risk > 30 ? 'bg-caution' : 'bg-safe'}`} style={{ width: `${m.risk}%` }} />
                </div>
                <span className={`font-mono font-bold w-10 text-right ${getRiskTextColor(m.risk)}`}>{m.risk}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factor Breakdown */}
        <div className="card-industrial p-4">
          <h3 className="section-title mb-3">Risk Factor Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {['Machine', 'Thermal', 'Vibration', 'Pressure', 'Age', 'Overall'].map(h => (
                    <th key={h} className="data-label text-left py-2 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MACHINES.map(m => {
                  const thermal = Math.min(100, Math.round((m.temp / 120) * 100));
                  const vib = Math.min(100, Math.round((m.vibration / 1) * 100));
                  const pres = Math.min(100, Math.round((m.pressure / 150) * 100));
                  const age = 100 - m.health;
                  return (
                    <tr key={m.id} className="border-b border-border/30">
                      <td className="py-2 px-2 font-mono font-bold text-foreground">{m.id}</td>
                      <td className={`py-2 px-2 font-mono ${thermal > 70 ? 'text-danger' : 'text-foreground'}`}>{thermal}%</td>
                      <td className={`py-2 px-2 font-mono ${vib > 50 ? 'text-caution' : 'text-foreground'}`}>{vib}%</td>
                      <td className={`py-2 px-2 font-mono ${pres > 80 ? 'text-danger' : 'text-foreground'}`}>{pres}%</td>
                      <td className={`py-2 px-2 font-mono ${age > 50 ? 'text-caution' : 'text-foreground'}`}>{age}%</td>
                      <td className={`py-2 px-2 font-mono font-bold ${getRiskTextColor(m.risk)}`}>{m.risk}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MachineDetailModal machine={selectedMachine} onClose={() => setSelectedMachine(null)} />
    </div>
  );
}
