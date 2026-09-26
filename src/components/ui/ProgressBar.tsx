import { View } from 'react-native';
import { colors, stroke } from '@/theme';

type Props = {
  /** Valeur entre 0 et 1. */
  value: number;
  color?: string;
  height?: number;
  accessibilityLabel?: string;
};

export function ProgressBar({ value, color = colors.lime, height = 18, accessibilityLabel }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{
        flex: 1,
        height,
        borderWidth: stroke.medium,
        borderColor: colors.ink,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: colors.white,
      }}
    >
      <View
        style={{
          width: `${Math.max(pct > 0 ? 4 : 0, pct * 100)}%`,
          height: '100%',
          backgroundColor: color,
          borderRightWidth: pct > 0 && pct < 1 ? stroke.medium : 0,
          borderColor: colors.ink,
        }}
      />
    </View>
  );
}
