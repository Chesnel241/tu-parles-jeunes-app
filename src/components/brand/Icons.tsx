import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

function Base({ size = 22, color = colors.ink, strokeWidth = 3, d, children }: IconProps & { d?: string; children?: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {d ? <Path d={d} /> : null}
      {children}
    </Svg>
  );
}

export const IconBack = (p: IconProps) => <Base {...p} d="M15 5 L8 12 L15 19" />;
export const IconClose = (p: IconProps) => <Base strokeWidth={3.2} {...p} d="M6 6 L18 18 M18 6 L6 18" />;
export const IconHome = (p: IconProps) => <Base strokeWidth={2.8} {...p} d="M4 11 L12 4 L20 11 V20 H4 Z" />;
export const IconTrophy = (p: IconProps) => (
  <Base strokeWidth={2.8} {...p} d="M7 4 H17 V9 A5 5 0 0 1 7 9 Z M7 6 H4 A3 3 0 0 0 7 10 M17 6 H20 A3 3 0 0 1 17 10 M12 14 V18 M8 20 H16" />
);
export const IconBook = (p: IconProps) => <Base strokeWidth={2.8} {...p} d="M5 4 H16 A3 3 0 0 1 19 7 V20 H8 A3 3 0 0 1 5 17 Z M5 17 A3 3 0 0 1 8 14 H19" />;
export const IconUser = (p: IconProps) => (
  <Base strokeWidth={2.8} {...p}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 20 C5.5 16 8.5 14 12 14 C15.5 14 18.5 16 20 20" />
  </Base>
);
export const IconFlame = (p: IconProps) => <Base {...p} d="M12 3 C13 6 17 8 17 13 A5 5 0 0 1 7 13 C7 10 9 9 9 6 C11 7 12 9 12 11" />;
export const IconShare = (p: IconProps) => <Base {...p} d="M12 3 V15 M7 8 L12 3 L17 8 M5 14 V20 H19 V14" />;
export const IconChevron = (p: IconProps) => <Base {...p} d="M9 5 L16 12 L9 19" />;
export const IconCheck = (p: IconProps) => <Base {...p} d="M5 12 L10 17 L19 7" />;
export const IconFlag = (p: IconProps) => <Base {...p} d="M5 21 V4 M5 4 H17 L14 8 L17 12 H5" />;

/** Pièce du jeu (disque doré cerclé). */
export function Coin({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={8} fill={colors.gold} stroke={colors.ink} strokeWidth={3} />
    </Svg>
  );
}
