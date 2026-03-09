import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function StatsOverview({ aliens, filteredCount }) {
  const stats = useMemo(() => {
    const tierCounts = { GOD: 0, S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    aliens.forEach(a => { if (tierCounts[a.tier] !== undefined) tierCounts[a.tier]++; });
    const mostPowerful = aliens.reduce((a, b) => a.stats.overall > b.stats.overall ? a : b, aliens[0]);
    const fastest = aliens.reduce((a, b) => a.stats.speed > b.stats.speed ? a : b, aliens[0]);
    const strongest = aliens.reduce((a, b) => a.stats.strength > b.stats.strength ? a : b, aliens[0]);
    const mostVersatile = aliens.reduce((a, b) => (a.stats.utility || 0) > (b.stats.utility || 0) ? a : b, aliens[0]);
    return { tierCounts, mostPowerful, fastest, strongest, mostVersatile };
  }, [aliens]);

  const tc = { GOD: '#f59e0b', S: '#ef4444', A: '#3b82f6', B: '#10b981', C: '#8b5cf6', D: '#71717a', F: '#3f3f46' };

  return (
    <motion.div
      className="glass-panel rounded-2xl p-4 md:p-6 shadow-xl border-t border-white/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        
        {/* Primary DB Stats */}
        <div className="flex items-center gap-6">
          <StatBox label="ENTRIES" value={aliens.length} color="var(--accent)" />
          <div className="w-px h-8 bg-zinc-800"></div>
          <StatBox label="SHOWING" value={filteredCount} color="white" />
          <div className="w-px h-8 bg-zinc-800"></div>
          
          <div className="hidden md:flex items-center gap-3">
            {Object.entries(stats.tierCounts).filter(([_, count]) => count > 0).map(([tier, count]) => (
              <span key={tier} className="text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded bg-black/40 border border-zinc-800" style={{ color: tc[tier] }}>
                {tier}:{count}
              </span>
            ))}
          </div>
        </div>

        {/* Superlatives */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
          <MiniBadge icon="👑" label="MOST POWERFUL" value={stats.mostPowerful?.name} />
          <MiniBadge icon="⚡" label="FASTEST SPEED" value={stats.fastest?.name} />
          <MiniBadge icon="💪" label="PEAK STRENGTH" value={stats.strongest?.name} />
          <MiniBadge icon="🔧" label="HIGH UTILITY" value={stats.mostVersatile?.name} />
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-mono">{label}</span>
      <span className="font-bold text-2xl heading-display leading-none mt-1" style={{ color, textShadow: color !== 'white' ? `0 0 15px ${color}` : 'none' }}>{value}</span>
    </div>
  );
}

function MiniBadge({ icon, label, value }) {
  return (
    <div className="flex flex-col bg-zinc-900/50 rounded-lg p-2.5 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-default">
      <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase font-mono mb-1">{icon} {label}</span>
      <span className="text-xs font-bold text-zinc-300 truncate heading-display uppercase tracking-wider">{value}</span>
    </div>
  );
}
