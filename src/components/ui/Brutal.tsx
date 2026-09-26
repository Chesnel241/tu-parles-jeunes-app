import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius as R, shadow as S, stroke } from '@/theme';

type Props = {
  children?: ReactNode;
  bg?: string;
  radius?: number;
  border?: number;
  borderColor?: string;
  offset?: number;
  shadowColor?: string;
  /** Rotation « sticker collé de travers », en degrés. */
  tilt?: number;
  /** Le bloc intérieur prend toute la hauteur disponible. */
  fill?: boolean;
  dashed?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Bloc néo-brutaliste : contour noir épais + ombre dure décalée (pas de flou).
 * C'est la brique visuelle de base de toute l'identité.
 */
export function Brutal({
  children,
  bg = colors.white,
  radius = R.lg,
  border = stroke.thick,
  borderColor = colors.ink,
  offset = S.lg,
  shadowColor = colors.ink,
  tilt,
  fill,
  dashed,
  style,
  contentStyle,
}: Props) {
  return (
    <View
      style={[
        { marginRight: offset, marginBottom: offset },
        tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null,
        fill ? { flex: 1 } : null,
        style,
      ]}
    >
      {offset > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: offset,
            left: offset,
            right: -offset,
            bottom: -offset,
            backgroundColor: shadowColor,
            borderRadius: radius,
          }}
        />
      ) : null}
      <View
        style={[
          {
            backgroundColor: bg,
            borderRadius: radius,
            borderWidth: border,
            borderColor,
            borderStyle: dashed ? 'dashed' : 'solid',
            overflow: 'hidden',
          },
          fill ? { flex: 1 } : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
