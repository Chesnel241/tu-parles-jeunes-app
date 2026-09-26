import Svg, { Circle, Defs, Ellipse, G, Path, Pattern, Rect, Text as SvgText } from 'react-native-svg';
import type { Look, Mood } from '@/data/types';
import { colors, fonts } from '@/theme';

type Props = {
  color?: string;
  mood?: Mood;
  acc?: Look;
  size?: number;
};

const INK = colors.ink;
const BODY = 'M44 14 H178 Q208 14 208 44 V128 Q208 158 178 158 H96 L52 196 L62 158 H44 Q14 158 14 128 V44 Q14 14 44 14 Z';

function Eye({ cx, cy, r = 19, px = 4, py = 3 }: { cx: number; cy: number; r?: number; px?: number; py?: number }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={colors.white} stroke={INK} strokeWidth={5} />
      <Circle cx={cx + px} cy={cy + py} r={r * 0.48} fill={INK} />
      <Circle cx={cx + px + 3} cy={cy + py - 4} r={3} fill={colors.white} />
    </G>
  );
}

/**
 * Bulle, la mascotte : une bulle de conversation qui a du répondant.
 * 5 humeurs, 5 looks. Tracé identique à la maquette validée (viewBox 244×232).
 */
export function Bulle({ color = colors.lime, mood = 'happy', acc = 'none', size = 120 }: Props) {
  const height = Math.round((size * 232) / 244);
  return (
    <Svg width={size} height={height} viewBox="-12 -26 244 232" accessible={false}>
      <Defs>
        <Pattern id="bulleWax" width={24} height={24} patternUnits="userSpaceOnUse">
          <Rect width={24} height={24} fill={colors.orange} />
          <Circle cx={12} cy={12} r={6} fill={INK} />
          <Circle cx={12} cy={12} r={2.5} fill={colors.lime} />
          <Path d="M0 0 L6 0 L0 6 Z M24 24 L18 24 L24 18 Z" fill={colors.pink} />
        </Pattern>
      </Defs>

      <Path d={BODY} fill={INK} transform="translate(8 8)" />
      <Path d={BODY} fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Path d="M36 44 Q38 28 54 26" stroke={colors.white} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
      <Ellipse cx={62} cy={108} rx={11} ry={7} fill={colors.pink} opacity={0.8} />
      <Ellipse cx={160} cy={108} rx={11} ry={7} fill={colors.pink} opacity={0.8} />

      {mood === 'happy' && (
        <G>
          <Eye cx={82} cy={78} />
          <Eye cx={140} cy={78} />
          <Path d="M92 112 Q111 134 130 112" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </G>
      )}
      {mood === 'shock' && (
        <G>
          <Eye cx={82} cy={76} r={23} px={0} py={0} />
          <Eye cx={140} cy={76} r={23} px={0} py={0} />
          <Ellipse cx={111} cy={124} rx={12} ry={15} fill={INK} />
        </G>
      )}
      {mood === 'seum' && (
        <G>
          <Path d="M62 58 L100 70 M160 58 L122 70" stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <Circle cx={82} cy={84} r={17} fill={colors.white} stroke={INK} strokeWidth={5} />
          <Circle cx={82} cy={89} r={8} fill={INK} />
          <Circle cx={140} cy={84} r={17} fill={colors.white} stroke={INK} strokeWidth={5} />
          <Circle cx={140} cy={89} r={8} fill={INK} />
          <Path d="M94 128 Q111 112 128 128" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </G>
      )}
      {mood === 'proud' && (
        <G>
          <Path d="M66 80 Q82 64 98 80" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <Path d="M124 80 Q140 64 156 80" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <Path d="M86 104 Q111 140 136 104 Z" fill={INK} />
          <Path d="M96 116 Q111 128 126 116 Z" fill="#FF8FC2" />
        </G>
      )}
      {mood === 'think' && (
        <G>
          <Circle cx={82} cy={78} r={19} fill={colors.white} stroke={INK} strokeWidth={5} />
          <Circle cx={90} cy={72} r={9} fill={INK} />
          <Circle cx={140} cy={78} r={19} fill={colors.white} stroke={INK} strokeWidth={5} />
          <Circle cx={148} cy={72} r={9} fill={INK} />
          <Path d="M96 120 L128 116" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <SvgText x={186} y={40} fontFamily={fonts.display} fontSize={44} fill={INK}>
            ?
          </SvgText>
        </G>
      )}

      {acc === 'cap' && (
        <G>
          <Path d="M42 38 Q111 -18 180 38 Z" fill={colors.blue} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <Path d="M150 36 Q205 30 222 44 Q190 50 150 44 Z" fill={colors.blue} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <Circle cx={111} cy={10} r={6} fill={INK} />
        </G>
      )}
      {acc === 'shades' && (
        <G>
          <Rect x={54} y={62} width={54} height={34} rx={12} fill={INK} />
          <Rect x={114} y={62} width={54} height={34} rx={12} fill={INK} />
          <Rect x={100} y={70} width={22} height={6} fill={INK} />
          <Path d="M64 70 L80 70 M124 70 L140 70" stroke={colors.white} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
        </G>
      )}
      {acc === 'phones' && (
        <G>
          <Path d="M22 90 Q22 -12 111 -12 Q200 -12 200 90" fill="none" stroke={INK} strokeWidth={9} />
          <Rect x={4} y={66} width={30} height={54} rx={12} fill={colors.pink} stroke={INK} strokeWidth={5} />
          <Rect x={188} y={66} width={30} height={54} rx={12} fill={colors.pink} stroke={INK} strokeWidth={5} />
        </G>
      )}
      {acc === 'bob' && (
        <G>
          <Path d="M48 40 Q52 -6 111 -8 Q170 -6 174 40 Z" fill="url(#bulleWax)" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <Path d="M26 44 Q111 22 196 44 Q200 54 188 54 Q111 36 34 54 Q22 54 26 44 Z" fill={colors.orange} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </G>
      )}
      {acc === 'crown' && (
        <Path d="M70 32 L78 -4 L96 18 L111 -10 L126 18 L144 -4 L152 32 Z" fill={colors.gold} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      )}
    </Svg>
  );
}
