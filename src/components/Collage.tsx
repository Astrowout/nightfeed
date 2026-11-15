import React, { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { rng } from '../data/generate';

/**
 * A torn-paper scrap (Craft collage): a soft rectangle whose edges wobble a little.
 * Purely decorative, hidden from screen readers.
 */
export function PaperScrap({
  width,
  height,
  color,
  seed = 1,
  rotate = 0,
  style,
}: {
  width: number;
  height: number;
  color: string;
  seed?: number;
  rotate?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const d = useMemo(() => {
    const r = rng(seed);
    const pts: [number, number][] = [];
    const jag = (n: number) => (r() - 0.5) * n;
    const step = 9;
    for (let x = 0; x <= width; x += step) pts.push([x, 3 + jag(5)]);
    for (let y = step; y <= height; y += step) pts.push([width - 3 + jag(5), y]);
    for (let x = width - step; x >= 0; x -= step) pts.push([x, height - 3 + jag(5)]);
    for (let y = height - step; y > 0; y -= step) pts.push([3 + jag(5), y]);
    return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} Z`;
  }, [width, height, seed]);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ position: 'absolute', width, height, transform: [{ rotate: `${rotate}deg` }] }, style]}
    >
      <Svg width={width} height={height}>
        <Path d={d} fill={color} />
      </Svg>
    </View>
  );
}
