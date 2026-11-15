// Kudoze's mascot, Plume: a plush pillow built on bot-avatars
// (MIT, Jakub Antalik, https://libraries.dev/bots). Like a brand bear, it is the
// same character everywhere, in different moods and outfits.
// A full-moon look is kept as an alternative: switch with MASCOT_LOOK.

export type MascotLook = 'moon' | 'pillow';
export type MascotState = 'default' | 'working' | 'sleeping';
export type MascotHat = 'none' | 'beret' | 'beanie' | 'party' | 'crown';
export type MascotGlasses = 'none' | 'round' | 'square' | 'shades';

export const MASCOT_LOOK: MascotLook = 'pillow';
export const MASCOT_NAME = 'Plume';

export interface MascotProps {
  size?: number;
  /** idle looks around; working hops (syncing, loading); sleeping dozes, in a nightcap unless another hat is given */
  state?: MascotState;
  /** the surface behind it */
  onDark?: boolean;
  look?: MascotLook;
  /** follow the pointer and hop on click */
  interactive?: boolean;
  /** a small mouth that changes with the state (always on while working) */
  smile?: boolean;
  hat?: MascotHat;
  glasses?: MascotGlasses;
  headphones?: boolean;
  bowTie?: boolean;
  /** colour of the hat, headphones and bow tie; Midnight Wine by default */
  accessoryColor?: string;
  label?: string;
}

/** A pillow outline in the 100×100 body box: soft sides, corners pulled out a little. */
export const PILLOW_PATH =
  'M12 22C11 17 15 13 20 14C38 18 62 18 80 14C85 13 89 17 88 22C84 40 84 60 88 78C89 83 85 87 80 86C62 82 38 82 20 86C15 87 11 83 12 78C16 60 16 40 12 22Z';

export const LOOKS = {
  moon: {
    type: 'circle' as const,
    path: undefined as string | undefined,
    color: '#F1E6C4', // moonlight cream
    brightness: 1.12,
    craters: '#E2D3A6' as string | undefined,
  },
  pillow: {
    type: 'square' as const,
    path: PILLOW_PATH as string | undefined,
    color: '#EEEAF8', // pillowcase, a breath of lilac
    brightness: 1,
    craters: undefined as string | undefined,
  },
};

export const NIGHTCAP = '#421D24'; // Midnight Wine, the same as the primary action

export function mascotLabel(p: MascotProps): string {
  if (p.label) return p.label;
  const mood = p.state === 'sleeping' ? 'asleep' : p.state === 'working' ? 'busy' : 'awake';
  return `${MASCOT_NAME} the pillow, ${mood}`;
}
