import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import aliens from './data/aliens';
import useFilters from './hooks/useFilters';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SidebarFilters from './components/FilterBar';
import AlienCard from './components/AlienCard';
import AlienModal from './components/AlienModal';
import TierSection from './components/TierSection';
import StatsOverview from './components/StatsOverview';
import Footer from './components/Footer';

export default function App() {
  const filters = useFilters(aliens);
  const [selectedAlien, setSelectedAlien] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareAliens, setCompareAliens] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => filters.setSearchQuery(debouncedQuery), 300);
    return () => clearTimeout(t);
  }, [debouncedQuery]);

  // URL hash sync
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const alien = aliens.find(a => a.name.toLowerCase().replace(/\s+/g, '-') === hash);
      if (alien) setSelectedAlien(alien);
    }
  }, []);

  useEffect(() => {
    if (selectedAlien) {
      window.location.hash = selectedAlien.name.toLowerCase().replace(/\s+/g, '-');
    } else {
      history.replaceState(null, '', window.location.pathname);
    }
  }, [selectedAlien]);

  // Omnitrix Easter Egg
  useEffect(() => {
    const handler = () => {
      const randomAlien = aliens[Math.floor(Math.random() * aliens.length)];
      setSelectedAlien(randomAlien);
    };
    window.addEventListener('omnitrix-click', handler);
    return () => window.removeEventListener('omnitrix-click', handler);
  }, []);

  // Tier counts
  const tierCounts = useMemo(() => {
    const counts = {};
    aliens.forEach(a => { counts[a.tier] = (counts[a.tier] || 0) + 1; });
    return counts;
  }, []);

  // Modal navigation
  const navigateAlien = useCallback((direction) => {
    if (!selectedAlien) return;
    const list = filters.filteredAliens;
    const idx = list.findIndex(a => a.id === selectedAlien.id);
    if (idx === -1) return;
    const newIdx = direction === 'prev'
      ? (idx - 1 + list.length) % list.length
      : (idx + 1) % list.length;
    setSelectedAlien(list[newIdx]);
  }, [selectedAlien, filters.filteredAliens]);

  // Compare
  const handleCompare = useCallback((alien) => {
    setCompareAliens(prev => {
      if (prev.some(a => a.id === alien.id)) return prev.filter(a => a.id !== alien.id);
      if (prev.length >= 3) return prev;
      return [...prev, alien];
    });
  }, []);

  return (
    <div className="relative min-h-screen text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Effects */}
      <div className="gradient-bg"></div>
      <div className="noise-overlay"></div>

      {/* Content Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          totalAliens={aliens.length}
          filteredCount={filters.filteredAliens.length}
          tierCounts={tierCounts}
          godTierCount={tierCounts.GOD || 0}
        />

        <div className="flex-1 max-w-[1600px] w-full mx-auto flex">
          
          {/* Sidebar Filters */}
          <SidebarFilters
            {...filters}
            isMobileOpen={isMobileFiltersOpen}
            setIsMobileOpen={setIsMobileFiltersOpen}
          />

          {/* Mobile Overlay */}
          {isMobileFiltersOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileFiltersOpen(false)}
            ></div>
          )}

          {/* Main Feed */}
          <main className="flex-1 w-full min-w-0 px-4 md:px-8 py-8 space-y-8 flex flex-col">
            
            {/* Top Bar (Search + Mobile Filter Toggle) */}
            <div className="flex gap-4 items-center">
              <button 
                className="lg:hidden p-3 rounded-lg glass-panel hover:bg-zinc-800 transition-colors"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <FiFilter size={20} className="text-emerald-400" />
              </button>
              <div className="flex-1">
                <SearchBar
                  value={debouncedQuery}
                  onChange={setDebouncedQuery}
                  resultCount={filters.filteredAliens.length}
                  total={aliens.length}
                />
              </div>
            </div>

            <StatsOverview aliens={aliens} filteredCount={filters.filteredAliens.length} />

            {/* Compare Dashboard */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCompareMode(!compareMode); setCompareAliens([]); }}
                className={`text-xs px-5 py-2.5 rounded-full border transition-all font-bold tracking-wider ${
                  compareMode 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                }`}
              >
                {compareMode ? `COMPARING ${compareAliens.length}/3 — EXIT` : 'ENTER COMPARE MODE'}
              </button>
            </div>

            {/* Content Grid */}
            <div className="flex-1">
              {filters.viewMode === 'tier' ? (
                <TierSection
                  aliens={filters.filteredAliens}
                  onAlienClick={setSelectedAlien}
                  isCompareMode={compareMode}
                  selectedCompare={compareAliens}
                  onCompare={handleCompare}
                />
              ) : filters.viewMode === 'list' ? (
                <div className="space-y-2">
                  {filters.filteredAliens.map((alien, i) => (
                    <ListRow key={alien.id} alien={alien} index={i} onClick={() => setSelectedAlien(alien)} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center">
                  {filters.filteredAliens.map((alien, i) => (
                    <AlienCard
                      key={alien.id}
                      alien={alien}
                      index={i}
                      onClick={setSelectedAlien}
                      isCompareMode={compareMode}
                      isSelected={compareAliens.some(c => c.id === alien.id)}
                      onCompare={handleCompare}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {filters.filteredAliens.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="w-24 h-24 mb-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                    <span className="text-4xl">🛸</span>
                  </div>
                  <h3 className="text-3xl font-bold heading-display text-white mb-2 tracking-widest">NO LIFEFORMS DETECTED</h3>
                  <p className="text-zinc-400 mb-8 max-w-md">The Omnitrix cannot find any aliens matching your current database filters.</p>
                  <button
                    onClick={filters.clearAllFilters}
                    className="btn-primary text-sm tracking-wider"
                  >
                    RESET ALL FILTERS
                  </button>
                </motion.div>
              )}
            </div>
            
            <Footer />
          </main>
        </div>

        {/* Compare Panel Overlay */}
        <AnimatePresence>
          {compareMode && compareAliens.length >= 2 && (
            <ComparePanel aliens={compareAliens} onClose={() => { setCompareMode(false); setCompareAliens([]); }} />
          )}
        </AnimatePresence>

        {/* Modal Selection */}
        <AnimatePresence>
          {selectedAlien && (
            <AlienModal
              alien={selectedAlien}
              onClose={() => setSelectedAlien(null)}
              onPrev={() => navigateAlien('prev')}
              onNext={() => navigateAlien('next')}
              allAliens={filters.filteredAliens}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// List Row View (Premium update)
function ListRow({ alien, index, onClick }) {
  const tc = { GOD: '#f59e0b', S: '#ef4444', A: '#3b82f6', B: '#10b981', C: '#8b5cf6', D: '#71717a', F: '#3f3f46' }[alien.tier] || '#71717a';
  return (
    <div
      onClick={onClick}
      className="glass-panel group flex items-center gap-4 px-5 py-3 rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: tc }}></div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-zinc-900/80 border border-zinc-700 group-hover:border-emerald-500/50 transition-colors" style={{ color: tc, fontFamily: 'var(--font-display)' }}>#{alien.rank}</div>
      <span className="text-lg font-bold w-48 truncate text-zinc-100 group-hover:text-emerald-400 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>{alien.name}</span>
      <span className="text-xs w-40 truncate hidden md:inline text-zinc-400 uppercase tracking-wider">{alien.species}</span>
      <span className="text-[10px] px-3 py-1 rounded-full font-bold tracking-widest" style={{ background: `${tc}15`, color: tc, border: `1px solid ${tc}30` }}>{alien.tier} TIER</span>
      <div className="flex-1 hidden lg:flex items-center justify-end gap-2">
        <span className="text-xs text-zinc-500 font-mono font-bold mr-4">OVR: <span className="text-emerald-400">{alien.stats.overall}</span></span>
        {alien.tags.slice(0, 3).map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-zinc-800/50">{t}</span>
        ))}
      </div>
    </div>
  );
}

// Compare Panel (Premium update)
function ComparePanel({ aliens, onClose }) {
  const stats = ['power', 'speed', 'strength', 'intelligence', 'durability', 'agility', 'utility', 'stealth', 'range', 'overall'];
  const tc = { GOD: '#f59e0b', S: '#ef4444', A: '#3b82f6', B: '#10b981', C: '#8b5cf6', D: '#71717a', F: '#3f3f46' };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-[100] glass-panel border-t border-emerald-500/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="max-w-[1200px] mx-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold heading-display text-emerald-400 shiny-text">
            COMBAT COMPARISON
          </h3>
          <button onClick={onClose} className="btn-secondary text-xs tracking-wider">EXIT COMPARE</button>
        </div>
        <div className="overflow-x-auto custom-scroll pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pr-6 py-2 text-zinc-500 text-xs font-bold tracking-widest uppercase">Statistic Base</th>
                {aliens.map(a => (
                  <th key={a.id} className="text-center px-6 py-2 min-w-[150px]">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-zinc-900 border" style={{ borderColor: tc[a.tier] }}>
                      <img src={a.image} alt={a.name} className="w-full h-full object-cover scale-150 object-top" />
                    </div>
                    <div className="font-bold heading-display text-lg" style={{ color: tc[a.tier] }}>{a.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, i) => {
                const maxVal = Math.max(...aliens.map(a => a.stats[stat]));
                return (
                  <tr key={stat} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                    <td className="capitalize pr-6 py-3 font-medium text-zinc-400 border-l-2 border-transparent hover:border-emerald-500 transition-colors pl-4">{stat}</td>
                    {aliens.map(a => {
                      const isMax = a.stats[stat] === maxVal;
                      return (
                        <td key={a.id} className="text-center px-6 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full font-bold ${isMax ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-zinc-300'}`}>
                            {a.stats[stat]}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
