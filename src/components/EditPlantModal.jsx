import React from 'react';
import { PLANT_DATABASE } from '../data/plantDatabase.js';
import { compressImageFile } from '../utils/imageCompressor.js';
import {
  X,
  Pencil,
  Sun,
  Droplet,
  MapPin,
  Calendar,
  Sparkles,
  Lightbulb,
  Leaf,
  Camera,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Sprout,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CategoryIcon,
  CategoryAvatar
} from './Icons.jsx';

const { useState, useEffect, useMemo, useRef } = window.React || React;

export function EditPlantModal({ isOpen, plant, onClose, onSave }) {
  if (!isOpen || !plant) return null;

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  // 3-Step Wizard: 1 = Identity, 2 = Care & Schedule, 3 = Photo & Save
  const [currentStep, setCurrentStep] = useState(1);
  const [nameError, setNameError] = useState(false);

  const [name, setName] = useState(plant.name || '');
  const [nickname, setNickname] = useState(plant.nickname || '');
  const [subtitle, setSubtitle] = useState(plant.subtitle || '');
  const [roomPreset, setRoomPreset] = useState(plant.location || 'Living Room');
  const [customRoom, setCustomRoom] = useState('');
  const [waterIntervalDays, setWaterIntervalDays] = useState(plant.waterIntervalDays || 7);
  const [sunlightLevel, setSunlightLevel] = useState(plant.sunlightLevel || 'medium');
  const [lastWateredDate, setLastWateredDate] = useState(plant.lastWateredDate || '');
  const [careTips, setCareTips] = useState(plant.careTips || '');

  // Look up catalog default image if matching plant exists in database
  const stockPreset = useMemo(() => {
    if (!plant || !plant.name) return null;
    return PLANT_DATABASE.find(
      (p) => (p.commonName || p.name || '').toLowerCase().trim() === plant.name.toLowerCase().trim()
    );
  }, [plant]);

  const defaultImageUrl = stockPreset ? (stockPreset.imageUrl || stockPreset.image || '') : '';
  const initialCategory = plant.category || stockPreset?.category || 'foliage';
  const [category, setCategory] = useState(initialCategory);

  // Three-Tier Visual System State ('preset' | 'category' | 'custom')
  const [visualMode, setVisualMode] = useState(() => {
    if (!plant.imageUrl) return 'category';
    if (defaultImageUrl && plant.imageUrl === defaultImageUrl) return 'preset';
    return 'custom';
  });
  const [imageUrl, setImageUrl] = useState(plant.imageUrl || '');
  const [customImageUrl, setCustomImageUrl] = useState(() => {
    if (plant.imageUrl && plant.imageUrl !== defaultImageUrl) return plant.imageUrl;
    return '';
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

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

  // Initialize room dropdown vs custom room and reset states
  useEffect(() => {
    if (plant) {
      setCurrentStep(1);
      setNameError(false);
      setName(plant.name || '');
      setNickname(plant.nickname || '');
      setSubtitle(plant.subtitle || '');
      setWaterIntervalDays(plant.waterIntervalDays || 7);
      setSunlightLevel(plant.sunlightLevel || 'medium');
      setLastWateredDate(plant.lastWateredDate || '');
      setCareTips(plant.careTips || '');
      setCategory(plant.category || stockPreset?.category || 'foliage');
      setImageUrl(plant.imageUrl || '');
      setImgPreviewError(false);
      setIsCompressing(false);

      if (!plant.imageUrl) {
        setVisualMode('category');
      } else if (defaultImageUrl && plant.imageUrl === defaultImageUrl) {
        setVisualMode('preset');
      } else {
        setVisualMode('custom');
        setCustomImageUrl(plant.imageUrl);
      }

      if (roomOptions.includes(plant.location)) {
        setRoomPreset(plant.location);
        setCustomRoom('');
      } else {
        setRoomPreset('Other');
        setCustomRoom(plant.location || '');
      }
    }
  }, [plant, defaultImageUrl]);

  // Handle explicit exit with confirmation safeguard if edits exist
  const handleExplicitClose = () => {
    const hasEdits =
      currentStep > 1 ||
      (plant && (
        name.trim() !== (plant.name || '').trim() ||
        nickname.trim() !== (plant.nickname || '').trim() ||
        waterIntervalDays !== (plant.waterIntervalDays || 7) ||
        sunlightLevel !== (plant.sunlightLevel || 'medium') ||
        imageUrl !== (plant.imageUrl || '')
      ));
    if (hasEdits) {
      if (!window.confirm("Discard unsaved changes?")) {
        return;
      }
    }
    setCurrentStep(1);
    onClose();
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleExplicitClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, name, nickname, waterIntervalDays, sunlightLevel, imageUrl, plant]);

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
    setNameError(false);
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

  // Handle custom photo upload & client-side compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedBase64 = await compressImageFile(file, 600, 600, 0.70);
      setImageUrl(compressedBase64);
      setCustomImageUrl(compressedBase64);
      setVisualMode('custom');
      setImgPreviewError(false);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert(err.message || 'Could not process the selected image.');
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

    onSave({
      ...plant,
      name: trimmedName,
      nickname: nickname.trim() || null,
      subtitle: subtitle.trim() || plant.subtitle,
      location: finalLocation || 'Living Room',
      waterIntervalDays: interval,
      lastWateredDate: lastWateredDate || plant.lastWateredDate,
      sunlightLevel,
      sunlightLabel: sunlightObj ? sunlightObj.label : 'Medium / Indirect',
      careTips: careTips.trim() || 'Check soil moisture before watering.',
      category: category || plant.category || 'foliage',
      imageUrl: imageUrl ? imageUrl.trim() || null : null
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in w-full max-w-full overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-plant-title"
    >
      <div className="relative w-full max-w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-plant-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Edit {plant.name || 'Plant'}
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
            id="edit-plant-form"
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
            {/* STEP 1: PLANT IDENTITY ONLY (COMPACT & FOCUSED)            */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <div className="space-y-3.5 animate-fade-in">
                {/* 2-Column: Variety Name & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Plant Variety / Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      placeholder="e.g. Peace Lily, Snake Plant"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError && e.target.value.trim()) {
                          setNameError(false);
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium ${
                        nameError
                          ? 'border-rose-400 ring-2 ring-rose-400 bg-rose-50/30'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    />
                    {nameError && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1">
                        Please enter a plant name to proceed.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Variety / Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Swiss Cheese Plant"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* 2-Column: Nickname & Room */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Custom Nickname (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Living Room Bookshelf"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Room / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                      <select
                        value={roomPreset}
                        onChange={(e) => setRoomPreset(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
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
                        placeholder="Enter custom room"
                        value={customRoom}
                        onChange={(e) => setCustomRoom(e.target.value)}
                        className="w-full mt-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: CARE & SCHEDULE ONLY                               */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Summary header */}
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

                {/* Date Last Watered (Manual Correction) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Date Last Watered (Manual Correction)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      value={lastWateredDate}
                      onChange={(e) => setLastWateredDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Personal Notes / Care Tips */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Personal Notes & Care Tips</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Moved away from winter heater; water thoroughly."
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
                        category={category || plant.category}
                        iconClassName="w-10 h-10 mb-1"
                        label={imgPreviewError ? 'Image Error' : (name || plant.name)}
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
                form="edit-plant-form"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
