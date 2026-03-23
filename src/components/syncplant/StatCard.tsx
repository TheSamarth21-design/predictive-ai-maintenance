import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  variant: 'safe' | 'danger' | 'caution' | 'ai';
}

export default function StatCard({ label, value, trend, icon: Icon, variant }: Props) {
  const isPositive = trend.includes('+') && !['danger', 'caution'].some(v => variant === v && trend.includes('+'));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-industrial relative overflow-hidden group hover:border-foreground/10 transition-colors"
    >
      <div className={`absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity`}>
        <Icon size={48} />
      </div>
      <p className="data-label">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <h3 className="text-2xl font-bold font-mono text-foreground">{value}</h3>
        <span className={`text-xs mb-1 font-mono ${isPositive ? 'text-safe' : 'text-danger'}`}>
          {trend}
        </span>
      </div>
    </motion.div>
  );
}
