import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, stroke } from '@/theme';
import { Txt } from './Txt';
import { TAB_BAR_HEIGHT } from './Screen';

type ToastApi = { show: (message: string) => void };

const ToastContext = createContext<ToastApi>({ show: () => undefined });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

/** Petit message en bas d'écran (noir, texte vert), annoncé aux lecteurs d'écran. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [anim] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMessage(null));
      }, 2400);
    },
    [anim],
  );

  const api = useMemo(() => ({ show }), [show]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <ToastContext.Provider value={api}>
      {children}
      {message ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, bottom: TAB_BAR_HEIGHT + 20 + insets.bottom }}>
          <Animated.View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={{
              opacity: anim,
              transform: [{ translateY }],
              backgroundColor: colors.ink,
              borderColor: colors.lime,
              borderWidth: stroke.medium,
              borderRadius: 18,
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <Txt variant="bold" size={16} color={colors.lime} align="center">
              {message}
            </Txt>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}
