import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, AlertTriangle, Zap, Clock, FileSpreadsheet, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatCard from '@/components/syncplant/StatCard';
import MachineCard from '@/components/syncplant/MachineCard';
import MachineDetailModal from '@/components/syncplant/MachineDetailModal';
import AIChat from '@/components/syncplant/AIChat';
import { MACHINES, generateSensorData, HEALTH_TREND, SAMPLE_LOGS, type Machine } from '@/lib/syncplant-data';

export default function DashboardPage() {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [sensorData, setSensorData] = useState(generateSensorData());

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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const headers = 'Machine,Status,Risk,Health,Temperature,Vibration\n';
    const rows = MACHINES.map(m => `${m.id},${m.status},${m.risk}%,${m.health}%,${m.temp}°C,${m.vibration}g`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'syncplant-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Operational Overview</h2>
          <p className="text-muted-foreground text-sm">Real-time predictive intelligence for Plant Sector A-12</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={14} /> Import Excel
          </button>
          <button onClick={exportCSV} className="btn-primary flex items-center gap-2">
            <Download size={14} /> Export Report
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="System Health" value="92.4%" trend="+2.1%" icon={Activity} variant="safe" />
        <StatCard label="Active Alerts" value="03" trend="-12%" icon={ShieldAlert} variant="danger" />
        <StatCard label="Failure Risk" value="14.8%" trend="+0.4%" icon={AlertTriangle} variant="caution" />
        <StatCard label="Uptime" value="99.2%" trend="+0.3%" icon={Clock} variant="safe" />
        <StatCard label="Downtime Saved" value="124h" trend="+18h" icon={Zap} variant="ai" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Machine Cards */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="section-title">Asset Monitoring</h3>
              <span className="data-label">SORT BY: RISK LEVEL</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MACHINES.sort((a, b) => b.risk - a.risk).slice(0, 4).map(m => (
                <MachineCard key={m.id} machine={m} onClick={setSelectedMachine} />
              ))}
            </div>
          </div>

          {/* Live Telemetry Chart */}
          <div className="card-industrial p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">Global Vibration Telemetry</h3>
              <div className="flex gap-4 items-center">
                <span className="flex items-center gap-1 text-[10px] font-mono text-ai">
                  <span className="w-2 h-2 bg-ai rounded-full" /> VIBRATION
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-caution">
                  <span className="w-2 h-2 bg-caution rounded-full" /> THRESHOLD
                </span>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorData}>
                  <defs>
                    <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 15%)" vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="hsl(215, 16%, 47%)" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(222, 47%, 5%)', border: '1px solid hsl(217, 33%, 15%)', fontSize: '11px', borderRadius: '6px' }}
                    labelStyle={{ color: 'hsl(215, 16%, 47%)' }}
                  />
                  <Area type="monotone" dataKey="vibration" stroke="hsl(239, 84%, 67%)" fillOpacity={1} fill="url(#vibGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Health Trend */}
          <div className="card-industrial p-5">
            <h3 className="section-title mb-4">7-Day Health Trend</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HEALTH_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 15%)" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(215, 16%, 47%)" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="hsl(215, 16%, 47%)" fontSize={10} fontFamily="monospace" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 5%)', border: '1px solid hsl(217, 33%, 15%)', fontSize: '11px', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="health" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="risk" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="card-industrial p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="section-title">Live Activity Feed</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-safe live-pulse" />
                <span className="data-label">LIVE</span>
              </div>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {SAMPLE_LOGS.slice(0, 6).map(log => (
                <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/50 last:border-0">
                  <span className="font-mono text-muted-foreground w-16 shrink-0">{log.timestamp.split(' ')[1]}</span>
                  <span className={`status-badge ${
                    log.level === 'ERROR' ? 'status-critical' : log.level === 'WARN' ? 'status-warning' : 'status-running'
                  }`}>{log.level}</span>
                  <span className="font-mono text-ai w-10 shrink-0">{log.source}</span>
                  <span className="text-foreground/70 truncate">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div>
          <AIChat />
        </div>
      </div>

      <MachineDetailModal machine={selectedMachine} onClose={() => setSelectedMachine(null)} />
    </div>
  );
}
