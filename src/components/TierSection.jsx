import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import AlienCard from './AlienCard';

const tierColors = { GOD: '#f59e0b', S: '#ef4444', A: '#3b82f6', B: '#10b981', C: '#8b5cf6', D: '#71717a', F: '#3f3f46' };
const tierNames = { GOD: 'GOD TIER', S: 'S TIER', A: 'A TIER', B: 'B TIER', C: 'C TIER', D: 'D TIER', F: 'F TIER' };
const TIER_ORDER = ['GOD', 'S', 'A', 'B', 'C', 'D', 'F'];

export default function TierSection({ aliens, onAlienClick, isCompareMode, selectedCompare, onCompare }) {
  const [collapsed, setCollapsed] = useState({});

  const groups = {};
  TIER_ORDER.forEach(t => { groups[t] = []; });
  aliens.forEach(a => {
    if (groups[a.tier]) groups[a.tier].push(a);
  });

  return (
    <div className="space-y-8">
      {TIER_ORDER.map(tier => {
        const group = groups[tier];
        if (group.length === 0) return null;
        const tc = tierColors[tier];
        const isCollapsed = collapsed[tier];

        return (
          <div key={tier} className="relative rounded-2xl overflow-hidden glass-panel border border-white/5 shadow-2xl transition-all">
            {tier === 'GOD' && <div className="absolute inset-0 gold-shimmer pointer-events-none opacity-20" />}
            
            <button
              onClick={() => setCollapsed(p => ({ ...p, [tier]: !p[tier] }))}
              className="w-full flex items-center justify-between px-6 py-4 relative z-10 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-lg md:text-xl font-bold px-4 py-1.5 rounded-lg heading-display shadow-[0_0_15px_rgba(0,0,0,0.5)] border"
                  style={{ background: `${tc}33`, color: tc, letterSpacing: '0.15em', borderColor: `${tc}55` }}
                >
                  {tierNames[tier]}
                </span>
                <span className="text-sm tracking-widest text-mono text-zinc-400 font-bold bg-black/40 px-3 py-1 rounded-full border border-zinc-800">
                  {group.length} ALIEN{group.length !== 1 ? 'S' : ''}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-black/50 border border-zinc-700 flex items-center justify-center text-zinc-400 transition-colors">
                {isCollapsed ? <FiChevronRight size={20} color={tc} /> : <FiChevronDown size={20} color={tc} />}
              </div>
            </button>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center bg-black/20 mt-2">
                    {group.map((alien, i) => (
                      <AlienCard
                        key={alien.id}
                        alien={alien}
                        index={i}
                        onClick={onAlienClick}
                        isCompareMode={isCompareMode}
                        isSelected={selectedCompare?.some(c => c.id === alien.id)}
                        onCompare={onCompare}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
