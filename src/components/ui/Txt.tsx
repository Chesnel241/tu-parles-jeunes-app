import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts } from '@/theme';

export type TxtVariant = 'display' | 'body' | 'semi' | 'bold' | 'marker' | 'label';

const FAMILY: Record<TxtVariant, string> = {
  display: fonts.display,
  body: fonts.body,
  semi: fonts.bodySemi,
  bold: fonts.bodyBold,
  marker: fonts.marker,
  label: fonts.bodyBold,
};

type Props = TextProps & {
  variant?: TxtVariant;
  size?: number;
  color?: string;
  align?: TextStyle['textAlign'];
  /** Rotation légère « écrit à la main » (en degrés). */
  tilt?: number;
};

/**
 * Texte de l'app. Trois voix : Dela Gothic One (titres, expressions, scores),
 * Bricolage Grotesque (texte, boutons) et Permanent Marker (réactions, annotations).
 */
export function Txt({ variant = 'body', size, color = colors.ink, align, tilt, style, ...rest }: Props) {
  const fontSize = size ?? (variant === 'label' ? 13 : variant === 'display' ? 24 : 16);
  const lineHeight = Math.round(fontSize * (variant === 'display' ? 1.12 : variant === 'marker' ? 1.3 : 1.32));
  return (
    <Text
      maxFontSizeMultiplier={2}
      style={[
        { fontFamily: FAMILY[variant], fontSize, lineHeight, color, textAlign: align },
        variant === 'label' && styles.label,
        tilt ? { transform: [{ rotate: `${tilt}deg` }] } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  label: { letterSpacing: 1, textTransform: 'uppercase' },
});
