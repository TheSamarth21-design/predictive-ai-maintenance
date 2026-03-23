import { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MACHINES, generateSensorData, type Machine } from '@/lib/syncplant-data';
import MachineDetailModal from '@/components/syncplant/MachineDetailModal';

export default function MonitoringPage() {
  const [sensorData, setSensorData] = useState(generateSensorData(30));
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => [...prev.slice(1), {
        time: prev[prev.length - 1].time + 1,
        timestamp: new Date().toLocaleTimeString(),
        temp: 55 + Math.random() * 35,
        vibration: 0.1 + Math.random() * 0.7,
        pressure: 95 + Math.random() * 30,
        rpm: 800 + Math.random() * 2500,
      }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const chartStyle = {
    bg: 'hsl(222, 47%, 5%)',
    border: 'hsl(217, 33%, 15%)',
    grid: 'hsl(217, 33%, 15%)',
    axis: 'hsl(215, 16%, 47%)',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Live Telemetry</h2>
        <p className="text-muted-foreground text-sm">Real-time sensor data across all monitored assets</p>
      </header>

      {/* Sensor Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { key: 'temp', label: 'Temperature (°C)', color: 'hsl(0, 84%, 60%)', gradId: 'gTemp' },
          { key: 'vibration', label: 'Vibration (g)', color: 'hsl(239, 84%, 67%)', gradId: 'gVib' },
          { key: 'pressure', label: 'Pressure (PSI)', color: 'hsl(38, 92%, 50%)', gradId: 'gPres' },
          { key: 'rpm', label: 'RPM', color: 'hsl(160, 84%, 39%)', gradId: 'gRpm' },
        ].map(sensor => (
          <div key={sensor.key} className="card-industrial p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="section-title">{sensor.label}</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full live-pulse" style={{ backgroundColor: sensor.color }} />
                <span className="data-label">LIVE</span>
              </div>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorData}>
                  <defs>
                    <linearGradient id={sensor.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={sensor.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={sensor.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke={chartStyle.axis} fontSize={10} fontFamily="monospace" width={40} />
                  <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, fontSize: '11px', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey={sensor.key} stroke={sensor.color} fillOpacity={1} fill={`url(#${sensor.gradId})`} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Live Sensor Table */}
      <div className="card-industrial p-4">
        <h3 className="section-title mb-3">Machine Sensor Readings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Machine', 'Status', 'Temp (°C)', 'Vibration (g)', 'Pressure (PSI)', 'RPM', 'Load (%)', 'Health (%)'].map(h => (
                  <th key={h} className="data-label text-left py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MACHINES.map(m => (
                <tr
                  key={m.id}
                  onClick={() => setSelectedMachine(m)}
                  className="border-b border-border/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-foreground">{m.id}</td>
                  <td className="py-2.5 px-3">
                    <span className={`status-badge ${m.status === 'Critical' ? 'status-critical' : m.status === 'Warning' ? 'status-warning' : 'status-running'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 font-mono ${m.temp > 80 ? 'text-danger' : 'text-foreground'}`}>{m.temp}</td>
                  <td className={`py-2.5 px-3 font-mono ${m.vibration > 0.4 ? 'text-caution' : 'text-foreground'}`}>{m.vibration}</td>
                  <td className={`py-2.5 px-3 font-mono ${m.pressure > 130 ? 'text-danger' : 'text-foreground'}`}>{m.pressure}</td>
                  <td className="py-2.5 px-3 font-mono text-foreground">{m.rpm}</td>
                  <td className="py-2.5 px-3 font-mono text-foreground">{m.load}%</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${m.health > 80 ? 'bg-safe' : m.health > 50 ? 'bg-caution' : 'bg-danger'}`} style={{ width: `${m.health}%` }} />
                      </div>
                      <span className="font-mono text-foreground">{m.health}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MachineDetailModal machine={selectedMachine} onClose={() => setSelectedMachine(null)} />
    </div>
  );
}
