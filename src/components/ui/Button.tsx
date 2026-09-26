import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { tapLight } from '@/services/haptics';
import { colors, onColor, radius as R, shadow as S, stroke } from '@/theme';
import { Txt } from './Txt';

type Props = {
  label?: string;
  children?: ReactNode;
  onPress?: () => void;
  bg?: string;
  color?: string;
  /** « cta » = gros bouton en Dela Gothic, centré. */
  variant?: 'default' | 'cta';
  align?: 'left' | 'center';
  disabled?: boolean;
  radius?: number;
  offset?: number;
  minHeight?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Bouton néo-brutaliste. À l'appui, il « s'enfonce » dans son ombre
 * (translation de l'épaisseur de l'ombre), comme dans la maquette.
 */
export function Button({
  label,
  children,
  onPress,
  bg = colors.white,
  color,
  variant = 'default',
  align,
  disabled,
  radius = R.md,
  offset = S.md,
  minHeight,
  accessibilityLabel,
  accessibilityHint,
  style,
  contentStyle,
  testID,
}: Props) {
  const textColor = color ?? onColor(bg);
  const centered = (align ?? (variant === 'cta' ? 'center' : 'left')) === 'center';
  return (
    <View style={[{ marginRight: offset, marginBottom: offset, opacity: disabled ? 0.5 : 1 }, style]}>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: offset, left: offset, right: -offset, bottom: -offset, backgroundColor: colors.ink, borderRadius: radius }}
      />
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPress={() => {
          tapLight();
          onPress?.();
        }}
        style={({ pressed }) => [
          {
            backgroundColor: bg,
            borderRadius: radius,
            borderWidth: stroke.thick,
            borderColor: colors.ink,
            paddingVertical: 14,
            paddingHorizontal: 16,
            minHeight: minHeight ?? (variant === 'cta' ? 58 : 48),
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: centered ? 'center' : 'stretch',
          },
          pressed && !disabled ? { transform: [{ translateX: offset - 1 }, { translateY: offset - 1 }] } : null,
          contentStyle,
        ]}
      >
        {children ?? (
          <Txt
            variant={variant === 'cta' ? 'display' : 'bold'}
            size={variant === 'cta' ? 19 : 18}
            color={textColor}
            align={centered ? 'center' : 'left'}
            style={variant === 'cta' ? { letterSpacing: 0.6 } : undefined}
          >
            {label}
          </Txt>
        )}
      </Pressable>
    </View>
  );
}
