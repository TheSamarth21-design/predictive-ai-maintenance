import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Database, History, Cpu,
  Flame, BarChart3, Bell, Zap, ChevronLeft, ChevronRight, Upload,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: '/', icon: LayoutDashboard, label: 'Control Center' },
  { id: '/monitoring', icon: Activity, label: 'Live Telemetry' },
  { id: '/logs', icon: Database, label: 'Log Analysis' },
  { id: '/schedule', icon: History, label: 'Maintenance' },
  { id: '/heatmap', icon: Flame, label: 'Risk Heatmap' },
  { id: '/analytics', icon: BarChart3, label: 'Cost Analytics' },
  { id: '/alerts', icon: Bell, label: 'Alerts & Email' },
  { id: '/ai', icon: Cpu, label: 'AI Assistant' },
  { id: '/upload', icon: Upload, label: 'Data Upload' },
];

interface Props {
  alertCount: number;
}

export default function AppSidebar({ alertCount }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={`${collapsed ? 'w-16' : 'w-60'} border-r border-border flex flex-col bg-sidebar backdrop-blur-xl transition-all duration-200 shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-8 h-8 bg-ai rounded flex items-center justify-center shrink-0 glow-ai">
          <Zap size={18} className="text-primary-foreground fill-current" />
        </div>
        {!collapsed && (
          <h1 className="font-bold text-lg tracking-tighter text-foreground whitespace-nowrap">SYNCPLANT</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium relative ${
                active
                  ? 'bg-ai/10 text-ai border border-ai/20'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {item.id === '/alerts' && alertCount > 0 && (
                <span className="absolute right-2 top-1.5 w-4 h-4 bg-danger rounded-full text-[9px] font-bold flex items-center justify-center text-danger-foreground">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <div className="card-industrial p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-safe live-pulse" />
              <span className="data-label">System Status</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI Engine v4.2 Active. Processing 1.2k events/sec.
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
