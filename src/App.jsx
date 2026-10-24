import React from 'react';
import { usePlantStorage, getOrCreateAnonymousId } from './hooks/useLocalStorage.js';
import { STARTER_PRESETS } from './constants/presets.js';
import { getPlantStatus } from './utils/careStatus.js';
import { PlantCard } from './components/PlantCard.jsx';
import { AddPlantModal } from './components/AddPlantModal.jsx';
import { EditPlantModal } from './components/EditPlantModal.jsx';
import { QuickHelpModal } from './components/QuickHelpModal.jsx';
import { FeedbackModal } from './components/FeedbackModal.jsx';
import {
  Sprout,
  Plus,
  RotateCcw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Sparkles,
  Droplet,
  Trash2,
  Pencil,
  X,
  LayoutGrid,
  Grid2X2,
  List,
  ArrowUpDown,
  HelpCircle,
  MessageSquare
} from './components/Icons.jsx';

const { useState, useMemo } = window.React || React;

export function App() {
  const { plants, waterPlant, addPlant, updatePlant, deletePlant, resetToPresets } = usePlantStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const anonymousId = useMemo(() => getOrCreateAnonymousId(), []);
  const [editingPlant, setEditingPlant] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'danger' | 'warning' | 'healthy'
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [toast, setToast] = useState(null);

  // View density mode: 'comfortable' | 'compact' | 'list'
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('plantApp_viewMode');
      if (saved === 'comfortable' || saved === 'compact' || saved === 'list') {
        return saved;
      }
    } catch (e) {}
    return 'comfortable';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('plantApp_viewMode', mode);
    } catch (e) {}
  };

  // Sort criteria: 'urgency' | 'name-asc' | 'name-desc' | 'recent' | 'interval-asc'
  const [sortBy, setSortBy] = useState(() => {
    try {
      const saved = localStorage.getItem('plantApp_sortBy');
      if (
        saved === 'urgency' ||
        saved === 'name-asc' ||
        saved === 'name-desc' ||
        saved === 'recent' ||
        saved === 'interval-asc'
      ) {
        return saved;
      }
    } catch (e) {}
    return 'urgency';
  });

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    try {
      localStorage.setItem('plantApp_sortBy', newSort);
    } catch (e) {}
  };

  // Quick Action Handler with Visual Toast Notification (Supports Today & Custom Past Dates)
  const handleWater = (id, plantName, customDate = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = !customDate || customDate === todayStr;
    waterPlant(id, customDate);
    setToast({
      id: Date.now(),
      type: 'water',
      title: isToday ? 'Watered Today!' : 'Watering Logged',
      message: isToday
        ? `${plantName || 'Plant'} marked as watered. Status is now Healthy.`
        : `${plantName || 'Plant'} marked as watered on ${customDate}.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Add Plant Handler with Toast Confirmation
  const handleAddPlant = (plantData) => {
    addPlant(plantData);
    setToast({
      id: Date.now(),
      type: 'add',
      title: 'Plant Added!',
      message: `Added ${plantData.nickname || plantData.name} to your care schedule.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Edit Plant Handler with Toast Confirmation
  const handleSaveEdit = (updatedPlant) => {
    updatePlant(updatedPlant);
    setToast({
      id: Date.now(),
      type: 'edit',
      title: 'Plant Updated',
      message: `Saved updates for ${updatedPlant.nickname || updatedPlant.name}.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Delete Plant Handler with Toast Confirmation
  const handleDeletePlant = (id, plantName) => {
    deletePlant(id);
    setToast({
      id: Date.now(),
      type: 'delete',
      title: 'Plant Removed',
      message: `Removed ${plantName || 'Plant'} from your garden schedule.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Compute status summary metrics
  const stats = useMemo(() => {
    let danger = 0;
    let warning = 0;
    let healthy = 0;

    plants.forEach((plant) => {
      const status = getPlantStatus(plant.lastWateredDate, plant.waterIntervalDays);
      if (status.category === 'danger') danger++;
      else if (status.category === 'warning') warning++;
      else healthy++;
    });

    return { total: plants.length, danger, warning, healthy };
  }, [plants]);

  // Unique list of rooms/locations
  const uniqueRooms = useMemo(() => {
    const rooms = new Set();
    plants.forEach((p) => {
      if (p.location) rooms.add(p.location);
    });
    return Array.from(rooms);
  }, [plants]);

  // Filtered & Sorted Plants
  const filteredPlants = useMemo(() => {
    // 1. Filter by status category and room location
    const result = plants.filter((plant) => {
      const status = getPlantStatus(plant.lastWateredDate, plant.waterIntervalDays);
      if (activeFilter !== 'all' && status.category !== activeFilter) return false;
      if (selectedRoom !== 'all' && plant.location !== selectedRoom) return false;
      return true;
    });

    // 2. Sort by active criteria
    return result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'recent') {
        const getTs = (p) => {
          if (p.createdAt && typeof p.createdAt === 'number') return p.createdAt;
          if (typeof p.id === 'string' && p.id.startsWith('plant-')) {
            const ts = parseInt(p.id.split('-')[1], 10);
            if (!isNaN(ts)) return ts;
          }
          return 0;
        };
        const diff = getTs(b) - getTs(a);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'interval-asc') {
        const intA = Number(a.waterIntervalDays) || 0;
        const intB = Number(b.waterIntervalDays) || 0;
        if (intA !== intB) return intA - intB;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      // Default: 'urgency' (Needs Water First)
      // Sorted by calculated next water date (Overdue -> Due Today -> Due Soon -> Recently Watered)
      // Tie-breaker: Alphabetical by plant name
      const statA = getPlantStatus(a.lastWateredDate, a.waterIntervalDays);
      const statB = getPlantStatus(b.lastWateredDate, b.waterIntervalDays);
      if (statA.daysRemaining !== statB.daysRemaining) {
        return statA.daysRemaining - statB.daysRemaining;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [plants, activeFilter, selectedRoom, sortBy]);

  const handleResetPresets = () => {
    if (window.confirm(`Reset all plants back to the ${STARTER_PRESETS.length} beginner starter presets?`)) {
      resetToPresets();
      setToast({
        id: Date.now(),
        type: 'reset',
        title: 'Presets Restored',
        message: `Loaded the ${STARTER_PRESETS.length} beginner domestic starter plants.`
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-emerald-50/50 via-zinc-50 to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans relative">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 w-full min-w-0">
          {/* Brand & Identity: Title + Two-Line Tagline with min-w-0 flex-1 */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl sm:rounded-2xl shadow-md shadow-emerald-500/20 shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent whitespace-nowrap leading-tight">
                KeepGreen
              </h1>
              <p className="text-[10px] sm:text-xs leading-tight text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="block truncate">Smart Watering &amp;</span>
                <span className="block truncate">Plant Care Assistant</span>
              </p>
            </div>
          </div>

          {/* Action Button Group: Strictly shrink-0 so buttons are never clipped */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Guide / Help Icon Button */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              title="Help Guide"
              aria-label="Help Guide"
              className="p-2 sm:px-3 sm:py-2 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 transition shadow-sm shrink-0 min-w-[36px] min-h-[36px] justify-center"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline font-semibold">Guide</span>
            </button>

            {/* Feedback & Suggestions Icon Button */}
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              title="Send Feedback"
              aria-label="Send Feedback"
              className="p-2 sm:px-3 sm:py-2 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 transition shadow-sm shrink-0 min-w-[36px] min-h-[36px] justify-center"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline font-semibold">Feedback</span>
            </button>

            {/* Prominent "+ Add Plant" Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all shrink-0 min-h-[36px] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>Add Plant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 flex-1 w-full max-w-full overflow-x-hidden min-w-0 space-y-4 sm:space-y-6">
        {/* Status Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-full">
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">Total Plants</p>
              <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">{stats.total}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveFilter(activeFilter === 'danger' ? 'all' : 'danger')}
            className={`p-3 sm:p-4 rounded-2xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all min-w-0 ${
              activeFilter === 'danger'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-400'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-rose-200'
            }`}
          >
            <div className="p-2 sm:p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl relative shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              {stats.danger > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider truncate">Needs Water</p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 leading-tight">{stats.danger}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'warning' ? 'all' : 'warning')}
            className={`p-3 sm:p-4 rounded-2xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all min-w-0 ${
              activeFilter === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-amber-200'
            }`}
          >
            <div className="p-2 sm:p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">Due Soon</p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 leading-tight">{stats.warning}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'healthy' ? 'all' : 'healthy')}
            className={`p-3 sm:p-4 rounded-2xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all min-w-0 ${
              activeFilter === 'healthy'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-400'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-200'
            }`}
          >
            <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">Healthy</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">{stats.healthy}</p>
            </div>
          </button>
        </div>

        {/* Filter Bar, Room Filter & View Mode Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 w-full max-w-full min-w-0">
          {/* Quick status tabs (Locked with overflow scroll, zero push) */}
          <div className="w-full sm:w-auto overflow-x-auto max-w-full min-w-0 pb-1 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-max">
              {[
                { id: 'all', label: 'All Plants' },
                { id: 'danger', label: 'Needs Water' },
                { id: 'warning', label: 'Due Soon' },
                { id: 'healthy', label: 'Healthy' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                    activeFilter === tab.id
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap max-w-full min-w-0">
            {/* Room filter dropdown */}
            {uniqueRooms.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                <span className="font-medium">Room:</span>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[130px] sm:max-w-none truncate cursor-pointer"
                >
                  <option value="all">All Rooms ({plants.length})</option>
                  {uniqueRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Control Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
              <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400">Sort:</span>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 pointer-events-none text-zinc-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  aria-label="Sort plants"
                  className="pl-8 pr-7 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
                >
                  <option value="urgency">Needs Water First</option>
                  <option value="name-asc">Alphabetical (A to Z)</option>
                  <option value="name-desc">Alphabetical (Z to A)</option>
                  <option value="recent">Recently Added</option>
                  <option value="interval-asc">Watering Frequency</option>
                </select>
                <div className="absolute right-2.5 pointer-events-none text-zinc-400 text-[9px]">
                  ▼
                </div>
              </div>
            </div>

            {/* View Mode Segmented Controls */}
            <div
              className="flex items-center p-1 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl shadow-inner shrink-0"
              role="group"
              aria-label="View Density"
            >
              <button
                type="button"
                onClick={() => handleViewModeChange('comfortable')}
                title="Full View (Large Cards)"
                aria-label="Full View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'comfortable'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Full</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('compact')}
                title="Compact View (Dense Cards)"
                aria-label="Compact View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Grid2X2 className="w-4 h-4" />
                <span className="hidden md:inline">Compact</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                title="List / Rows View"
                aria-label="List View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plant Cards Grid / List */}
        {filteredPlants.length > 0 ? (
          <div
            className={
              viewMode === 'list'
                ? 'flex flex-col gap-2.5'
                : viewMode === 'compact'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }
          >
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                viewMode={viewMode}
                onWater={handleWater}
                onEdit={(p) => setEditingPlant(p)}
                onDelete={handleDeletePlant}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No plants match this view</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {activeFilter !== 'all'
                  ? `No plants are currently in the "${activeFilter}" status.`
                  : 'Start by adding your first plant or load the preset library.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {activeFilter !== 'all' ? (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
                >
                  View All Plants
                </button>
              ) : (
                <>
                  <button
                    onClick={resetToPresets}
                    className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-xl transition"
                  >
                    Restore {STARTER_PRESETS.length} Starter Presets
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                  >
                    Add Plant
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Beginner Quick Guide Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Novice Care Rule of Thumb:</span>
            <span>When in doubt, stick your finger 1 inch into the soil. If dry, water thoroughly.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 1-2 Days Away
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Water Needed
            </span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
              v0.01 (alpha)
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-xl border border-zinc-700/50 dark:border-zinc-200">
            <div className={`p-1.5 rounded-lg ${
              toast.type === 'delete'
                ? 'bg-rose-500/20 text-rose-400 dark:text-rose-600'
                : toast.type === 'edit'
                ? 'bg-amber-500/20 text-amber-400 dark:text-amber-600'
                : toast.type === 'add'
                ? 'bg-teal-500/20 text-teal-400 dark:text-teal-600'
                : 'bg-emerald-500/20 text-emerald-400 dark:text-emerald-600'
            }`}>
              {toast.type === 'delete' ? (
                <Trash2 className="w-4 h-4" />
              ) : toast.type === 'edit' ? (
                <Pencil className="w-4 h-4" />
              ) : toast.type === 'add' ? (
                <Sprout className="w-4 h-4" />
              ) : (
                <Droplet className="w-4 h-4 fill-current" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{toast.title}</p>
              <p className="text-xs text-zinc-300 dark:text-zinc-600">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-zinc-400 hover:text-white dark:hover:text-zinc-900 rounded-lg ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPlant}
        existingPlants={plants}
      />

      {/* Edit Plant Modal */}
      <EditPlantModal
        isOpen={Boolean(editingPlant)}
        plant={editingPlant}
        onClose={() => setEditingPlant(null)}
        onSave={handleSaveEdit}
      />

      {/* Quick Help Guide Modal */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Feedback & Suggestions Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        anonymousId={anonymousId}
        plantCount={plants.length}
      />
    </div>
  );
}
