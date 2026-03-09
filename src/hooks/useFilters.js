import { useState, useMemo, useCallback } from 'react';

const DEFAULT_STAT_RANGE = [0, 100];

export default function useFilters(aliens) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [statRanges, setStatRanges] = useState({
    power: [...DEFAULT_STAT_RANGE],
    speed: [...DEFAULT_STAT_RANGE],
    strength: [...DEFAULT_STAT_RANGE],
    intelligence: [...DEFAULT_STAT_RANGE],
    durability: [...DEFAULT_STAT_RANGE],
    agility: [...DEFAULT_STAT_RANGE],
    overall: [...DEFAULT_STAT_RANGE],
  });
  const [sortBy, setSortBy] = useState('rank');
  const [toggles, setToggles] = useState({
    onlyUltimates: false,
    onlyOriginal10: false,
    hasFlight: false,
    hasStealth: false,
  });
  const [viewMode, setViewMode] = useState('grid');

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTier('ALL');
    setSelectedSeries([]);
    setSelectedClassification('ALL');
    setSelectedRarity('ALL');
    setSelectedDifficulty('ALL');
    setStatRanges({
      power: [...DEFAULT_STAT_RANGE],
      speed: [...DEFAULT_STAT_RANGE],
      strength: [...DEFAULT_STAT_RANGE],
      intelligence: [...DEFAULT_STAT_RANGE],
      durability: [...DEFAULT_STAT_RANGE],
      agility: [...DEFAULT_STAT_RANGE],
      overall: [...DEFAULT_STAT_RANGE],
    });
    setSortBy('rank');
    setToggles({ onlyUltimates: false, onlyOriginal10: false, hasFlight: false, hasStealth: false });
  }, []);

  const updateStatRange = useCallback((stat, value) => {
    setStatRanges(prev => ({ ...prev, [stat]: value }));
  }, []);

  const toggleSeries = useCallback((series) => {
    setSelectedSeries(prev =>
      prev.includes(series) ? prev.filter(s => s !== series) : [...prev, series]
    );
  }, []);

  const updateToggle = useCallback((key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const ORIGINAL_10 = ['Heatblast', 'Wildmutt', 'Diamondhead', 'XLR8', 'Grey Matter', 'Four Arms', 'Stinkfly', 'Ripjaws', 'Upgrade', 'Ghostfreak'];

  const filteredAliens = useMemo(() => {
    let result = [...aliens];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q) ||
        a.homeworld.toLowerCase().includes(q) ||
        a.abilities.some(ab => ab.toLowerCase().includes(q)) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Tier
    if (selectedTier !== 'ALL') {
      result = result.filter(a => a.tier === selectedTier);
    }

    // Series
    if (selectedSeries.length > 0) {
      result = result.filter(a => a.series.some(s => selectedSeries.includes(s)));
    }

    // Classification
    if (selectedClassification !== 'ALL') {
      result = result.filter(a => a.classification === selectedClassification);
    }

    // Rarity
    if (selectedRarity !== 'ALL') {
      result = result.filter(a => a.rarity === selectedRarity);
    }

    // Difficulty
    if (selectedDifficulty !== 'ALL') {
      result = result.filter(a => a.difficultyToUse === selectedDifficulty);
    }

    // Stat ranges
    Object.entries(statRanges).forEach(([stat, [min, max]]) => {
      if (min > 0 || max < 100) {
        result = result.filter(a => a.stats[stat] >= min && a.stats[stat] <= max);
      }
    });

    // Toggles
    if (toggles.onlyUltimates) {
      result = result.filter(a => a.name.startsWith('Ultimate'));
    }
    if (toggles.onlyOriginal10) {
      result = result.filter(a => ORIGINAL_10.includes(a.name));
    }
    if (toggles.hasFlight) {
      result = result.filter(a => a.abilities.some(ab => ab.toLowerCase().includes('flight') || ab.toLowerCase().includes('fly')));
    }
    if (toggles.hasStealth) {
      result = result.filter(a => a.abilities.some(ab =>
        ab.toLowerCase().includes('stealth') || ab.toLowerCase().includes('invisibility') ||
        ab.toLowerCase().includes('intangibility') || ab.toLowerCase().includes('camouflage')
      ));
    }

    // Sort
    switch (sortBy) {
      case 'rank': result.sort((a, b) => a.rank - b.rank); break;
      case 'name-az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'power': result.sort((a, b) => b.stats.power - a.stats.power); break;
      case 'speed': result.sort((a, b) => b.stats.speed - a.stats.speed); break;
      case 'strength': result.sort((a, b) => b.stats.strength - a.stats.strength); break;
      case 'intelligence': result.sort((a, b) => b.stats.intelligence - a.stats.intelligence); break;
      case 'durability': result.sort((a, b) => b.stats.durability - a.stats.durability); break;
      case 'overall': result.sort((a, b) => b.stats.overall - a.stats.overall); break;
      case 'series':
        const seriesOrder = { 'Original Series': 0, 'Alien Force': 1, 'Ultimate Alien': 2, 'Omniverse': 3 };
        result.sort((a, b) => (seriesOrder[a.firstSeries] || 0) - (seriesOrder[b.firstSeries] || 0));
        break;
      default: break;
    }

    return result;
  }, [aliens, searchQuery, selectedTier, selectedSeries, selectedClassification, selectedRarity, selectedDifficulty, statRanges, sortBy, toggles]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedTier !== 'ALL') count++;
    if (selectedSeries.length > 0) count++;
    if (selectedClassification !== 'ALL') count++;
    if (selectedRarity !== 'ALL') count++;
    if (selectedDifficulty !== 'ALL') count++;
    Object.values(statRanges).forEach(([min, max]) => { if (min > 0 || max < 100) count++; });
    Object.values(toggles).forEach(v => { if (v) count++; });
    if (sortBy !== 'rank') count++;
    return count;
  }, [searchQuery, selectedTier, selectedSeries, selectedClassification, selectedRarity, selectedDifficulty, statRanges, toggles, sortBy]);

  return {
    filteredAliens, activeFiltersCount, clearAllFilters,
    searchQuery, setSearchQuery,
    selectedTier, setSelectedTier,
    selectedSeries, toggleSeries,
    selectedClassification, setSelectedClassification,
    selectedRarity, setSelectedRarity,
    selectedDifficulty, setSelectedDifficulty,
    statRanges, updateStatRange,
    sortBy, setSortBy,
    toggles, updateToggle,
    viewMode, setViewMode,
  };
}
