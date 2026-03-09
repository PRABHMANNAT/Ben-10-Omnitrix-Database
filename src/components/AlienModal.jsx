import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';

const tierColors = { GOD: '#f59e0b', S: '#ef4444', A: '#3b82f6', B: '#10b981', C: '#8b5cf6', D: '#71717a', F: '#3f3f46' };
const rarityColors = { Common: '#a1a1aa', Uncommon: '#10b981', Rare: '#3b82f6', Epic: '#8b5cf6', Legendary: '#f59e0b' };

const abilityEmoji = (ability) => {
  const a = ability.toLowerCase();
  if (a.includes('fire') || a.includes('pyro') || a.includes('heat')) return '🔥';
  if (a.includes('electric') || a.includes('electro') || a.includes('lightning')) return '⚡';
  if (a.includes('ice') || a.includes('cryo') || a.includes('freeze') || a.includes('cold')) return '❄️';
  if (a.includes('flight') || a.includes('fly')) return '🦅';
  if (a.includes('strength') || a.includes('strong')) return '💪';
  if (a.includes('speed') || a.includes('fast')) return '⚡';
  if (a.includes('intelli') || a.includes('genius') || a.includes('mind')) return '🧠';
  if (a.includes('stealth') || a.includes('invisible') || a.includes('camouflage')) return '👻';
  if (a.includes('time') || a.includes('chrono')) return '⏰';
  if (a.includes('gravity') || a.includes('magnetic')) return '🧲';
  if (a.includes('sonic') || a.includes('sound') || a.includes('howl')) return '🔊';
  if (a.includes('water') || a.includes('aqua') || a.includes('hydro')) return '💧';
  if (a.includes('web') || a.includes('silk')) return '🕸️';
  if (a.includes('nuclear') || a.includes('radiation')) return '☢️';
  if (a.includes('reality') || a.includes('omnipotent')) return '✨';
  if (a.includes('portal') || a.includes('dimension')) return '🌀';
  if (a.includes('regen')) return '💚';
  if (a.includes('dupl') || a.includes('clone')) return '👥';
  return '🔹';
};

export default function AlienModal({ alien, onClose, onPrev, onNext, allAliens }) {
  const modalRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const tc = tierColors[alien.tier] || '#71717a';

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  const statColor = (val) => val >= 80 ? 'var(--accent)' : val >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        className="glass-panel rounded-2xl w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto custom-scroll relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-l"
        style={{ borderColor: `${tc}44` }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow behind modal */}
        <div className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${tc}, transparent 70%)` }}></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/40 border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <FiX size={20} />
        </button>

        <div className="grid lg:grid-cols-[400px_1fr] gap-8 p-6 md:p-10 relative z-10">
          
          {/* LEFT COLUMN: HERO IMAGE & BADGES */}
          <div className="space-y-6">
            
            {/* Image Stage */}
            <div className="rounded-2xl overflow-hidden flex items-center justify-center h-96 relative bg-gradient-to-b from-zinc-900 to-black border border-zinc-800/50 group">
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${tc}, transparent 70%)` }}></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
              
              {!imgError ? (
                <>
                  {!imgLoaded && <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full relative z-10"></div>}
                  <img 
                    src={alien.image} 
                    alt={alien.name} 
                    className={`max-h-80 object-contain relative z-10 drop-shadow-2xl transition-all duration-700 ease-in-out group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} 
                    style={{ filter: `drop-shadow(0 20px 30px ${tc}66)` }}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)} 
                  />
                </>
              ) : (
                <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold heading-display shadow-inner relative z-10" style={{ background: `${tc}22`, color: tc, border: `2px solid ${tc}44` }}>
                  {alien.name.charAt(0)}
                </div>
              )}
              
              <div className="absolute bottom-4 right-4 z-20">
                <button className="p-2 rounded-full bg-black/50 backdrop-blur border border-zinc-700 text-zinc-400 hover:text-white transition-colors">
                  <FiMaximize2 size={16} />
                </button>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="flex flex-wrap gap-2">
              <Badge label={`${alien.tier} TIER`} bg={`${tc}22`} color={tc} border={`${tc}44`} />
              <Badge label={`RANK #${alien.rank}`} bg="rgba(16,185,129,0.1)" color="var(--accent)" border="rgba(16,185,129,0.3)" />
              <Badge label={alien.classification} bg="rgba(59,130,246,0.1)" color="#3b82f6" border="rgba(59,130,246,0.3)" />
              <Badge label={alien.rarity} bg={`${rarityColors[alien.rarity]}15`} color={rarityColors[alien.rarity]} border={`${rarityColors[alien.rarity]}30`} />
              <Badge label={alien.difficultyToUse} bg="rgba(139,92,246,0.1)" color="#8b5cf6" border="rgba(139,92,246,0.3)" />
            </div>

            {/* Meta Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div>
                <SectionLabel>SERIES DEBUT</SectionLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {alien.series.map(s => <Badge key={s} label={s} bg="rgba(255,255,255,0.05)" color="#a1a1aa" border="rgba(255,255,255,0.1)" />)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono font-medium text-zinc-400 pt-2 border-t border-zinc-800">
                <div>First: <span className="text-zinc-200 block mt-1">{alien.firstAppearance}</span></div>
                <div>Unlocked: <span className="text-zinc-200 block mt-1">{alien.unlockedIn}</span></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DATA OVERVIEW */}
          <div className="space-y-8">
            
            {/* Header & Bio */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold heading-display shiny-text" style={{ color: tc, textShadow: `0 0 30px ${tc}44` }}>
                {alien.name}
              </h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <InfoBox label="Species" value={alien.species} />
                <InfoBox label="Homeworld" value={alien.homeworld} />
                <InfoBox label="Height" value={alien.height} />
                <InfoBox label="Weight" value={alien.weight} />
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="bg-black/30 border border-zinc-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>COMBAT STATISTICS</SectionLabel>
                <div className="text-right">
                  <span className="text-4xl font-bold heading-display" style={{ color: tc }}>{alien.stats.overall}</span>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 block -mt-1">OVERALL RATING</span>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {Object.entries(alien.stats).filter(([k]) => k !== 'overall').map(([stat, val]) => (
                  <div key={stat} className="flex items-center gap-3">
                    <span className="text-xs w-24 uppercase font-bold tracking-wider text-zinc-500">{stat}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-zinc-800 inner-shadow">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                        style={{ background: statColor(val), boxShadow: `0 0 10px ${statColor(val)}` }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right font-bold text-mono" style={{ color: statColor(val) }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Body Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left inner column */}
              <div className="space-y-6">
                <div>
                  <SectionLabel>ABILITIES</SectionLabel>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {alien.abilities.map(ab => (
                      <span key={ab} className="text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold tracking-wide">
                        {abilityEmoji(ab)} {ab}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel color="#ef4444">WEAKNESSES</SectionLabel>
                  <ul className="mt-3 space-y-2">
                    {alien.weaknesses.map(w => (
                      <li key={w} className="text-xs flex items-start gap-2 text-red-200/80 font-mono">
                         <span className="text-red-500 mt-0.5">⚠️</span> 
                         <span className="leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Right inner column */}
              <div className="space-y-6">
                 {/* Signature Move */}
                <div className="rounded-xl p-4 border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <SectionLabel>SIGNATURE MOVE</SectionLabel>
                  <p className="text-sm mt-2 font-mono text-emerald-300 leading-relaxed font-medium">{alien.sigMove}</p>
                </div>

                <div>
                  <SectionLabel>FULL PROFILE</SectionLabel>
                  <p className="text-sm mt-3 leading-relaxed text-zinc-300 font-body">{alien.fullDesc}</p>
                </div>
              </div>
            </div>

            {/* Lore & Records */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
              <div>
                <SectionLabel>BATTLE RECORDS</SectionLabel>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <h5 className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-2 font-display">VICTORIES</h5>
                    <ul className="space-y-1.5">
                      {alien.notableVictories.map(v => (
                        <li key={v} className="text-[11px] font-mono text-emerald-200/80 flex items-start gap-1">
                          <span className="text-emerald-500">✓</span> <span className="truncate" title={v}>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                     <h5 className="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-2 font-display">DEFEATS</h5>
                    <ul className="space-y-1.5">
                      {alien.notableDefeats.map(d => (
                         <li key={d} className="text-[11px] font-mono text-red-200/80 flex items-start gap-1">
                           <span className="text-red-500">✗</span> <span className="truncate" title={d}>{d}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>DATABASE LOGS / FUN FACTS</SectionLabel>
                <div className="space-y-2 mt-3">
                  {alien.funFacts.map((f, i) => (
                    <div key={i} className="text-xs p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-zinc-400 flex items-start gap-3 hover:bg-white/10 transition-colors">
                      <span className="text-emerald-500 font-bold">0{i + 1}</span> 
                      <span className="leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between p-4 px-6 md:px-10 border-t border-white/5 bg-black/20 backdrop-blur-md sticky bottom-0 z-50">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 text-xs px-5 py-2.5 rounded-full transition-all bg-zinc-900 border border-zinc-700 hover:border-emerald-500 font-mono font-bold text-zinc-300 hover:text-emerald-400 group"
          >
            <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" /> PREV ALIEN
          </button>
          <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase hidden sm:block">
            OMNITRIX DATABASE ENTRY
          </div>
          <button
            onClick={onNext}
            className="flex items-center gap-2 text-xs px-5 py-2.5 rounded-full transition-all bg-zinc-900 border border-zinc-700 hover:border-emerald-500 font-mono font-bold text-zinc-300 hover:text-emerald-400 group"
          >
            NEXT ALIEN <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper Components
function Badge({ label, bg, color, border }) {
  return (
    <span className="text-[10px] px-3 py-1 rounded-full font-bold tracking-widest uppercase font-mono shadow-sm" style={{ background: bg, color, border: `1px solid ${border}` }}>
      {label}
    </span>
  );
}

function SectionLabel({ children, color }) {
  return (
    <h4 className="text-[11px] font-bold tracking-[0.2em] heading-display" style={{ color: color || 'var(--text-muted)' }}>
      {children}
    </h4>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-black/20 p-3 rounded-lg border border-zinc-800/50">
      <span className="block text-zinc-500 mb-1">{label}</span>
      <span className="block text-zinc-200 font-bold truncate" title={value}>{value}</span>
    </div>
  );
}
