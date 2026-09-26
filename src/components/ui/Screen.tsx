import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Grain } from '@/components/brand/Grain';
import { colors } from '@/theme';

export const TAB_BAR_HEIGHT = 84;

type Props = {
  children: ReactNode;
  bg?: string;
  scroll?: boolean;
  /** L'écran a la barre d'onglets en bas : on réserve sa place. */
  withTabBar?: boolean;
  /** Décor derrière le contenu (motif wax, etc.). */
  background?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  bottomPadding?: number;
};

/** Cadre commun des écrans : fond, marges de sécurité, défilement et grain papier. */
export function Screen({ children, bg = colors.cream, scroll = true, withTabBar, background, contentStyle, bottomPadding }: Props) {
  const insets = useSafeAreaInsets();
  const paddingBottom = (bottomPadding ?? (withTabBar ? TAB_BAR_HEIGHT + 28 : 30)) + insets.bottom;
  const padding = { paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom };
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {background}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
      )}
      <Grain />
    </View>
  );
}
