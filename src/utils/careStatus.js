/**
 * Computes difference in calendar days between two dates.
 * Ignores exact hours/minutes so day transitions are clean and predictable.
 */
export function getDaysDifference(pastDateStr, today = new Date()) {
  if (!pastDateStr) return 0;
  
  const [year, month, day] = pastDateStr.split('-').map(Number);
  const past = new Date(year, month - 1, day);
  
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffMs = current.getTime() - past.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates watering status for a plant according to the care rules:
 * - Green ("Healthy / Good"): more than 2 days remain before watering is due
 * - Amber ("Due Soon"): 1-2 days remain
 * - Red ("Needs Water Today" / "Overdue by X days"): due today or past due
 */
export function getPlantStatus(lastWateredDate, waterIntervalDays) {
  const daysElapsed = Math.max(0, getDaysDifference(lastWateredDate));
  const daysRemaining = waterIntervalDays - daysElapsed;
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / waterIntervalDays) * 100)));

  // Formulate clear elapsed description
  const elapsedText =
    daysElapsed === 0
      ? 'Watered today'
      : daysElapsed === 1
      ? 'Watered 1 day ago'
      : `Watered ${daysElapsed} days ago`;

  // 1. Red status: Due today or overdue
  if (daysRemaining <= 0) {
    const overdueDays = Math.abs(daysRemaining);
    const dueText = overdueDays === 0 ? 'Due today' : `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
    const badgeLabel = overdueDays === 0 ? 'Needs Water Today' : `Overdue by ${overdueDays}d`;

    return {
      category: 'danger',
      label: badgeLabel,
      shortLabel: 'Needs Water',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      pillBg: 'bg-rose-500',
      accentColor: 'rose',
      daysElapsed,
      daysRemaining,
      progressPercent: 100,
      elapsedText,
      dueText,
      indicatorText: `${elapsedText} • ${dueText}`,
      timingText: dueText,
      actionUrgent: true,
      hint: 'Give this plant a thorough drink today'
    };
  }

  // 2. Amber status: 1-2 days remaining
  if (daysRemaining <= 2) {
    const dueText = daysRemaining === 1 ? 'Due tomorrow' : 'Due in 2 days';

    return {
      category: 'warning',
      label: 'Due Soon',
      shortLabel: 'Due Soon',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      pillBg: 'bg-amber-500',
      accentColor: 'amber',
      daysElapsed,
      daysRemaining,
      progressPercent,
      elapsedText,
      dueText,
      indicatorText: `${elapsedText} • Due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
      timingText: dueText,
      actionUrgent: false,
      hint: 'Check topsoil moisture before watering'
    };
  }

  // 3. Green status: more than 2 days remaining
  const dueText = `Due in ${daysRemaining} days`;
  return {
    category: 'healthy',
    label: 'Healthy / Good',
    shortLabel: 'Healthy',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    pillBg: 'bg-emerald-500',
    accentColor: 'emerald',
    daysElapsed,
    daysRemaining,
    progressPercent,
    elapsedText,
    dueText,
    indicatorText: `${elapsedText} • ${dueText}`,
    timingText: `Water in ${daysRemaining} days`,
    actionUrgent: false,
    hint: 'Moisture is looking good, no action needed'
  };
}

export function formatFriendlyDate(dateStr) {
  if (!dateStr) return 'Never';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}
