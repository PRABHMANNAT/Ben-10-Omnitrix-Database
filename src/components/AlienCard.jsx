import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const tierColors = { GOD: '#f59e0b', S: '#ef4444', A: '#3b82f6', B: '#10b981', C: '#8b5cf6', D: '#71717a', F: '#3f3f46' };
const rarityColors = { Common: '#a1a1aa', Uncommon: '#10b981', Rare: '#3b82f6', Epic: '#8b5cf6', Legendary: '#f59e0b' };
const seriesShort = { 'Original Series': 'OS', 'Alien Force': 'AF', 'Ultimate Alien': 'UA', 'Omniverse': 'OV' };

export default function AlienCard({ alien, index, onClick, isCompareMode, isSelected, onCompare }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const cardRef = useRef(null);
  
  const tc = tierColors[alien.tier] || '#71717a';
  
  // Spotlight effect logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      return () => card.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={`spotlight-card w-full max-w-[320px] cursor-pointer group flex flex-col`}
      style={{
        '--accent-glow': `${tc}33` // 20% opacity of tier color
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 1), duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      onClick={() => isCompareMode ? onCompare(alien) : onClick(alien)}
      layout
    >
      {/* Compare Checkbox Overlay */}
      {isCompareMode && (
        <div className={`absolute inset-0 z-20 transition-all duration-300 ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}>
          <div 
            className={`absolute top-4 left-4 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              isSelected ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-zinc-500 bg-black/50'
            }`}
          >
            {isSelected && <span className="text-black text-sm font-bold">✓</span>}
          </div>
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-md shadow-lg"
          style={{ background: `${tc}22`, color: tc, fontFamily: 'var(--font-display)', border: `1px solid ${tc}55` }}
        >
          #{alien.rank}
        </div>
      </div>

      <div 
        className="absolute top-3 right-3 z-10 text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-widest font-bold shadow-md transform group-hover:scale-105 transition-transform"
        style={{ background: `${rarityColors[alien.rarity]}33`, color: rarityColors[alien.rarity], border: `1px solid ${rarityColors[alien.rarity]}55` }}
      >
        {alien.rarity}
      </div>

      {/* Image Container */}
      <div className="relative h-56 flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-900/50 to-zinc-950/90 pt-4">
        {/* Glow behind image */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${tc}, transparent 70%)` }}></div>
        
        {!imgError ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            )}
            <motion.img
              src={alien.image}
              alt={alien.name}
              loading="lazy"
              className={`max-h-48 object-contain transition-all duration-700 ease-out group-hover:scale-[1.15] group-hover:-translate-y-2 relative z-10 drop-shadow-2xl ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ filter: `drop-shadow(0 10px 15px ${tc}44)` }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl relative z-10 font-bold heading-display shadow-inner" style={{ background: `${tc}22`, color: tc, border: `2px solid ${tc}44` }}>
            {alien.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-5 flex-1 flex flex-col relative z-20 bg-gradient-to-t from-zinc-950 via-zinc-900/95 to-transparent border-t border-white/5">
        
        {/* Name & Species */}
        <div className="mb-4">
          <h3 className="text-xl font-bold truncate heading-display group-hover:text-emerald-400 transition-colors" style={{ color: tc }}>
            {alien.name}
          </h3>
          <p className="text-xs truncate tracking-widest uppercase text-mono mt-0.5 text-zinc-400 font-medium">
            {alien.species}
          </p>
        </div>

        {/* Fancy Mini Stat Bars */}
        <div className="space-y-2.5 mb-5 flex-1">
          {[
            { label: 'PWR', value: alien.stats.power },
            { label: 'SPD', value: alien.stats.speed },
            { label: 'STR', value: alien.stats.strength },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[10px] w-8 font-bold text-mono tracking-wider text-zinc-500">{s.label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-zinc-800/80 inner-shadow">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{
                    width: `${s.value}%`,
                    background: s.value >= 80 ? 'var(--accent)' : s.value >= 50 ? '#f59e0b' : '#ef4444',
                    boxShadow: `0 0 10px ${s.value >= 80 ? 'var(--accent)' : s.value >= 50 ? '#f59e0b' : '#ef4444'}`
                  }}
                />
              </div>
              <span className="text-[10px] w-6 text-right font-bold text-mono" style={{ color: s.value >= 80 ? 'var(--accent)' : 'var(--text-muted)' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tags & Badges */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {alien.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] px-2 py-1 rounded border border-zinc-700/50 bg-black/40 text-zinc-300 font-mono tracking-wider">
                {tag}
              </span>
            ))}
            {alien.tags.length > 2 && (
              <span className="text-[9px] px-2 py-1 rounded border border-zinc-700/50 bg-black/40 text-zinc-500 font-mono">
                +{alien.tags.length - 2}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {alien.series.map(s => (
              <span key={s} className="text-[9px] px-1.5 py-1 rounded bg-zinc-800/80 text-zinc-400 font-mono border border-zinc-700/50">
                {seriesShort[s]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
