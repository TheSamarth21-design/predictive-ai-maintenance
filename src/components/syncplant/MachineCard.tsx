import { motion } from 'framer-motion';
import type { Machine } from '@/lib/syncplant-data';

interface Props {
  machine: Machine;
  onClick: (m: Machine) => void;
}

export default function MachineCard({ machine, onClick }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onClick(machine)}
      className="card-industrial cursor-pointer group hover:border-foreground/15 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-foreground font-bold font-mono">{machine.id}</h4>
          <p className="text-muted-foreground text-xs">{machine.name}</p>
        </div>
        <span className={`status-badge ${
          machine.status === 'Critical' ? 'status-critical' :
          machine.status === 'Warning' ? 'status-warning' : 'status-running'
        }`}>
          {machine.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">FAILURE RISK</span>
          <span className={machine.risk > 70 ? 'text-danger' : machine.risk > 40 ? 'text-caution' : 'text-foreground'}>
            {machine.risk}%
          </span>
        </div>
        <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${machine.risk}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${
              machine.risk > 70 ? 'bg-danger' : machine.risk > 40 ? 'bg-caution' : 'bg-safe'
            }`}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">LOAD</p>
            <p className="text-xs font-mono text-foreground">{machine.load}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">TEMP</p>
            <p className="text-xs font-mono text-foreground">{machine.temp}°C</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">HEALTH</p>
            <p className="text-xs font-mono text-foreground">{machine.health}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
