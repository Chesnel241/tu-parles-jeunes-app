import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { tapLight } from '@/services/haptics';
import { colors, stroke } from '@/theme';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  bg?: string;
};

/** Bouton icône 44×44 (retour, fermer…). Toujours avec un libellé d'accessibilité. */
export function IconButton({ onPress, accessibilityLabel, children, bg = colors.white }: Props) {
  return (
    <View style={{ marginRight: 3, marginBottom: 3 }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, borderRadius: 14, backgroundColor: colors.ink }} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={6}
        onPress={() => {
          tapLight();
          onPress();
        }}
        style={({ pressed }) => [
          {
            width: 44,
            height: 44,
            borderRadius: 14,
            borderWidth: stroke.thick,
            borderColor: colors.ink,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          },
          pressed ? { transform: [{ translateX: 2 }, { translateY: 2 }] } : null,
        ]}
      >
        {children}
      </Pressable>
    </View>
  );
}
