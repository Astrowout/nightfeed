// Nightfeed's mascot, built on bot-avatars (MIT, Jakub Antalik, https://libraries.dev/bots).
// Two looks: a plush full moon (default) or a pillow. Switch with MASCOT_LOOK.

export type MascotLook = 'moon' | 'pillow';
export type MascotState = 'default' | 'working' | 'sleeping';

export const MASCOT_LOOK: MascotLook = 'moon';

export interface MascotProps {
  size?: number;
  /** idle looks around; working hops (syncing, loading); sleeping dozes in a nightcap */
  state?: MascotState;
  /** the surface behind it */
  onDark?: boolean;
  look?: MascotLook;
  /** follow the pointer and hop on click */
  interactive?: boolean;
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
    craters: '#E2D3A6',
  },
  pillow: {
    type: 'square' as const,
    path: PILLOW_PATH,
    color: '#EEEAF8', // pillowcase, a breath of lilac
    brightness: 1,
    craters: undefined as string | undefined,
  },
};

export const NIGHTCAP = '#421D24'; // Midnight Wine, the same as the primary action
