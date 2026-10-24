import React from 'react';
import { PLANT_DATABASE, CATEGORY_FALLBACKS, getCategoryFallback } from '../data/plantDatabase.js';
import { compressImageFile } from '../utils/imageCompressor.js';
import {
  X,
  Sprout,
  Sun,
  Droplet,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  BookOpen,
  Check,
  Lightbulb,
  Leaf,
  Camera,
  Upload,
  RotateCcw,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CategoryIcon,
  CategoryAvatar
} from './Icons.jsx';

const { useState, useEffect, useMemo, useRef } = window.React || React;

// Category filter pills for Step 1
const CATEGORY_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'foliage', label: '🌿 Foliage' },
  { id: 'succulent', label: '🌵 Succulents' },
  { id: 'flowering', label: '🌸 Flowering' },
  { id: 'herb', label: '🍃 Herbs' },
  { id: 'palm', label: '🌴 Palms' }
];

// Top popular starter varieties for empty/focused search state
const POPULAR_PRESET_SLUGS = [
  'preset-monstera-deliciosa',
  'preset-golden-pothos',
  'preset-snake-plant',
  'preset-zz-plant',
  'preset-peace-lily',
  'preset-fiddle-leaf-fig',
  'preset-jade-plant',
  'preset-sweet-basil'
];

export function AddPlantModal({ isOpen, onClose, onAdd, existingPlants = [] }) {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const comboboxRef = useRef(null);

  // 3-Step Wizard: 1 = Identity, 2 = Care & Schedule, 3 = Photo & Save
  const [currentStep, setCurrentStep] = useState(1);
  const [nameError, setNameError] = useState(false);

  // Smart Combobox State
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isComboboxFocused, setIsComboboxFocused] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [rowImgErrors, setRowImgErrors] = useState({});

  // Form Fields
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [roomPreset, setRoomPreset] = useState('Living Room');
  const [customRoom, setCustomRoom] = useState('');
  const [waterIntervalDays, setWaterIntervalDays] = useState(7);
  const [sunlightLevel, setSunlightLevel] = useState('medium');
  const [lastWateredDate, setLastWateredDate] = useState(getTodayStr());
  const [careTips, setCareTips] = useState('');
  const [category, setCategory] = useState('foliage');

  // Image & Custom Upload State (Three-Tier Visual System)
  const [visualMode, setVisualMode] = useState('category'); // 'preset' | 'category' | 'custom'
  const [imageUrl, setImageUrl] = useState('');
  const [defaultImageUrl, setDefaultImageUrl] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setNameError(false);
      setIsComboboxOpen(false);
      setIsComboboxFocused(false);
      setSelectedCategoryFilter('all');
      setRowImgErrors({});
    }
  }, [isOpen]);

  // Handle click outside combobox to close suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setIsComboboxOpen(false);
        setIsComboboxFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isComboboxOpen) {
          setIsComboboxOpen(false);
          setIsComboboxFocused(false);
        } else {
          handleExplicitClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isComboboxOpen, currentStep, name, nickname]);

  // Popular starter plants (8 varieties) for empty search state
  const popularPresets = useMemo(() => {
    return POPULAR_PRESET_SLUGS
      .map((slug) => PLANT_DATABASE.find((p) => p.id === slug))
      .filter(Boolean);
  }, []);

  // Bulletproof Combobox search/autocomplete logic
  // Queries ONLY: plant.name, plant.scientificName, and aliases
  // Strictly EXCLUDES: notes, lightLevel, category, id, imageUrl
  const matchingPresets = useMemo(() => {
    const query = name.trim().toLowerCase();

    // 1. Filter by category pill if not 'all'
    let baseList = PLANT_DATABASE;
    if (selectedCategoryFilter !== 'all') {
      baseList = baseList.filter((p) => p.category === selectedCategoryFilter);
    }

    // 2. When empty query, return top 8 items (or popular starters if 'all')
    if (!query) {
      if (selectedCategoryFilter === 'all') {
        return popularPresets.slice(0, 8);
      }
      return baseList.slice(0, 8);
    }

    const matches = baseList.filter((plant) => {
      const commonName = (plant.name || plant.commonName || '').toLowerCase();
      const scientificName = (plant.scientificName || plant.botanicalName || '').toLowerCase();
      const aliases = plant.alternateNames || plant.alternativeNames || plant.aka;

      if (commonName.includes(query)) return true;
      if (scientificName.includes(query)) return true;

      if (Array.isArray(aliases)) {
        return aliases.some((a) => String(a).toLowerCase().includes(query));
      } else if (typeof aliases === 'string' && aliases) {
        return aliases.toLowerCase().includes(query);
      }

      return false;
    });

    // Rank results for intuitive display:
    // 1. Exact start of common name (e.g., "Mon..." -> "Monstera")
    // 2. Word start in common name (e.g., "pothos" -> "Golden Pothos")
    // 3. Exact start of scientific name (e.g., "epi..." -> "Epipremnum aureum")
    // 4. Alphabetical tie-breaker
    return matches.sort((a, b) => {
      const aName = (a.name || a.commonName || '').toLowerCase();
      const bName = (b.name || b.commonName || '').toLowerCase();

      const aStarts = aName.startsWith(query);
      const bStarts = bName.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aWord = aName.split(/\s+/).some((w) => w.startsWith(query));
      const bWord = bName.split(/\s+/).some((w) => w.startsWith(query));
      if (aWord && !bWord) return -1;
      if (!aWord && bWord) return 1;

      const aSci = (a.scientificName || a.botanicalName || '').toLowerCase().startsWith(query);
      const bSci = (b.scientificName || b.botanicalName || '').toLowerCase().startsWith(query);
      if (aSci && !bSci) return -1;
      if (!aSci && bSci) return 1;

      return aName.localeCompare(bName);
    }).slice(0, 8);
  }, [name, selectedCategoryFilter, popularPresets]);

  // Exact match detection across full catalogue
  const hasExactMatch = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return false;
    return PLANT_DATABASE.some(
      (p) => (p.name || p.commonName || '').trim().toLowerCase() === q
    );
  }, [name]);

  // Smart duplicate detection
  const duplicateInstances = useMemo(() => {
    if (!name.trim()) return [];
    return existingPlants.filter(
      (p) => p.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  }, [name, existingPlants]);

  if (!isOpen) return null;

  const roomOptions = [
    'Living Room',
    'Bedroom',
    'Balcony',
    'Kitchen',
    'Kitchen Window',
    'Sunny Balcony',
    'Outdoor / Patio',
    'Bathroom',
    'Office',
    'Other'
  ];

  const sunlightOptions = [
    {
      value: 'low',
      label: 'Low / Shade',
      desc: 'Ambient light, away from direct windows'
    },
    {
      value: 'medium',
      label: 'Medium / Indirect',
      desc: 'Bright filtered sunlight or gentle morning sun'
    },
    {
      value: 'high',
      label: 'Direct Sun',
      desc: 'Thrives in direct sunshine on a bright sill'
    }
  ];

  const quickIntervals = [3, 5, 7, 10, 14, 21];

  const mapLightToLevel = (lightStr) => {
    if (!lightStr) return 'medium';
    if (lightStr.includes('Low')) return 'low';
    if (lightStr.includes('Full') || lightStr.includes('Direct') || lightStr.includes('Bright')) return 'high';
    return 'medium';
  };

  // Selecting a plant preset from the catalog
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    const chosenName = preset.name || preset.commonName;
    setName(chosenName);
    setNameError(false);
    setSubtitle(preset.botanicalName || preset.alternateNames || '');
    setWaterIntervalDays(preset.waterFrequencyDays || preset.waterDays || preset.wateringDays || 7);
    setSunlightLevel(mapLightToLevel(preset.light || preset.lightLevel));
    setCareTips(preset.notes || preset.noviceTip || '');
    setCategory(preset.category || 'foliage');

    // Populate catalog stock image if verified or leave empty for CategoryAvatar
    const stockImg = preset.imageUrl || preset.image || '';
    setDefaultImageUrl(stockImg);
    if (stockImg) {
      setImageUrl(stockImg);
      setVisualMode('preset');
    } else {
      setImageUrl('');
      setVisualMode('category');
    }
    setIsCustomPhoto(false);
    setImgPreviewError(false);
    setIsComboboxOpen(false);
    setIsComboboxFocused(false);

    // Smart duplicate recommendation on selection
    const duplicates = existingPlants.filter(
      (p) => (p.name || '').toLowerCase().trim() === chosenName.toLowerCase().trim()
    );
    if (duplicates.length > 0) {
      setNickname(`${chosenName} #${duplicates.length + 1}`);
    } else {
      setNickname('');
    }

    if (preset.defaultLocation) {
      if (roomOptions.includes(preset.defaultLocation)) {
        setRoomPreset(preset.defaultLocation);
        setCustomRoom('');
      } else {
        setRoomPreset('Other');
        setCustomRoom(preset.defaultLocation);
      }
    }
  };

  // Selecting custom plant from combobox option
  const handleSelectCustom = (customName) => {
    const trimmed = (customName || name).trim();
    setName(trimmed);
    setSelectedPresetId(null);
    setSubtitle('Custom Plant');
    setDefaultImageUrl('');
    setImageUrl('');
    setCustomImageUrl('');
    setVisualMode('category');
    setIsCustomPhoto(false);
    setNameError(false);
    setIsComboboxOpen(false);
    setIsComboboxFocused(false);
  };

  // Reset to empty custom plant
  const handleClearToCustom = () => {
    setSelectedPresetId(null);
    setName('');
    setNameError(false);
    setNickname('');
    setSubtitle('');
    setWaterIntervalDays(7);
    setSunlightLevel('medium');
    setCareTips('');
    setCategory('foliage');
    setSelectedCategoryFilter('all');
    setImageUrl('');
    setDefaultImageUrl('');
    setCustomImageUrl('');
    setVisualMode('category');
    setIsCustomPhoto(false);
    setImgPreviewError(false);
    setIsComboboxOpen(true);
    setIsComboboxFocused(true);
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  // Step 1 -> Step 2 validation
  const handleProceedToStep2 = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    // If not a preset and no image set yet, assign default fallback
    if (!selectedPresetId && !imageUrl) {
      setDefaultImageUrl('');
      setVisualMode('category');
    }
    setNameError(false);
    setIsComboboxOpen(false);
    setIsComboboxFocused(false);
    setCurrentStep(2);
  };

  // Step 2 -> Step 3 transition
  const handleProceedToStep3 = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep(3);
  };

  // Handle custom photo upload & compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedBase64 = await compressImageFile(file, 600, 600, 0.70);
      setImageUrl(compressedBase64);
      setCustomImageUrl(compressedBase64);
      setVisualMode('custom');
      setIsCustomPhoto(true);
      setImgPreviewError(false);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert(err.message || 'Could not process the selected image. Please try another image.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // STRICT: Only save when on Step 3
    if (currentStep === 1) {
      handleProceedToStep2(e);
      return;
    }
    if (currentStep === 2) {
      handleProceedToStep3(e);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setCurrentStep(1);
      setNameError(true);
      return;
    }

    const interval = Math.max(1, Number(waterIntervalDays) || 1);

    const finalLocation =
      roomPreset === 'Other' && customRoom.trim()
        ? customRoom.trim()
        : roomPreset;

    const sunlightObj = sunlightOptions.find((s) => s.value === sunlightLevel);

    onAdd({
      name: trimmedName,
      nickname: nickname.trim() || null,
      subtitle: subtitle || (roomPreset === 'Other' ? 'Custom Plant' : `${roomPreset} Plant`),
      location: finalLocation || 'Living Room',
      waterIntervalDays: interval,
      lastWateredDate: lastWateredDate || getTodayStr(),
      sunlightLevel,
      sunlightLabel: sunlightObj ? sunlightObj.label : 'Medium / Indirect',
      waterAmount: interval <= 5 ? 'high' : interval <= 9 ? 'medium' : 'low',
      waterAmountLabel:
        interval <= 5
          ? 'Frequent Water'
          : interval <= 9
          ? 'Regular Water'
          : 'Low / Dry Between',
      careTips: careTips.trim() || 'Check soil moisture before watering.',
      category: category || 'foliage',
      imageUrl: imageUrl ? imageUrl.trim() || null : null
    });

    handleClearToCustom();
    setCurrentStep(1);
    onClose();
  };

  // Explicit exit handler with confirmation safeguard if user has entered data
  const handleExplicitClose = () => {
    const hasEdits = currentStep > 1 || name.trim() || nickname.trim();
    if (hasEdits) {
      if (!window.confirm("Discard unsaved changes?")) {
        return;
      }
    }
    handleClearToCustom();
    setCurrentStep(1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-plant-title"
    >
      <div className="relative w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-plant-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Add New Plant
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                Step {currentStep} of 3: {currentStep === 1 ? 'Plant Identity' : currentStep === 2 ? 'Care & Schedule' : 'Plant Photo & Save'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExplicitClose}
            aria-label="Close dialog"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Step Progress Header (3 Steps) */}
        <div className="px-4 py-2 sm:px-6 bg-zinc-50/50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 1
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : currentStep > 1
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 1
                    ? 'bg-white text-emerald-700'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span className="truncate">1. Identity</span>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setNameError(true);
                  return;
                }
                setCurrentStep(2);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 2
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : currentStep > 2
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 2
                    ? 'bg-white text-emerald-700'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span className="truncate">2. Care</span>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setNameError(true);
                  return;
                }
                setCurrentStep(3);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 3
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 3
                    ? 'bg-white text-emerald-700'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                3
              </span>
              <span className="truncate">3. Photo</span>
            </button>
          </div>
        </div>

        {/* Scrollable Wizard Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
          <form
            id="add-plant-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 1) {
                handleProceedToStep2(e);
              } else if (currentStep === 2) {
                handleProceedToStep3(e);
              } else {
                handleSubmit(e);
              }
            }}
          >
            {/* ========================================================= */}
            {/* STEP 1: PLANT IDENTITY ONLY (SMART COMBOBOX & LOCATION)   */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                {/* Unified Smart "Search & Create" Combobox */}
                <div ref={comboboxRef} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Plant Name or Variety <span className="text-rose-500">*</span>
                    </label>
                    {selectedPresetId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Preset loaded</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleClearToCustom}
                          className="text-[10px] font-semibold text-zinc-500 hover:text-emerald-600 underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category Filter Pills (Horizontal scroll, zero-vertical bloat) */}
                  <div
                    className="flex items-center gap-1.5 overflow-x-auto py-1 mb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {CATEGORY_PILLS.map((cat) => {
                      const isSelected = selectedCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter(cat.id);
                            setIsComboboxOpen(true);
                          }}
                          className={`whitespace-nowrap flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input field with embedded search icon and clear button */}
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 pointer-events-none text-zinc-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="Search preset plants or type a custom name..."
                      value={name}
                      onFocus={() => {
                        setIsComboboxOpen(true);
                        setIsComboboxFocused(true);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setName(val);
                        setIsComboboxOpen(true);
                        if (selectedPresetId) {
                          const currentPreset = PLANT_DATABASE.find((p) => p.id === selectedPresetId);
                          if (currentPreset && (currentPreset.name || currentPreset.commonName) !== val) {
                            setSelectedPresetId(null);
                          }
                        }
                        if (nameError && val.trim()) {
                          setNameError(false);
                        }
                      }}
                      className={`w-full pl-10 pr-9 py-2.5 rounded-xl border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm transition ${
                        nameError
                          ? 'border-rose-400 ring-2 ring-rose-400 bg-rose-50/20'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    />
                    {name && (
                      <button
                        type="button"
                        onClick={handleClearToCustom}
                        aria-label="Clear plant name"
                        className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {nameError && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">
                      Please enter or choose a plant name to proceed.
                    </p>
                  )}

                  {/* Floating Suggestions Dropdown */}
                  {isComboboxOpen && (name.trim().length > 0 || isComboboxFocused) && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-zinc-700/90 p-2 z-30 max-h-64 overflow-y-auto space-y-1 animate-fade-in overscroll-contain">
                      {name.trim().length === 0 && (
                        <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          {selectedCategoryFilter === 'all'
                            ? 'Popular Plants'
                            : `${CATEGORY_PILLS.find((c) => c.id === selectedCategoryFilter)?.label || 'Category'} Plants`}
                        </div>
                      )}

                      {/* Matching Preset Rows (Up to 8) */}
                      {matchingPresets.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        const pName = preset.name || preset.commonName;
                        const pSub = preset.scientificName || preset.botanicalName || preset.alternateNames || '';
                        const pImg = preset.imageUrl || preset.image;

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 group ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-800'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* 32x32 Rounded Thumbnail with Category Avatar Fallback */}
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
                                {pImg && !rowImgErrors[preset.id] ? (
                                  <img
                                    src={pImg}
                                    alt={pName}
                                    onError={() => setRowImgErrors((prev) => ({ ...prev, [preset.id]: true }))}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <CategoryAvatar category={preset.category} iconClassName="w-4 h-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate leading-tight group-hover:text-emerald-600 transition-colors">
                                  {pName}
                                </p>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate leading-tight mt-0.5">
                                  {pSub}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 group-hover:border-emerald-300'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Use Preset →'}
                            </span>
                          </button>
                        );
                      })}

                      {/* No Matches Found Prompt */}
                      {matchingPresets.length === 0 && (
                        <div className="p-3 text-center rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 my-1">
                          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            No matching presets found{selectedCategoryFilter !== 'all' ? ' in this category' : ''}. Tap 'Use custom plant' or continue typing your own name.
                          </p>
                        </div>
                      )}

                      {/* Custom Plant Option (Never a zero-results dead end!) */}
                      {name.trim().length > 0 && !hasExactMatch && (
                        <button
                          type="button"
                          onClick={() => handleSelectCustom(name.trim())}
                          className="w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/50 group mt-1"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                              ➕ Use "{name.trim()}" as custom plant
                            </p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                              Configure your own watering schedule & photo on next steps
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                            Select →
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Duplicate Variety Alert */}
                {duplicateInstances.length > 0 && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="truncate">
                      You have {duplicateInstances.length} {name.trim()} already. Add a unique nickname below!
                    </p>
                  </div>
                )}

                {/* Custom Nickname / Location Tag */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Custom Nickname / Location Tag (optional)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">e.g. Hallway Pot</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hallway Pot, Bookshelf, Master Bed"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm"
                  />
                </div>

                {/* Room / Location Picker */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Room / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={roomPreset}
                      onChange={(e) => setRoomPreset(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm cursor-pointer"
                    >
                      {roomOptions.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>

                  {roomPreset === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom location (e.g. Balcony Planter)"
                      value={customRoom}
                      onChange={(e) => setCustomRoom(e.target.value)}
                      className="w-full mt-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs shadow-sm"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: CARE & SCHEDULE ONLY                               */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Plant reference badge */}
                <div className="px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {name} {nickname ? `• ${nickname}` : ''}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                      Location: {roomPreset === 'Other' && customRoom ? customRoom : roomPreset}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                  >
                    Edit Identity
                  </button>
                </div>

                {/* Watering Interval in days with [-] and [+] Stepper Controls */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Watering Frequency <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Water every {waterIntervalDays} {waterIntervalDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setWaterIntervalDays((prev) => Math.max(1, Number(prev) - 1))}
                      disabled={waterIntervalDays <= 1}
                      aria-label="Decrease interval"
                      className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={waterIntervalDays}
                        onChange={(e) => setWaterIntervalDays(Math.max(1, Number(e.target.value)))}
                        className="w-full text-center py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none hidden sm:inline">
                        days
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWaterIntervalDays((prev) => Math.min(90, Number(prev) + 1))}
                      disabled={waterIntervalDays >= 90}
                      aria-label="Increase interval"
                      className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Quick Pick Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-zinc-400 mr-1">Quick pick:</span>
                    {quickIntervals.map((days) => (
                      <button
                        type="button"
                        key={days}
                        onClick={() => setWaterIntervalDays(days)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                          waterIntervalDays === days
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sunlight Requirement Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Sunlight Requirement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {sunlightOptions.map((opt) => {
                      const isSelected = sunlightLevel === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setSunlightLevel(opt.value)}
                          className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[64px] ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400 shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300 bg-zinc-50/30 dark:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-zinc-400'}`} />
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{opt.label}</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Last Watered */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Date Last Watered
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      max={getTodayStr()}
                      value={lastWateredDate}
                      onChange={(e) => setLastWateredDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Care Notes / Novice Tip Field */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Care Notes & Novice Tips (Optional)</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Sensitive to overwatering; allow soil to dry between waterings."
                    value={careTips}
                    onChange={(e) => setCareTips(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: PHOTO & THREE-TIER VISUAL SELECTION               */}
            {/* ========================================================= */}
            {currentStep === 3 && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Summary card */}
                <div className="p-2.5 sm:p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {name} {nickname ? `• ${nickname}` : ''}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                      {roomPreset === 'Other' && customRoom ? customRoom : roomPreset} • Water every {waterIntervalDays} days
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                    Step 3: Visual Style
                  </span>
                </div>

                {/* Live Central Preview Card */}
                <div className="bg-zinc-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col items-center text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {/* Live Central Preview Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-200/80 dark:border-zinc-700 shadow-md flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 mb-2.5">
                    {imageUrl && !imgPreviewError && visualMode !== 'category' ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        onError={() => setImgPreviewError(true)}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CategoryAvatar
                        category={category}
                        iconClassName="w-10 h-10 mb-1"
                        label={imgPreviewError ? 'Image Error' : (name || 'New Plant')}
                      />
                    )}

                    {isCompressing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-medium p-1">
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-1" />
                        <span>Compressing</span>
                      </div>
                    )}

                    {/* Active Visual Mode Pill */}
                    <span className="absolute bottom-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs shadow-xs">
                      {visualMode === 'preset'
                        ? '🖼️ Preset Photo'
                        : visualMode === 'category'
                        ? '🌿 Category SVG'
                        : '📷 Custom Photo'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-2.5">
                    Choose how this plant appears on your dashboard:
                  </p>

                  {/* Three Distinct Option Tabs/Buttons */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    {/* Option A: Preset Photo */}
                    <button
                      type="button"
                      disabled={!defaultImageUrl}
                      onClick={() => {
                        if (!defaultImageUrl) return;
                        setVisualMode('preset');
                        setImageUrl(defaultImageUrl);
                        setIsCustomPhoto(false);
                        setImgPreviewError(false);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'preset'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : !defaultImageUrl
                          ? 'opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 cursor-not-allowed'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">🖼️</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Preset Photo</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {defaultImageUrl ? 'Catalogue' : 'Unavailable'}
                      </span>
                    </button>

                    {/* Option B: Category Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        setVisualMode('category');
                        setImageUrl('');
                        setIsCustomPhoto(false);
                        setImgPreviewError(false);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'category'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">🌿</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Category Icon</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Stylized SVG
                      </span>
                    </button>

                    {/* Option C: Take Photo / Upload */}
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => {
                        if (visualMode === 'custom' && customImageUrl) {
                          fileInputRef.current?.click();
                        } else if (customImageUrl) {
                          setVisualMode('custom');
                          setImageUrl(customImageUrl);
                          setIsCustomPhoto(true);
                          setImgPreviewError(false);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'custom'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">📷</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">
                        {visualMode === 'custom' && customImageUrl ? 'Replace Photo' : 'Take / Upload'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Camera / File
                      </span>
                    </button>
                  </div>

                  {/* Helper text & optional URL input */}
                  <div className="w-full max-w-md mt-2 flex flex-col items-center">
                    {!showUrlInput ? (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline font-normal py-0.5"
                      >
                        Or paste web image link
                      </button>
                    ) : (
                      <div className="w-full flex items-center gap-1.5 pt-1 animate-fade-in">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={imageUrl && !imageUrl.startsWith('data:image/') ? imageUrl : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImageUrl(val);
                            setVisualMode('custom');
                            setIsCustomPhoto(true);
                            setImgPreviewError(false);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="p-1 text-zinc-400 hover:text-zinc-600 text-xs rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Wizard Footer Navigation (Strict type="button" for all except final Save) */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={handleExplicitClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToStep2}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <span>Next: Care Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : currentStep === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <span>Next: Photo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                form="add-plant-form"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Plant</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
