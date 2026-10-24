import React from 'react';
import {
  X,
  HelpCircle,
  Sprout,
  Pencil,
  Droplet,
  Check,
  LayoutGrid,
  ArrowUpDown,
  MessageSquare,
  Calendar
} from './Icons.jsx';

const { useEffect } = window.React || React;

export function QuickHelpModal({ isOpen, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in w-full max-w-full overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-help-title"
    >
      <div className="relative w-full max-w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quick-help-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Help & Quick Guide
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                KeepGreen User Manual & Reference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close guide"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Guide Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          {/* Welcome Intro Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-zinc-800/40 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
            <h3 className="text-sm sm:text-base font-extrabold text-emerald-900 dark:text-emerald-200">
              Welcome to KeepGreen
            </h3>
            <p className="text-xs font-semibold text-emerald-800/80 dark:text-emerald-300/80">
              Your Smart Watering & Plant Care Assistant.
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              KeepGreen helps you track, water, and care for your indoor and outdoor plants with a clean, mobile-first interface saved directly to your device.
            </p>
          </div>

          {/* Section 1: Adding & Editing Plants */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                <Sprout className="w-4 h-4" />
              </span>
              <span>1. Adding & Editing Plants (3-Step Micro-Wizard)</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tap <strong className="text-zinc-900 dark:text-zinc-100">"+ Add Plant"</strong> (or tap any existing plant card to edit). The zero-scroll wizard walks you through three simple steps:
            </p>
            <ul className="space-y-2 pl-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">Step 1: Identity</strong> — Search our extensive preset catalogue to autofill common names, scientific names, and typical care profiles, or enter your own custom plant name. You can add an optional Nickname. Select the location.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">Step 2: Care & Schedule</strong> — Set your watering frequency (in days), light exposure (e.g., Low, Medium, Bright Indirect, Direct), and custom care notes. If you selected a preset catalogue plant, KeepGreen sets recommended settings automatically. You can change these at any time. KeepGreen computes your next watering date.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">Step 3: Photo & Save</strong> — If a catalogue plant was selected, you can accept the image or upload/snap a photo of your actual plant, then hit Save to update your garden.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 2: Dashboard Views */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg">
                <LayoutGrid className="w-4 h-4" />
              </span>
              <span>2. Dashboard Views</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Switch between three display formats depending on your screen size and preference:
            </p>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Full View</strong> — Rich visual cards featuring large photos, quick water countdowns, sunlight badges, location tags, and instant action buttons.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Compact View</strong> — Space-saving grid displaying essential info and status badges for browsing larger collections quickly.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">List View</strong> — Dense, row-based layout ideal for rapid morning checks and high-density tracking.
              </li>
            </ul>
          </div>

          {/* Section 3: Sorting & Organization */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg">
                <ArrowUpDown className="w-4 h-4" />
              </span>
              <span>3. Sorting & Organization</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Use the <strong className="text-zinc-800 dark:text-zinc-200">Sort</strong> selector on your dashboard to arrange your collection by:
            </p>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Urgency</strong> — Puts plants needing water first (Overdue and Due Today at the top).
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">A–Z / Z–A</strong> — Alphabetical order by plant name.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Newest</strong> — Recently added plants appear first.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Water Frequency</strong> — Groups your thirstiest plants together.
              </li>
            </ul>
          </div>

          {/* Section 4: Quick Watering Actions */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-lg">
                <Droplet className="w-4 h-4 fill-current" />
              </span>
              <span>4. Quick Watering Actions</span>
            </div>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                Tap <strong className="text-zinc-800 dark:text-zinc-200">💧 Today</strong> on any plant card to instantly mark it as watered today and recalculate its schedule.
              </li>
              <li>
                Tap <strong className="text-zinc-800 dark:text-zinc-200">📅 Pick Date</strong> to log a past watering date directly via the calendar without entering the edit wizard.
              </li>
              <li>
                Need an extra day or two? Use the <strong className="text-zinc-800 dark:text-zinc-200">Snooze</strong> option (where available) to push back the schedule without losing your cadence.
              </li>
            </ul>
          </div>

          {/* Section 5: Feedback & Support */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </span>
              <span>5. Feedback & Support</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Have an idea, bug report, or plant request?
            </p>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                Tap the <strong className="text-zinc-800 dark:text-zinc-200">Feedback (speech bubble)</strong> icon in the top header.
              </li>
              <li>
                Your submission is securely routed via our cloud webhook with an anonymous device identifier (no personal logins or account details required).
              </li>
              <li>
                Prefer direct chat? You can also export your feedback or query straight to <strong className="text-zinc-800 dark:text-zinc-200">WhatsApp</strong>.
              </li>
            </ul>
          </div>

          {/* Note Banner */}
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400 italic text-center">
            Note: KeepGreen stores all your garden data locally in your browser's localStorage. No accounts or passwords needed.
          </div>
        </div>

        {/* Footer with Green "Got it!" Button & Version Tag */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Got it!</span>
          </button>
          <span className="text-[11px] text-zinc-400 font-medium">KeepGreen v0.01 (alpha)</span>
        </div>
      </div>
    </div>
  );
}
