import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { tapLight } from '@/services/haptics';
import { colors, onColor, radius, stroke } from '@/theme';
import { Txt } from './Txt';

type ChipProps = {
  label?: string;
  children?: ReactNode;
  bg?: string;
  color?: string;
  borderColor?: string;
  size?: number;
  tilt?: number;
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Pastille d'information (ville, statut, mode de jeu…). */
export function Chip({ label, children, bg = colors.white, color, borderColor = colors.ink, size = 13, tilt, uppercase, style }: ChipProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          borderWidth: stroke.medium,
          borderColor,
          borderRadius: radius.pill,
          paddingVertical: 3,
          paddingHorizontal: 12,
          backgroundColor: bg,
        },
        tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null,
        style,
      ]}
    >
      {children}
      {label ? (
        <Txt variant="bold" size={size} color={color ?? onColor(bg)} style={uppercase ? { textTransform: 'uppercase' } : undefined} numberOfLines={1}>
          {label}
        </Txt>
      ) : null}
    </View>
  );
}

type ChipButtonProps = {
  label: string;
  onPress?: () => void;
  bg?: string;
  color?: string;
  selected?: boolean;
  disabled?: boolean;
  dashed?: boolean;
  flat?: boolean;
  size?: number;
  borderColor?: string;
  /** Version resserrée (filtres sur une seule ligne). */
  compact?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Pastille cliquable (filtres, onglets, jokers, choix). Zone tactile ≥ 44 px. */
export function ChipButton({ label, onPress, bg = colors.white, color, selected, disabled, dashed, flat, size = 15, borderColor = colors.ink, compact, accessibilityLabel, style }: ChipButtonProps) {
  const off = flat ? 0 : 3;
  return (
    <View style={[{ marginRight: off, marginBottom: off, opacity: disabled ? 0.45 : 1 }, style]}>
      {off > 0 ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: off, left: off, right: -off, bottom: -off, borderRadius: radius.pill, backgroundColor: colors.ink }}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected: Boolean(selected), disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={() => {
          tapLight();
          onPress?.();
        }}
        style={({ pressed }) => [
          {
            minHeight: 44,
            paddingHorizontal: compact ? 12 : 15,
            paddingVertical: 8,
            borderRadius: radius.pill,
            borderWidth: stroke.medium,
            borderColor,
            borderStyle: dashed ? 'dashed' : 'solid',
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          },
          pressed && !disabled && off ? { transform: [{ translateX: 2 }, { translateY: 2 }] } : null,
        ]}
      >
        <Txt variant="bold" size={size} color={color ?? onColor(bg)} align="center">
          {label}
        </Txt>
      </Pressable>
    </View>
  );
}
