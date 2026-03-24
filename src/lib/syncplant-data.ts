// ─── Mock Data & Types for SyncPlant ───

export type MachineStatus = 'Running' | 'Warning' | 'Critical' | 'Offline';

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  risk: number;
  load: number;
  temp: number;
  vibration: number;
  pressure: number;
  rpm: number;
  health: number;
  lastService: string;
  nextService: string;
  history: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  date: string;
  type: string;
  description: string;
  cost: number;
  duration: string;
}

export interface SensorReading {
  time: number;
  timestamp: string;
  temp: number;
  vibration: number;
  pressure: number;
  rpm: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  machine: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ScheduleTask {
  id: string;
  machine: string;
  task: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  dueDate: string;
  estimatedTime: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  aiReasoning: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  source: string;
  message: string;
}

export const MACHINES: Machine[] = [
  {
    id: 'HP-07', name: 'Hydraulic Press', status: 'Warning', risk: 68, load: 82, temp: 74, vibration: 0.6, pressure: 112, rpm: 1450, health: 72, lastService: '2024-11-14', nextService: '2025-01-20',
    history: [
      { date: '2024-11-14', type: 'Scheduled', description: 'Bearing replacement', cost: 199200, duration: '4h' },
      { date: '2024-08-22', type: 'Emergency', description: 'Hydraulic seal failure', cost: 705500, duration: '12h' },
      { date: '2024-05-10', type: 'Scheduled', description: 'Pressure calibration', cost: 49800, duration: '2h' },
    ]
  },
  {
    id: 'CN-12', name: 'CNC Milling Center', status: 'Running', risk: 12, load: 45, temp: 42, vibration: 0.1, pressure: 98, rpm: 3200, health: 98, lastService: '2025-01-05', nextService: '2025-04-15',
    history: [
      { date: '2025-01-05', type: 'Scheduled', description: 'Spindle lubrication', cost: 29050, duration: '1.5h' },
      { date: '2024-10-18', type: 'Scheduled', description: 'Tool holder inspection', cost: 16600, duration: '1h' },
    ]
  },
  {
    id: 'TR-01', name: 'Thermal Reactor', status: 'Critical', risk: 94, load: 95, temp: 112, vibration: 0.9, pressure: 145, rpm: 800, health: 24, lastService: '2024-09-30', nextService: '2025-01-10',
    history: [
      { date: '2024-09-30', type: 'Emergency', description: 'Core temperature regulation failure', cost: 1245000, duration: '24h' },
      { date: '2024-07-15', type: 'Scheduled', description: 'Thermal insulation replacement', cost: 348600, duration: '8h' },
      { date: '2024-03-20', type: 'Emergency', description: 'Pressure relief valve stuck', cost: 564400, duration: '6h' },
    ]
  },
  {
    id: 'AP-04', name: 'Assembly Pivot Arm', status: 'Running', risk: 5, load: 30, temp: 38, vibration: 0.05, pressure: 95, rpm: 120, health: 99, lastService: '2025-01-12', nextService: '2025-06-01',
    history: [
      { date: '2025-01-12', type: 'Scheduled', description: 'Joint lubrication', cost: 12450, duration: '0.5h' },
    ]
  },
  {
    id: 'WD-03', name: 'Welding Station Delta', status: 'Warning', risk: 45, load: 67, temp: 88, vibration: 0.35, pressure: 105, rpm: 0, health: 61, lastService: '2024-12-01', nextService: '2025-02-15',
    history: [
      { date: '2024-12-01', type: 'Scheduled', description: 'Electrode replacement', cost: 66400, duration: '2h' },
      { date: '2024-09-15', type: 'Emergency', description: 'Power supply fault', cost: 265600, duration: '5h' },
    ]
  },
  {
    id: 'CV-08', name: 'Conveyor Belt System', status: 'Running', risk: 18, load: 55, temp: 35, vibration: 0.15, pressure: 0, rpm: 60, health: 91, lastService: '2025-01-08', nextService: '2025-04-08',
    history: [
      { date: '2025-01-08', type: 'Scheduled', description: 'Belt tension adjustment', cost: 20750, duration: '1h' },
    ]
  },
  {
    id: 'CM-02', name: 'Compressor Unit B', status: 'Running', risk: 22, load: 70, temp: 56, vibration: 0.2, pressure: 130, rpm: 2800, health: 85, lastService: '2024-12-20', nextService: '2025-03-20',
    history: [
      { date: '2024-12-20', type: 'Scheduled', description: 'Filter replacement', cost: 37350, duration: '1.5h' },
      { date: '2024-08-10', type: 'Scheduled', description: 'Valve inspection', cost: 24900, duration: '2h' },
    ]
  },
  {
    id: 'RB-05', name: 'Robotic Arm #5', status: 'Running', risk: 8, load: 40, temp: 44, vibration: 0.08, pressure: 0, rpm: 0, health: 96, lastService: '2025-01-15', nextService: '2025-07-15',
    history: [
      { date: '2025-01-15', type: 'Scheduled', description: 'Servo calibration', cost: 41500, duration: '2h' },
    ]
  },
];

export const SCHEDULE_TASKS: ScheduleTask[] = [
  { id: 'T001', machine: 'TR-01', task: 'Emergency thermal core inspection', priority: 'P1', dueDate: '2025-01-17', estimatedTime: '6h', status: 'In Progress', aiReasoning: 'Failure probability 94%. Temperature readings 12°C above critical threshold. Vibration anomaly detected in core assembly. Immediate intervention required to prevent catastrophic failure.' },
  { id: 'T002', machine: 'HP-07', task: 'Drive shaft bearing alignment', priority: 'P2', dueDate: '2025-01-20', estimatedTime: '4h', status: 'Pending', aiReasoning: 'Vibration analysis shows 0.6g — exceeds 0.4g threshold. Pattern matches pre-failure signature from August 2024 incident. Recommended within 72 hours.' },
  { id: 'T003', machine: 'WD-03', task: 'Power supply module replacement', priority: 'P2', dueDate: '2025-01-22', estimatedTime: '3h', status: 'Pending', aiReasoning: 'Intermittent voltage fluctuations detected. Similar pattern preceded Sept 2024 failure. Preventive replacement recommended.' },
  { id: 'T004', machine: 'CN-12', task: 'Spindle bearing lubrication', priority: 'P3', dueDate: '2025-02-01', estimatedTime: '1.5h', status: 'Pending', aiReasoning: 'Routine maintenance per 3-month cycle. No anomalies detected. Standard preventive measure.' },
  { id: 'T005', machine: 'CM-02', task: 'Compressor valve inspection', priority: 'P3', dueDate: '2025-02-05', estimatedTime: '2h', status: 'Pending', aiReasoning: 'Scheduled inspection. Minor pressure fluctuation noted. Low risk but worth monitoring.' },
  { id: 'T006', machine: 'CV-08', task: 'Belt alignment check', priority: 'P4', dueDate: '2025-02-15', estimatedTime: '1h', status: 'Completed', aiReasoning: 'Routine quarterly check. Belt wear within acceptable limits.' },
  { id: 'T007', machine: 'AP-04', task: 'Joint lubrication cycle', priority: 'P4', dueDate: '2025-03-01', estimatedTime: '0.5h', status: 'Completed', aiReasoning: 'Regular 6-month lubrication. All parameters nominal.' },
];

export const SAMPLE_LOGS: LogEntry[] = [
  { id: 'L001', timestamp: '2025-01-16 14:32:01', level: 'ERROR', source: 'TR-01', message: 'Core temperature exceeded critical threshold: 112°C (limit: 100°C)' },
  { id: 'L002', timestamp: '2025-01-16 14:31:45', level: 'WARN', source: 'TR-01', message: 'Pressure rising abnormally: 145 PSI (normal: 100-120 PSI)' },
  { id: 'L003', timestamp: '2025-01-16 14:30:22', level: 'ERROR', source: 'TR-01', message: 'Vibration sensor alarm triggered: 0.9g exceeds 0.5g safety limit' },
  { id: 'L004', timestamp: '2025-01-16 14:28:10', level: 'WARN', source: 'HP-07', message: 'Hydraulic pressure fluctuation detected: ±8 PSI variance' },
  { id: 'L005', timestamp: '2025-01-16 14:25:33', level: 'INFO', source: 'CN-12', message: 'Spindle speed calibration completed successfully' },
  { id: 'L006', timestamp: '2025-01-16 14:22:18', level: 'WARN', source: 'WD-03', message: 'Welding arc voltage unstable: 22V (nominal: 24V ±0.5V)' },
  { id: 'L007', timestamp: '2025-01-16 14:20:05', level: 'INFO', source: 'AP-04', message: 'Assembly cycle completed. Parts count: 1,247. Zero defects.' },
  { id: 'L008', timestamp: '2025-01-16 14:18:44', level: 'DEBUG', source: 'CV-08', message: 'Belt speed adjusted to 1.2m/s for batch #4402' },
  { id: 'L009', timestamp: '2025-01-16 14:15:00', level: 'INFO', source: 'RB-05', message: 'Servo position calibration: deviation < 0.01mm. Nominal.' },
  { id: 'L010', timestamp: '2025-01-16 14:12:30', level: 'ERROR', source: 'HP-07', message: 'Bearing temperature anomaly: 74°C on secondary drive shaft' },
];

export function generateSensorData(count = 20): SensorReading[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    time: i,
    timestamp: new Date(now - (count - i) * 3000).toLocaleTimeString(),
    temp: 55 + Math.random() * 35,
    vibration: 0.1 + Math.random() * 0.7,
    pressure: 95 + Math.random() * 30,
    rpm: 800 + Math.random() * 2500,
  }));
}

export function generateAlerts(): Alert[] {
  return [
    { id: 'A001', type: 'critical', machine: 'TR-01', message: 'Core temperature critical: 112°C. Immediate shutdown recommended.', timestamp: '2 min ago', read: false },
    { id: 'A002', type: 'critical', machine: 'TR-01', message: 'Vibration exceeds safety threshold. Bearing failure imminent.', timestamp: '5 min ago', read: false },
    { id: 'A003', type: 'warning', machine: 'HP-07', message: 'Drive shaft vibration anomaly detected. Schedule inspection.', timestamp: '12 min ago', read: false },
    { id: 'A004', type: 'warning', machine: 'WD-03', message: 'Arc voltage instability. Check power supply module.', timestamp: '25 min ago', read: true },
    { id: 'A005', type: 'info', machine: 'CN-12', message: 'Scheduled maintenance due in 5 days.', timestamp: '1 hour ago', read: true },
    { id: 'A006', type: 'info', machine: 'CV-08', message: 'Belt tension within optimal range after adjustment.', timestamp: '2 hours ago', read: true },
  ];
}

// AI Chat responses
export function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  
  if (lower.includes('hp-07') || lower.includes('hydraulic')) {
    return "**HP-07 — Hydraulic Press Analysis:**\n\n• **Status:** Warning (Risk: 68%)\n• **Last failure:** Hydraulic seal — Aug 2024 ($8,500)\n• **Current issue:** Vibration at 0.6g exceeds 0.4g threshold\n• **Diagnosis:** Secondary drive shaft bearing misalignment\n• **Recommendation:** Schedule bearing alignment within 72 hours\n• **Estimated cost:** $2,400 | **Estimated downtime:** 4 hours\n\n⚠️ If not addressed, probability of bearing failure reaches 89% within 7 days.";
  }
  
  if (lower.includes('tr-01') || lower.includes('thermal') || lower.includes('reactor')) {
    return "**🔴 TR-01 — Thermal Reactor CRITICAL:**\n\n• **Failure probability:** 94% within 12 hours\n• **Core temp:** 112°C (limit: 100°C)\n• **Vibration:** 0.9g (limit: 0.5g)\n• **Pressure:** 145 PSI (normal: 100-120)\n\n**Root Cause Analysis:** Coolant circulation pump degradation causing insufficient heat dissipation. Thermal runaway risk.\n\n**Immediate Actions:**\n1. Reduce load to 50%\n2. Engage backup cooling\n3. Dispatch maintenance team\n4. Prepare for emergency shutdown";
  }
  
  if (lower.includes('risk') || lower.includes('risky') || lower.includes('dangerous')) {
    return "**Risk Assessment — All Assets:**\n\n| Machine | Risk | Status |\n|---------|------|--------|\n| TR-01 | 94% | 🔴 Critical |\n| HP-07 | 68% | 🟡 Warning |\n| WD-03 | 45% | 🟡 Warning |\n| CM-02 | 22% | 🟢 Normal |\n| CV-08 | 18% | 🟢 Normal |\n| CN-12 | 12% | 🟢 Normal |\n| RB-05 | 8% | 🟢 Normal |\n| AP-04 | 5% | 🟢 Normal |\n\n**Priority:** TR-01 requires immediate intervention. HP-07 needs attention within 72 hours.";
  }
  
  if (lower.includes('cost') || lower.includes('money') || lower.includes('budget') || lower.includes('savings')) {
    return "**💰 Cost Optimization Report:**\n\n• **Downtime prevented this month:** 124 hours\n• **Estimated savings:** $186,000\n• **Maintenance cost reduction:** 34% vs. reactive approach\n• **Average repair cost (predictive):** $1,200\n• **Average repair cost (reactive):** $7,800\n\n**Recommendation:** Increase predictive maintenance frequency for TR-01 and HP-07 to reduce emergency intervention costs by an additional $45,000/quarter.";
  }
  
  if (lower.includes('schedule') || lower.includes('maintenance') || lower.includes('next')) {
    return "**📅 Upcoming Maintenance Schedule:**\n\n1. **TR-01** — Emergency thermal inspection (P1) — TODAY\n2. **HP-07** — Drive shaft bearing alignment (P2) — Jan 20\n3. **WD-03** — Power supply replacement (P2) — Jan 22\n4. **CN-12** — Spindle lubrication (P3) — Feb 1\n5. **CM-02** — Valve inspection (P3) — Feb 5\n\n**AI Optimization:** Tasks sequenced to minimize total plant downtime. Parallel maintenance on non-dependent systems where possible.";
  }
  
  if (lower.includes('forecast') || lower.includes('predict') || lower.includes('7 day') || lower.includes('week')) {
    return "**📊 7-Day Risk Forecast:**\n\n• **Day 1-2:** TR-01 failure probability 94% → requires immediate action\n• **Day 3:** HP-07 risk escalates to 78% if bearing not aligned\n• **Day 4-5:** WD-03 power supply degradation continues (estimated 55% risk)\n• **Day 6-7:** All other systems stable if scheduled maintenance proceeds\n\n**Overall plant risk:** Currently 34% — drops to 8% if recommended actions completed by Day 3.";
  }

  if (lower.includes('report') || lower.includes('generate') || lower.includes('export')) {
    return "**📤 Report Generation:**\n\nI can generate the following reports:\n\n1. **Full Plant Health Report** — All KPIs, trends, risk analysis\n2. **Machine-Specific Report** — Detailed single-asset analysis\n3. **Maintenance Summary** — Tasks completed, costs, outcomes\n4. **Cost Optimization Report** — Savings, ROI, recommendations\n5. **Risk Forecast Report** — 7-day predictive analysis\n\nUse the **Export Report** button in the header to download as CSV. Which report would you like details on?";
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm your SyncPlant AI assistant. I can help you with:\n\n• **Machine diagnostics** — Ask about any machine by ID\n• **Risk analysis** — \"Which machine is most risky?\"\n• **Maintenance planning** — \"What's the schedule?\"\n• **Cost insights** — \"How much are we saving?\"\n• **Forecasting** — \"What's the 7-day forecast?\"\n\nWhat would you like to know?";
  }
  
  return "I'm analyzing your query across all plant systems...\n\n**Current Plant Status:**\n• 6/8 machines operational\n• 1 critical alert (TR-01)\n• 2 warnings (HP-07, WD-03)\n• Overall health: 92.4%\n\nCould you be more specific? Try asking about a specific machine (e.g., \"Tell me about TR-01\"), risk levels, costs, or the maintenance schedule.";
}

// Cost data for analytics
export const COST_DATA = [
  { month: 'Jul', reactive: 45000, predictive: 12000, downtime: 82 },
  { month: 'Aug', reactive: 38000, predictive: 15000, downtime: 64 },
  { month: 'Sep', reactive: 52000, predictive: 11000, downtime: 95 },
  { month: 'Oct', reactive: 28000, predictive: 13000, downtime: 48 },
  { month: 'Nov', reactive: 22000, predictive: 14000, downtime: 35 },
  { month: 'Dec', reactive: 18000, predictive: 12000, downtime: 28 },
  { month: 'Jan', reactive: 8000, predictive: 16000, downtime: 12 },
];

export const HEALTH_TREND = [
  { day: 'Mon', health: 94, risk: 12 },
  { day: 'Tue', health: 93, risk: 14 },
  { day: 'Wed', health: 91, risk: 18 },
  { day: 'Thu', health: 89, risk: 22 },
  { day: 'Fri', health: 92, risk: 16 },
  { day: 'Sat', health: 93, risk: 14 },
  { day: 'Sun', health: 92, risk: 15 },
];
