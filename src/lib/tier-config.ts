// Tier visual config — Tailwind classes can't be computed dynamically,
// so we keep a static map here. Add an entry when a new tier is created in the DB.

export interface TierStyle {
  textColor: string;
  iconClass: string;
  sublabel: string;
}

const TIER_STYLE: Record<string, TierStyle> = {
  First:    { textColor: 'text-amber-400',   iconClass: 'w-8 h-8 text-amber-400',   sublabel: 'Premium tier' },
  Business: { textColor: 'text-blue-400',    iconClass: 'w-8 h-8 text-blue-400',    sublabel: 'Mid-tier' },
  Economy:  { textColor: 'text-emerald-400', iconClass: 'w-8 h-8 text-emerald-400', sublabel: 'Entry-level' },
};

const DEFAULT_TIER_STYLE: TierStyle = {
  textColor: 'text-slate-400',
  iconClass: 'w-8 h-8 text-slate-400',
  sublabel: '',
};

export function getTierStyle(tierName: string): TierStyle {
  return TIER_STYLE[tierName] || DEFAULT_TIER_STYLE;
}
