import { useState } from 'react';
import { FiX, FiLayers, FiGrid, FiList } from 'react-icons/fi';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const TIERS = ['ALL', 'GOD', 'S', 'A', 'B', 'C', 'D', 'F'];
const SERIES = ['OS', 'AF', 'UA', 'OV'];
const CLASSIFICATIONS = ['ALL', 'Tank', 'Speed', 'Stealth', 'Support', 'Powerhouse', 'Cosmic Entity', 'Tech', 'Psychic', 'Elemental'];
const RARITIES = ['ALL', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const DIFFICULTIES = ['ALL', 'Easy', 'Medium', 'Hard', 'Extreme'];
const SORT_OPTIONS = [
  { value: 'rank', label: 'Rank' },
  { value: 'name-az', label: 'Name A-Z' },
  { value: 'overall', label: 'Highest Overall' },
  { value: 'power', label: 'Max Power' },
  { value: 'speed', label: 'Max Speed' },
];
const STAT_SLIDERS = ['power', 'speed', 'strength', 'intelligence', 'durability', 'agility', 'overall'];

export default function SidebarFilters({
  selectedTier, setSelectedTier,
  selectedSeries, toggleSeries,
  selectedClassification, setSelectedClassification,
  selectedRarity, setSelectedRarity,
  selectedDifficulty, setSelectedDifficulty,
  statRanges, updateStatRange,
  sortBy, setSortBy,
  toggles, updateToggle,
  activeFiltersCount, clearAllFilters,
  viewMode, setViewMode,
  isMobileOpen, setIsMobileOpen
}) {
  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-50 w-[300px] shrink-0
      glass-panel h-full lg:h-[calc(100vh-100px)] overflow-y-auto custom-scroll
      transition-transform duration-300 ease-in-out lg:translate-x-0
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 space-y-8">
        
        {/* Header & Mobile Close */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold heading-display text-white">FILTERS</h2>
            <p className="text-xs text-zinc-400 text-mono mt-1">{activeFiltersCount} ACTIVE</p>
          </div>
          <button 
            className="lg:hidden p-2 rounded-full hover:bg-zinc-800 transition-colors"
            onClick={() => setIsMobileOpen(false)}
          >
            <FiX size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Clear Filters Button (Premium UX Request) */}
        {activeFiltersCount > 0 && (
          <button 
            onClick={() => { clearAllFilters(); setIsMobileOpen(false); }}
            className="w-full btn-danger py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            <FiX /> CLEAR ALL FILTERS
          </button>
        )}

        {/* View Mode */}
        <div className="space-y-3">
          <Label>VIEW MODE</Label>
          <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {[
              { mode: 'grid', icon: FiGrid },
              { mode: 'list', icon: FiList },
              { mode: 'tier', icon: FiLayers },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-2 flex justify-center items-center rounded-md transition-all ${
                  viewMode === mode 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={mode}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <Select label="Sort Strategy" value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
          <Select label="Threat Tier" value={selectedTier} options={TIERS.map(t => ({value: t, label: t}))} onChange={setSelectedTier} />
          <Select label="Classification" value={selectedClassification} options={CLASSIFICATIONS.map(c => ({value: c, label: c}))} onChange={setSelectedClassification} />
          <Select label="Rarity" value={selectedRarity} options={RARITIES.map(r => ({value: r, label: r}))} onChange={setSelectedRarity} />
          <Select label="Difficulty" value={selectedDifficulty} options={DIFFICULTIES.map(d => ({value: d, label: d}))} onChange={setSelectedDifficulty} />
        </div>

        {/* Series Selection */}
        <div className="space-y-3">
          <Label>OMNITRIX SERIES</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Original Series', label: 'Classic (OS)' },
              { id: 'Alien Force', label: 'Alien Force' },
              { id: 'Ultimate Alien', label: 'Ultimate' },
              { id: 'Omniverse', label: 'Omniverse' }
            ].map(s => {
              const active = selectedSeries.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSeries(s.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-mono ${
                    active 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stat Ranges */}
        <div className="space-y-5">
          <Label>COMBAT STATISTICS</Label>
          {STAT_SLIDERS.map(stat => (
            <div key={stat} className="space-y-2">
              <div className="flex justify-between items-center text-xs text-mono text-zinc-400">
                <span className="capitalize">{stat}</span>
                <span>{statRanges[stat][0]} - {statRanges[stat][1]}</span>
              </div>
              <Slider
                range
                min={0}
                max={100}
                value={statRanges[stat]}
                onChange={(val) => updateStatRange(stat, val)}
              />
            </div>
          ))}
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2 border-t border-zinc-800">
          <Label>DATABASE FILTERS</Label>
          {[
            { key: 'onlyUltimates', label: 'Evolved Ultimates Only' },
            { key: 'onlyOriginal10', label: 'Original 10 Roster' },
            { key: 'hasFlight', label: 'Flight Capable' },
            { key: 'hasStealth', label: 'Stealth & Intangibility' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
              <div 
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${toggles[key] ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                onClick={() => updateToggle(key)}
              >
                <div 
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md ${toggles[key] ? 'translate-x-5.5 left-0.5' : 'translate-x-0.5 left-0'}`} 
                />
              </div>
            </label>
          ))}
        </div>

        {/* Footer padding */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <h3 className="text-xs font-bold tracking-[0.15em] text-zinc-500 heading-display">{children}</h3>;
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-bold">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm outline-none cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
