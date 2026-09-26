import { useEffect, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, stroke } from '@/theme';
import { IconClose } from '@/components/brand/Icons';
import { IconButton } from './IconButton';
import { Txt } from './Txt';

type Props = {
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

/** Feuille qui monte du bas (défier un pote, fiche expression…), fond assombri cliquable. */
export function Sheet({ title, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const [anim] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [anim]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer" style={{ flex: 1 }} onPress={onClose} />
        <Animated.View
          style={{
            opacity: anim,
            transform: [{ translateY }],
            backgroundColor: colors.cream,
            borderTopWidth: stroke.thick,
            borderLeftWidth: stroke.thick,
            borderRightWidth: stroke.thick,
            borderColor: colors.ink,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingTop: 12,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 26,
          }}
        >
          <View style={{ width: 60, height: 6, borderRadius: 3, backgroundColor: colors.ink, alignSelf: 'center', marginBottom: 14 }} />
          {title ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Txt variant="display" size={24} accessibilityRole="header">
                {title}
              </Txt>
              <IconButton onPress={onClose} accessibilityLabel="Fermer">
                <IconClose size={18} />
              </IconButton>
            </View>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
