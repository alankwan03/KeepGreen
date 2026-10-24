import React from 'react';
import { getPlantStatus, formatFriendlyDate } from '../utils/careStatus.js';
import { StatusBadge } from './StatusBadge.jsx';
import {
  Droplet,
  Sun,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Trash2,
  Lightbulb,
  Sprout,
  Pencil,
  Calendar,
  CategoryIcon,
  CategoryAvatar
} from './Icons.jsx';

const { useState, useEffect, useRef } = window.React || React;

export function PlantCard({ plant, onWater, onEdit, onDelete, viewMode = 'comfortable' }) {
  const [justWatered, setJustWatered] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dateInputRef = useRef(null);
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Reset image error state whenever plant image URL changes
  useEffect(() => {
    setImgError(false);
  }, [plant.imageUrl]);
  const status = getPlantStatus(plant.lastWateredDate, plant.waterIntervalDays);

  // Single-tap quick action: Water today
  const handleWaterToday = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onWater(plant.id, plant.name);
    setJustWatered(true);
    setTimeout(() => {
      setJustWatered(false);
    }, 1800);
  };

  // Secondary calendar trigger: opens native OS date picker
  const handleCalendarClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch (err) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  // Date selection change: logs custom/backdated watering
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      onWater(plant.id, plant.name, selectedDate);
      setJustWatered(true);
      setTimeout(() => {
        setJustWatered(false);
      }, 1800);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(plant.id, plant.name);
    setConfirmingDelete(false);
  };

  // Border class based on status category: heavier 3px rose border for overdue plants
  const cardBorderClass =
    status.category === 'danger'
      ? 'border-[3px] border-rose-500 dark:border-rose-600 shadow-md shadow-rose-100 dark:shadow-rose-950/30'
      : status.category === 'warning'
      ? 'border-2 border-amber-300 dark:border-amber-900 shadow-amber-50 dark:shadow-none'
      : 'border-2 border-emerald-100 dark:border-zinc-800 shadow-emerald-50/50 dark:shadow-none';

  // ==========================================
  // VIEW MODE 1: LIST / ROWS
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 rounded-xl p-3 sm:px-4 sm:py-2.5 transition-all duration-200 hover:shadow-md w-full max-w-full overflow-hidden ${cardBorderClass}`}
      >
        {/* Left: Avatar + Title & Location */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            {plant.imageUrl && !imgError ? (
              <img
                src={plant.imageUrl}
                alt={plant.name}
                onError={() => setImgError(true)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <CategoryAvatar category={plant.category} iconClassName="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                {plant.name}
              </h3>

              {plant.nickname && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  {plant.nickname}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="truncate">{plant.location}</span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span>Every {plant.waterIntervalDays} days</span>
            </div>
          </div>
        </div>

        {/* Center: Urgency Badge & Countdown */}
        <div className="flex items-center sm:justify-center gap-2.5 shrink-0 sm:px-2">
          <StatusBadge status={status} />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{status.indicatorText}</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0 justify-end">
          {confirmingDelete ? (
            <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg animate-fade-in">
              <span className="text-xs text-rose-700 dark:text-rose-300 font-medium px-1 truncate max-w-[120px]">
                Remove {plant.name}?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2 py-1 text-xs rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2 py-1 text-xs rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold transition"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Button 1: Primary Action ("💧 Today") */}
              <button
                type="button"
                onClick={handleWaterToday}
                title="Mark as watered today"
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                  justWatered
                    ? 'bg-emerald-600 ring-2 ring-emerald-400'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {justWatered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce text-emerald-100 shrink-0" />
                    <span>Watered!</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 fill-current shrink-0" />
                    <span>Today</span>
                  </>
                )}
              </button>

              {/* Button 2: Secondary Action ("📅 Pick Date") */}
              <button
                type="button"
                onClick={handleCalendarClick}
                title="Pick custom or past watering date"
                aria-label="Pick custom watering date"
                className="relative min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>Pick Date</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  max={getTodayStr()}
                  defaultValue={plant.lastWateredDate || getTodayStr()}
                  onChange={handleDateChange}
                  className="absolute inset-0 opacity-0 pointer-events-none -z-10"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(plant)}
                  title="Edit plant"
                  aria-label="Edit plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  title="Delete plant"
                  aria-label="Delete plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE 2: COMPACT (DENSER CARDS)
  // ==========================================
  if (viewMode === 'compact') {
    return (
      <div
        className={`relative flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 hover:shadow-md w-full max-w-full overflow-hidden ${cardBorderClass}`}
      >
        <div>
          {/* Top Row: Square Thumbnail + Plant Details */}
          <div className="flex gap-3 items-start mb-2.5">
            {/* Square Thumbnail on Left */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
              {plant.imageUrl && !imgError ? (
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  onError={() => setImgError(true)}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <CategoryAvatar
                  category={plant.category}
                  iconClassName="w-7 h-7 mb-0.5"
                  label={plant.name}
                />
              )}
            </div>

            {/* Title, Badge & Location */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1 mb-1">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                    {plant.name}
                  </h3>
                  {plant.nickname && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 mt-0.5 truncate max-w-full">
                      {plant.nickname}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{plant.location}</span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span>{plant.waterIntervalDays}d interval</span>
              </div>

              <div className="mt-1.5">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>

          {/* Condensed Status Indicator & Mini Progress Bar */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-2 mb-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-700 dark:text-zinc-200 mb-1">
              <span className="flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{status.indicatorText}</span>
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  status.category === 'danger'
                    ? 'bg-rose-500'
                    : status.category === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${status.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Compact Action Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center">
          {confirmingDelete ? (
            <div className="w-full flex items-center justify-between gap-1.5 p-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg animate-fade-in">
              <span className="text-xs text-rose-700 dark:text-rose-300 font-medium truncate">
                Delete?
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-2 py-0.5 text-xs rounded bg-rose-600 text-white font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center gap-2">
              <div className="grid grid-cols-2 gap-2 flex-1">
                {/* Button 1: Primary Action ("💧 Today") */}
                <button
                  type="button"
                  onClick={handleWaterToday}
                  title="Mark as watered today"
                  className={`min-h-[40px] px-2.5 py-1.5 rounded-xl font-semibold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                    justWatered
                      ? 'bg-emerald-600 ring-2 ring-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {justWatered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 animate-bounce text-emerald-100 shrink-0" />
                      <span>Watered!</span>
                    </>
                  ) : (
                    <>
                      <Droplet className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>Today</span>
                    </>
                  )}
                </button>

                {/* Button 2: Secondary Action ("📅 Pick Date") */}
                <button
                  type="button"
                  onClick={handleCalendarClick}
                  title="Pick custom or past watering date"
                  aria-label="Pick custom watering date"
                  className="relative min-h-[40px] px-2.5 py-1.5 rounded-xl font-semibold text-xs border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span>Pick Date</span>
                  <input
                    ref={dateInputRef}
                    type="date"
                    max={getTodayStr()}
                    defaultValue={plant.lastWateredDate || getTodayStr()}
                    onChange={handleDateChange}
                    className="absolute inset-0 opacity-0 pointer-events-none -z-10"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(plant)}
                  title="Edit plant"
                  aria-label="Edit plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  title="Delete plant"
                  aria-label="Delete plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE 3: COMFORTABLE (DEFAULT LARGE CARD)
  // ==========================================
  return (
    <div
      className={`relative flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg w-full max-w-full overflow-hidden ${cardBorderClass}`}
    >
      <div>
        {/* Plant Image Header with Status Badge Overlay */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3.5 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
          {plant.imageUrl && !imgError ? (
            <img
              src={plant.imageUrl}
              alt={plant.name}
              onError={() => setImgError(true)}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <CategoryAvatar
              category={plant.category}
              iconClassName="w-12 h-12 mb-1"
              label={plant.name}
            />
          )}
          <div className="absolute top-2.5 right-2.5 shadow-sm">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Title & Location Header: Primary Heading is ALWAYS Plant Variety */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {plant.name}
              </h3>

              {/* Styled Accent Pill for Nickname / Tag */}
              {plant.nickname ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
                  {plant.nickname}
                </span>
              ) : plant.subtitle ? (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal truncate hidden sm:inline">
                  ({plant.subtitle})
                </span>
              ) : null}
            </div>

            {/* Room / Location Row */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{plant.location}</span>
            </div>
          </div>
        </div>

        {/* Visual Care Info Cards */}
        <div className="grid grid-cols-2 gap-2 my-3.5">
          <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-lg">
              <Sun className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Sunlight</p>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {plant.sunlightLabel || `${plant.sunlightLevel} Sun`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg">
              <Droplet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Water Every</p>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {plant.waterIntervalDays} days
              </p>
            </div>
          </div>
        </div>

        {/* Status Timing & Progress Bar */}
        <div className="bg-zinc-50/80 dark:bg-zinc-800/40 rounded-xl p-3.5 mb-3">
          {/* Dynamic Urgency Text Indicator */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{status.indicatorText}</span>
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline-block">
              {formatFriendlyDate(plant.lastWateredDate)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                status.category === 'danger'
                  ? 'bg-rose-500'
                  : status.category === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>

          {/* Novice hint */}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 italic flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{status.hint}</span>
          </p>
        </div>

        {/* Plant Care Tip / Notes Field */}
        {plant.careTips && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl mb-3 text-zinc-700 dark:text-zinc-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight line-clamp-2">
              <span className="font-semibold text-amber-900 dark:text-amber-200">Tip: </span>
              {plant.careTips}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions: Quick Water, Edit & Delete */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 min-h-[48px] flex items-center">
        {confirmingDelete ? (
          <div className="w-full flex items-center justify-between gap-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl animate-fade-in">
            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium truncate">
              Remove {plant.name}?
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2">
            <div className="grid grid-cols-2 gap-2 flex-1">
              {/* Button 1: Primary Action ("💧 Today") */}
              <button
                type="button"
                onClick={handleWaterToday}
                title="Mark as watered today"
                className={`min-h-[42px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                  justWatered
                    ? 'bg-emerald-600 ring-2 ring-emerald-400'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {justWatered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce text-emerald-100 shrink-0" />
                    <span className="font-semibold">Watered! ✨</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 fill-current shrink-0" />
                    <span>Today</span>
                  </>
                )}
              </button>

              {/* Button 2: Secondary Action ("📅 Pick Date") */}
              <button
                type="button"
                onClick={handleCalendarClick}
                title="Pick custom or past watering date"
                aria-label="Pick custom watering date"
                className="relative min-h-[42px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>Pick Date</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  max={getTodayStr()}
                  defaultValue={plant.lastWateredDate || getTodayStr()}
                  onChange={handleDateChange}
                  className="absolute inset-0 opacity-0 pointer-events-none -z-10"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(plant)}
                  title="Edit plant schedule & details"
                  aria-label="Edit plant schedule & details"
                  className="p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  title="Remove plant from schedule"
                  aria-label="Remove plant from schedule"
                  className="p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
