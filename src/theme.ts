import { Platform, type TextStyle } from 'react-native';
import type { SleepStageType } from './data/types';

// Kudoze design system: a merge of two references.
// Superhuman: warm parchment canvas, white cards with hairlines, ink text,
//   Midnight Wine as the only filled action, Lilac for selection, Violet for links only,
//   Deep Lagoon as the single dark band (our "night" surface), no shadows on cards.
// Craft Docs: literary serif headlines over a clean sans, pastel tags and stage colours,
//   torn-paper collage scraps, pill buttons, soft layered shadows on floating elements only.

export const C = {
  canvas: '#F2F0EB', // Warm Parchment
  paper: '#FFFFFF', // cards that lift off the canvas
  inset: '#F7F5F1', // chart wells inside cards
  line: '#E3E3E2', // Soft Mist hairlines
  ink: '#292827', // Ink Charcoal
  muted: '#666666', // Stone Gray
  faint: '#A8A4A0', // disabled, placeholders
  wine: '#421D24', // the one filled action colour
  violet: '#714CB6', // links only
  lilac: '#D4C7FF', // selected state, secondary button
  lagoon: '#0C4243', // night band
  mint: '#9BD8A9',
  marigold: '#FDE99B',
  periwinkle: '#B8CAF5',
  papaya: '#FF4500',
  peach: '#F8D3C2',
  onDark: '#FFFFFF',
  onDarkMuted: 'rgba(255,255,255,0.72)',
  onDarkLine: 'rgba(255,255,255,0.16)',
};

/** Hypnogram colours, the Craft pastels plus lagoon for deep sleep. */
export const STAGE: Record<SleepStageType, { color: string; label: string; row: number }> = {
  awake: { color: '#F2A285', label: 'Awake', row: 0 },
  in_bed: { color: '#F2A285', label: 'In bed', row: 0 },
  rem: { color: '#6CC384', label: 'REM', row: 1 },
  light: { color: '#93ABEC', label: 'Light', row: 2 },
  sleeping: { color: '#93ABEC', label: 'Asleep', row: 2 },
  unknown: { color: C.faint, label: 'Unknown', row: 2 },
  deep: { color: C.lagoon, label: 'Deep', row: 3 },
};

/** Pastel tag per score band; the number itself stays ink. */
export function scoreTag(score: number): { label: string; bg: string } {
  if (score >= 85) return { label: 'Restored', bg: C.mint };
  if (score >= 70) return { label: 'Solid', bg: C.periwinkle };
  if (score >= 55) return { label: 'Patchy', bg: C.marigold };
  return { label: 'Rough', bg: C.peach };
}

export const R = { tab: 8, input: 14, card: 16, sheet: 24, pill: 999 };
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 40 };
export const MAX_W = 680;

export const F = {
  logo: 'DynaPuff_600SemiBold', // wordmark only: puffy, like Plume
  serif: 'Lora_400Regular',
  serifItalic: 'Lora_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
};

/** Type scale. Serif only at 24px and up (Craft rule); sans headings stay at medium weight (Superhuman). */
export const T: Record<string, TextStyle> = {
  display: { fontFamily: F.serif, fontSize: 40, lineHeight: 44, letterSpacing: -1.4, color: C.ink },
  h1: { fontFamily: F.serif, fontSize: 32, lineHeight: 37, letterSpacing: -0.9, color: C.ink },
  h2: { fontFamily: F.serif, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: C.ink },
  title: { fontFamily: F.sansMedium, fontSize: 18, lineHeight: 24, letterSpacing: -0.15, color: C.ink },
  body: { fontFamily: F.sans, fontSize: 15, lineHeight: 22, letterSpacing: -0.1, color: C.ink },
  bodyStrong: { fontFamily: F.sansSemi, fontSize: 15, lineHeight: 22, color: C.ink },
  small: { fontFamily: F.sans, fontSize: 13, lineHeight: 19, color: C.muted },
  smallStrong: { fontFamily: F.sansSemi, fontSize: 13, lineHeight: 19, color: C.ink },
  caption: { fontFamily: F.sans, fontSize: 12, lineHeight: 18, letterSpacing: 0.12, color: C.muted },
  eyebrow: { fontFamily: F.sansSemi, fontSize: 11, lineHeight: 14, letterSpacing: 0.9, textTransform: 'uppercase', color: C.muted },
  stat: { fontFamily: F.sansMedium, fontSize: 20, lineHeight: 26, letterSpacing: -0.3, color: C.ink, fontVariant: ['tabular-nums'] },
  number: { fontFamily: F.serif, fontSize: 28, lineHeight: 32, letterSpacing: -0.8, color: C.ink, fontVariant: ['tabular-nums'] },
  link: { fontFamily: F.sansMedium, fontSize: 15, lineHeight: 22, color: C.violet },
};

/** Craft's soft layered shadow, for floating elements only (sheets, tab bar, auth card). */
export const FLOAT = Platform.select({
  default: {
    boxShadow:
      '0px 50px 40px 0px rgba(0,0,0,0.01), 0px 20px 40px 0px rgba(0,0,0,0.05), 0px 3px 10px 0px rgba(0,0,0,0.08)',
  },
}) as object;

export const AVATAR_PASTELS = [C.mint, C.marigold, C.periwinkle, C.lilac, C.peach, '#C9E7EF'];
