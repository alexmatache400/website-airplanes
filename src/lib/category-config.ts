// Category badge colors — Tailwind classes can't be computed dynamically,
// so we keep a static map here. Add an entry when a new category is created in the DB.

const CATEGORY_COLORS: Record<string, string> = {
  HOTAS: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-200 dark:from-sky-500/70 dark:to-blue-600/70 dark:border-sky-700 dark:text-sky-650',
  Throttle: 'from-emerald-300/40 to-emerald-500/80 border-emerald-600 text-slate-900 dark:from-emerald-500/30 dark:to-emerald-700/70 dark:border-emerald-400 dark:text-slate-50',
  Joystick: 'from-violet-400/40 to-fuchsia-500/80 border-violet-600 text-slate-900 dark:from-violet-500/40 dark:to-fuchsia-600/70 dark:border-violet-400 dark:text-slate-50',
  Pedals: 'from-amber-200/60 to-amber-400/90 border-amber-500 text-slate-900 dark:from-amber-400/30 dark:to-amber-600/70 dark:border-amber-300 dark:text-slate-50',
  Panel: 'from-rose-300/50 to-rose-500/90 border-rose-600 text-slate-900 dark:from-rose-500/30 dark:to-rose-700/70 dark:border-rose-400 dark:text-slate-50',
  MCDU: 'from-cyan-300/40 to-cyan-500/80 border-cyan-600 text-slate-900 dark:from-cyan-500/30 dark:to-cyan-700/70 dark:border-cyan-400 dark:text-slate-50',
  Rudder: 'from-orange-300/40 to-orange-500/80 border-orange-600 text-slate-900 dark:from-orange-500/30 dark:to-orange-700/70 dark:border-orange-400 dark:text-slate-50',
  Base: 'from-teal-300/40 to-teal-500/80 border-teal-600 text-slate-900 dark:from-teal-500/30 dark:to-teal-700/80 dark:border-teal-400 dark:text-slate-50',
  Accessories: 'from-indigo-300/40 to-indigo-500/80 border-indigo-600 text-slate-900 dark:from-indigo-500/30 dark:to-indigo-700/70 dark:border-indigo-400 dark:text-slate-50',
  Bundle: 'from-slate-200/80 to-slate-400/90 border-slate-500 text-slate-900 dark:from-slate-600/40 dark:to-slate-800/80 dark:border-slate-500 dark:text-slate-50',
};

const DEFAULT_CATEGORY_COLOR = 'from-slate-300/40 to-slate-500/80 border-slate-500 text-slate-900 dark:from-slate-500/30 dark:to-slate-700/70 dark:border-slate-400 dark:text-slate-50';

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR;
}
