import { useState, useEffect, useRef } from 'react';
import { Activity, ShieldAlert, AlertTriangle, Zap, Clock, FileSpreadsheet, Download, Bell, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatCard from '@/components/syncplant/StatCard';
import MachineCard from '@/components/syncplant/MachineCard';
import MachineDetailModal from '@/components/syncplant/MachineDetailModal';
import AIChat from '@/components/syncplant/AIChat';
import { MACHINES as INITIAL_MACHINES, generateSensorData, HEALTH_TREND, SAMPLE_LOGS, type Machine, type MaintenanceRecord, type MachineStatus } from '@/lib/syncplant-data';
import { sendMachineAlert } from '@/lib/twilioService';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [sensorData, setSensorData] = useState(generateSensorData());
  const [machines, setMachines] = useState(INITIAL_MACHINES);
  const [alertPhoneNumber, setAlertPhoneNumber] = useState<string>('+919975873744');
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [alertedMachines, setAlertedMachines] = useState<Set<string>>(new Set());
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const alertPhoneRef = useRef<string>('');

  // Update phone ref whenever it changes
  useEffect(() => {
    alertPhoneRef.current = alertPhoneNumber;
  }, [alertPhoneNumber]);

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

  // Auto-send alerts when thresholds are crossed
  useEffect(() => {
    if (!autoAlertEnabled || !alertPhoneRef.current) return;

    const checkAndSendAlerts = async () => {
      const newAlertsToSend: Machine[] = [];

      machines.forEach(machine => {
        // Check if machine crosses any threshold and hasn't been alerted yet
        const isCritical = machine.status === 'Critical';
        const highRisk = machine.risk > 50;
        const lowHealth = machine.health < 50;
        const shouldAlert = isCritical || highRisk || lowHealth;

        if (shouldAlert && !alertedMachines.has(machine.id)) {
          newAlertsToSend.push(machine);
        }
      });

      if (newAlertsToSend.length > 0) {
        setSendingAlert(true);
        try {
          // Send alerts for machines that crossed threshold
          const alerts = newAlertsToSend.map(machine =>
            sendMachineAlert(
              alertPhoneRef.current,
              machine.name,
              `Status: ${machine.status}, Risk: ${machine.risk}%, Health: ${machine.health}%`,
              'Maintenance Team',
              machine.risk > 70 || machine.status === 'Critical' ? 'critical' : 'warning'
            )
          );

          await Promise.all(alerts);

          // Mark these machines as alerted
          setAlertedMachines(prev => {
            const updated = new Set(prev);
            newAlertsToSend.forEach(m => updated.add(m.id));
            return updated;
          });

          setAlertMessage({
            type: 'success',
            text: `⚠️ Auto-alert sent for ${newAlertsToSend.length} critical machine(s)`
          });

          // Clear message after 5 seconds
          setTimeout(() => setAlertMessage(null), 5000);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('Auto-alert error:', err);
          setAlertMessage({
            type: 'error',
            text: `Auto-alert failed: ${errorMessage}`
          });
        } finally {
          setSendingAlert(false);
        }
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkAndSendAlerts, 5000);
    return () => clearInterval(interval);
  }, [machines, alertedMachines, autoAlertEnabled]);

  const exportCSV = () => {
    const headers = 'Machine,Status,Risk,Health,Temperature,Vibration\n';
    const rows = machines.map(m => `${m.id},${m.status},${m.risk}%,${m.health}%,${m.temp}°C,${m.vibration}g`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'syncplant-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Assuming the Excel has columns: id, name, status, risk, load, temp, vibration, pressure, rpm, health, lastService, nextService
      // For simplicity, map to Machine type, with defaults for missing fields
      const importedMachines: Machine[] = jsonData.map((row: Record<string, unknown>, index: number) => ({
        id: String(row.id || `M${Date.now() + index}`),
        name: String(row.name || row.id || 'Unknown Machine'),
        status: (['Running', 'Warning', 'Critical', 'Offline'].includes(String(row.status)) ? row.status as MachineStatus : 'Running'),
        risk: Number(row.risk) || 0,
        load: Number(row.load) || 0,
        temp: Number(row.temp) || 0,
        vibration: Number(row.vibration) || 0,
        pressure: Number(row.pressure) || 0,
        rpm: Number(row.rpm) || 0,
        health: Number(row.health) || 100,
        lastService: String(row.lastService || '2024-01-01'),
        nextService: String(row.nextService || '2024-12-31'),
        history: (Array.isArray(row.history) ? row.history as MaintenanceRecord[] : [])
      }));

      setMachines(importedMachines);
      alert(`Imported ${importedMachines.length} machines from Excel. Replaced existing data.`);
    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('Error importing Excel file. Please check the format.');
    }

    // Reset the input
    e.target.value = '';
  };

  const sendCriticalAlerts = async () => {
    if (!alertPhoneNumber) {
      setAlertMessage({ type: 'error', text: 'Please enter a phone number' });
      return;
    }

    setSendingAlert(true);
    try {
      // Find all critical or high-risk machines
      const criticalMachines = machines.filter(m => m.status === 'Critical' || m.risk > 50);

      if (criticalMachines.length === 0) {
        setAlertMessage({ type: 'success', text: 'No critical machines to alert on.' });
        setSendingAlert(false);
        return;
      }

      // Send alert for each critical machine
      const alerts = criticalMachines.map(machine =>
        sendMachineAlert(
          alertPhoneNumber,
          machine.name,
          `Risk Level: ${machine.risk}%. Health: ${machine.health}%.`,
          'Maintenance Team',
          machine.risk > 70 ? 'critical' : 'warning'
        )
      );

      await Promise.all(alerts);
      setAlertMessage({ 
        type: 'success', 
        text: `Sent ${criticalMachines.length} alert(s) to ${alertPhoneNumber}` 
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setAlertMessage({ 
        type: 'error', 
        text: `Error sending alerts: ${errorMessage}` 
      });
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Operational Overview</h2>
          <p className="text-muted-foreground text-sm">Real-time predictive intelligence for Plant Sector A-12</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleImportExcel} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={14} /> Import Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button onClick={exportCSV} className="btn-primary flex items-center gap-2">
            <Download size={14} /> Export Report
          </button>
          <div className="flex gap-2 items-center bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
            <input
              type="tel"
              placeholder="+1 (555) XXX-XXXX"
              value={alertPhoneNumber}
              onChange={(e) => setAlertPhoneNumber(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground w-40"
            />
            <button
              onClick={sendCriticalAlerts}
              disabled={sendingAlert || !alertPhoneNumber}
              className="btn-primary flex items-center gap-1 py-1 px-3 text-sm disabled:opacity-50"
            >
              <Bell size={14} />
              {sendingAlert ? 'Sending...' : 'Send Alert'}
            </button>
          </div>
          <div className={`flex gap-2 items-center px-3 py-2 rounded-lg border ${
            autoAlertEnabled 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-gray-500/10 border-gray-500/30'
          }`}>
            <Bell size={16} className={autoAlertEnabled ? 'text-green-400' : 'text-gray-400'} />
            <button
              onClick={() => setAutoAlertEnabled(!autoAlertEnabled)}
              className={`text-sm font-semibold transition-colors ${
                autoAlertEnabled ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {autoAlertEnabled ? 'Auto-Alert ON' : 'Auto-Alert OFF'}
            </button>
          </div>
        </div>
      </header>

      {/* Alert Message Display */}
      {alertMessage && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 animate-in fade-in ${
          alertMessage.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {alertMessage.type === 'success' ? (
            <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center text-xs">✓</div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center text-xs">!</div>
          )}
          <span className="text-sm flex-1">{alertMessage.text}</span>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-lg hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

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
              {machines.sort((a, b) => b.risk - a.risk).slice(0, 4).map(m => (
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
