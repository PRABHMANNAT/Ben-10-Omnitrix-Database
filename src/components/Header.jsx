import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Header({ totalAliens, filteredCount, tierCounts, godTierCount }) {
  const [sfxEnabled, setSfxEnabled] = useState(false);

  // Original logo from Wikimedia
  const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e9/Ben_10_Omnitrix_Logo.png";

  const handleOmnitrixClick = () => {
    console.log("IT'S HERO TIME!");
    window.dispatchEvent(new CustomEvent('omnitrix-click'));
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 shadow-2xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">

          {/* Logo + Title */}
          <div className="flex items-center gap-5">
            <motion.div 
              className="relative w-14 h-14 rounded-full overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOmnitrixClick}
            >
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse"></div>
              <img 
                src={logoUrl} 
                alt="Omnitrix Logo" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://upload.wikimedia.org/wikipedia/en/e/e2/Ben_10_Logo.png";
                }}
              />
            </motion.div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold heading-display text-white tracking-widest shiny-text">
                OMNITRIX DATABASE
              </h1>
              <p className="text-xs tracking-[0.2em] text-mono text-zinc-400 mt-0.5">
                SECURE ACCESS LEVEL: PLUMBER · v2.0
              </p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-xs text-mono text-zinc-400">
              <StatBadge label="DATABASE" value={totalAliens} />
              <div className="w-px h-4 bg-zinc-700"></div>
              <StatBadge label="ACTIVE" value={filteredCount} highlight />
              <div className="w-px h-4 bg-zinc-700"></div>
              <StatBadge label="GOD TIER" value={godTierCount} color="var(--tier-god)" />
            </div>

            <button
              onClick={() => setSfxEnabled(!sfxEnabled)}
              className="text-xs px-4 py-2 rounded-full border transition-all text-mono font-bold"
              style={{
                borderColor: sfxEnabled ? 'var(--accent)' : 'rgba(63,63,70,0.5)',
                color: sfxEnabled ? '#000' : 'var(--text-muted)',
                background: sfxEnabled ? 'var(--accent)' : 'transparent',
              }}
            >
              SFX: {sfxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatBadge({ label, value, highlight, color }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <span className="font-bold text-sm" style={{ color: color || (highlight ? 'var(--accent)' : 'white') }}>
        {value}
      </span>
    </span>
  );
}
