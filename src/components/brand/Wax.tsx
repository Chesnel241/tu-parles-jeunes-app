import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { colors } from '@/theme';

type Props = {
  /** « color » : motif néon sur fond noir. « ink » : motif noir à poser en transparence. */
  variant?: 'color' | 'ink';
  tile?: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Motif « wax géo » : formes simples inspirées des tissus imprimés, redessinées en néon.
 * Un clin d'œil, pas un costume.
 */
export function Wax({ variant = 'color', tile = 96, opacity = 1, style }: Props) {
  const id = `wax-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const ink = variant === 'ink';
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse" viewBox="0 0 96 96">
            {!ink && <Rect width={96} height={96} fill={colors.ink} />}
            <Circle cx={24} cy={24} r={14} fill="none" stroke={ink ? colors.ink : colors.lime} strokeWidth={10} />
            <Path d="M60 40 L74 12 L88 40 Z" fill={ink ? colors.ink : colors.pink} />
            <Rect x={8} y={58} width={32} height={28} rx={9} fill={ink ? colors.ink : colors.violet} />
            {!ink && <Path d="M8 72 H40" stroke={colors.ink} strokeWidth={5} />}
            <Path d="M52 74 Q60 60 68 74 T84 74" fill="none" stroke={ink ? colors.ink : colors.orange} strokeWidth={7} strokeLinecap="round" />
            {!ink && <Circle cx={78} cy={88} r={4} fill={colors.cream} />}
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
