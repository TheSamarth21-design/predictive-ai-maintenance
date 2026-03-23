import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { COST_DATA } from '@/lib/syncplant-data';
import { TrendingDown, DollarSign, Clock, Wrench } from 'lucide-react';
import StatCard from '@/components/syncplant/StatCard';

export default function AnalyticsPage() {
  const chartStyle = {
    bg: 'hsl(222, 47%, 5%)',
    border: 'hsl(217, 33%, 15%)',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Cost & Analytics</h2>
        <p className="text-muted-foreground text-sm">Financial impact analysis and optimization insights</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Downtime Saved" value="$186K" trend="+34%" icon={DollarSign} variant="safe" />
        <StatCard label="Maintenance Cost" value="$93K" trend="-22%" icon={TrendingDown} variant="safe" />
        <StatCard label="Hours Saved" value="124h" trend="+18h" icon={Clock} variant="ai" />
        <StatCard label="Repairs Prevented" value="14" trend="+3" icon={Wrench} variant="safe" />
      </div>

      {/* Cost Comparison Chart */}
      <div className="card-industrial p-5">
        <h3 className="section-title mb-4">Reactive vs Predictive Maintenance Cost</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COST_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.border} vertical={false} />
              <XAxis dataKey="month" stroke="hsl(215, 16%, 47%)" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="hsl(215, 16%, 47%)" fontSize={10} fontFamily="monospace" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, fontSize: '11px', borderRadius: '6px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="reactive" name="Reactive Cost" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predictive" name="Predictive Cost" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Downtime Trend */}
      <div className="card-industrial p-5">
        <h3 className="section-title mb-4">Downtime Hours Trend</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={COST_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.border} vertical={false} />
              <XAxis dataKey="month" stroke="hsl(215, 16%, 47%)" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="hsl(215, 16%, 47%)" fontSize={10} fontFamily="monospace" />
              <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, fontSize: '11px', borderRadius: '6px' }} />
              <Line type="monotone" dataKey="downtime" name="Downtime (hours)" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Cost Insights */}
      <div className="card-industrial p-5">
        <h3 className="section-title mb-3">AI Cost Optimization Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Increase TR-01 monitoring frequency', savings: '$45,000/quarter', reason: 'Early detection prevents $15K+ emergency repairs. Current failure pattern shows 48h warning window.' },
            { title: 'Batch maintenance for HP-07 & WD-03', savings: '$8,200/event', reason: 'Co-scheduling reduces downtime by 40%. Shared tooling and crew deployment.' },
            { title: 'Switch CM-02 to condition-based maintenance', savings: '$12,000/year', reason: 'Current time-based schedule over-services by 30%. Sensor data shows longer viable intervals.' },
            { title: 'Implement vibration-based shutdown triggers', savings: '$92,000/year', reason: 'Automated shutdown at 0.7g threshold prevents cascading failures. ROI: 340%.' },
          ].map((insight, i) => (
            <div key={i} className="bg-secondary/30 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                <span className="text-safe font-mono text-xs font-bold">{insight.savings}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
