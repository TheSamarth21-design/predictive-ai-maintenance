import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Check, X, Settings, Send } from 'lucide-react';
import { generateAlerts, type Alert } from '@/lib/syncplant-data';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts());
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailPreview, setEmailPreview] = useState<Alert | null>(null);
  const [emailSettings, setEmailSettings] = useState({
    recipient: 'ops-team@syncplant.io',
    ccList: 'manager@syncplant.io',
    criticalOnly: false,
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Alerts & Notifications</h2>
          <p className="text-muted-foreground text-sm">Real-time alerts and email notification management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="btn-secondary text-xs">Mark All Read</button>
          <div className="flex items-center gap-2 btn-secondary">
            <Bell size={14} />
            <span className="font-mono text-xs">{unreadCount}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert List */}
        <div className="lg:col-span-2 space-y-2">
          <AnimatePresence>
            {alerts.map(alert => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`card-industrial flex items-start gap-3 ${!alert.read ? 'border-l-2' : ''} ${
                  alert.type === 'critical' ? 'border-l-danger' :
                  alert.type === 'warning' ? 'border-l-caution' : 'border-l-ai'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alert.type === 'critical' ? 'bg-danger live-pulse' :
                  alert.type === 'warning' ? 'bg-caution' : 'bg-ai'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`status-badge ${
                      alert.type === 'critical' ? 'status-critical' :
                      alert.type === 'warning' ? 'status-warning' : 'status-running'
                    }`}>{alert.type}</span>
                    <span className="font-mono text-xs text-ai">{alert.machine}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-foreground/80">{alert.message}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {alert.type === 'critical' && (
                    <button onClick={() => setEmailPreview(alert)} className="p-1 text-muted-foreground hover:text-ai transition-colors" title="Preview email">
                      <Mail size={14} />
                    </button>
                  )}
                  {!alert.read && (
                    <button onClick={() => markRead(alert.id)} className="p-1 text-muted-foreground hover:text-safe transition-colors" title="Mark read">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => dismissAlert(alert.id)} className="p-1 text-muted-foreground hover:text-danger transition-colors" title="Dismiss">
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Email Settings */}
        <div className="space-y-4">
          <div className="card-industrial p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={16} className="text-ai" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Email Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground">Email Alerts</span>
                <button
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${emailEnabled ? 'bg-safe' : 'bg-secondary'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all ${emailEnabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <div>
                <label className="data-label">Recipient</label>
                <input
                  value={emailSettings.recipient}
                  onChange={(e) => setEmailSettings(s => ({ ...s, recipient: e.target.value }))}
                  className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-ai"
                />
              </div>

              <div>
                <label className="data-label">CC</label>
                <input
                  value={emailSettings.ccList}
                  onChange={(e) => setEmailSettings(s => ({ ...s, ccList: e.target.value }))}
                  className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-ai"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground">Critical alerts only</span>
                <button
                  onClick={() => setEmailSettings(s => ({ ...s, criticalOnly: !s.criticalOnly }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${emailSettings.criticalOnly ? 'bg-safe' : 'bg-secondary'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all ${emailSettings.criticalOnly ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <AnimatePresence>
            {emailPreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="card-industrial p-4 border-ai/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={16} className="text-ai" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Email Preview</h3>
                  <button onClick={() => setEmailPreview(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">To:</span>
                    <span className="font-mono text-foreground">{emailSettings.recipient}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">CC:</span>
                    <span className="font-mono text-foreground">{emailSettings.ccList}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-12">Subject:</span>
                    <span className="font-mono text-danger font-bold">🔴 CRITICAL: {emailPreview.machine} — {emailPreview.message.slice(0, 50)}...</span>
                  </div>
                  <div className="mt-3 p-3 bg-background rounded border border-border">
                    <p className="text-foreground/80 leading-relaxed">
                      <strong>SyncPlant Alert Notification</strong><br /><br />
                      Machine: {emailPreview.machine}<br />
                      Severity: {emailPreview.type.toUpperCase()}<br />
                      Time: {emailPreview.timestamp}<br /><br />
                      {emailPreview.message}<br /><br />
                      <em className="text-muted-foreground">This is an automated alert from SyncPlant AI Predictive Maintenance System.</em>
                    </p>
                  </div>
                  <button className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                    <Send size={14} /> Send Email (Simulated)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
