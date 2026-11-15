import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface P {
  size?: number;
  color: string;
  filled?: boolean;
}

const S = ({ size = 22, children }: { size?: number; children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

const line = (color: string) => ({ stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const MoonIcon = ({ size, color, filled }: P) => (
  <S size={size}>
    <Path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill={filled ? color : 'none'} {...line(color)} />
  </S>
);

export const FeedIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M4 6h16M4 12h16M4 18h10" {...line(color)} />
  </S>
);

export const TrophyIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7" {...line(color)} />
  </S>
);

export const PlusIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M12 5v14M5 12h14" {...line(color)} />
  </S>
);

export const UserIcon = ({ size, color }: P) => (
  <S size={size}>
    <Circle cx={12} cy={8.5} r={3.5} {...line(color)} />
    <Path d="M5 20a7 7 0 0 1 14 0" {...line(color)} />
  </S>
);

export const StarIcon = ({ size, color, filled }: P) => (
  <S size={size}>
    <Path
      d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.5Z"
      fill={filled ? color : 'none'}
      {...line(color)}
    />
  </S>
);

export const CommentIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M5 5h14v10H10l-4 4v-4H5V5Z" {...line(color)} />
  </S>
);

export const LockIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z" {...line(color)} />
  </S>
);

export const WatchIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M9 3h6l1 4M9 3 8 7M8 17l1 4h6l1-4" {...line(color)} />
    <Path d="M7 7h10v10H7z" {...line(color)} />
  </S>
);

export const FlameIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-3-2 2-3 4-3 7a6 6 0 0 0 6 6Z" {...line(color)} />
  </S>
);

export const ChevronIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="m9 5 7 7-7 7" {...line(color)} />
  </S>
);

export const BackIcon = ({ size, color }: P) => (
  <S size={size}>
    <Path d="m15 5-7 7 7 7" {...line(color)} />
  </S>
);
