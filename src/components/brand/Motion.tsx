import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

/** Respecte le réglage « Réduire les animations » du téléphone. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduced(v)).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/** Bulle qui flotte doucement (identité « motion first »). */
export function Bob({ children, style, amplitude = 7 }: { children: ReactNode; style?: StyleProp<ViewStyle>; amplitude?: number }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] });
  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Titre qui « claque » à l'écran comme un sticker qu'on colle, puis reste penché. */
export function Pop({ children, style, tilt = -4 }: { children: ReactNode; style?: StyleProp<ViewStyle>; tilt?: number }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.spring(v, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [reduced, v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: [`${tilt - 10}deg`, `${tilt}deg`] });
  return <Animated.View style={[style, { opacity: v, transform: [{ scale }, { rotate }] }]}>{children}</Animated.View>;
}

/** Apparition douce vers le haut. */
export function FadeIn({ children, style, delay = 0 }: { children: ReactNode; style?: StyleProp<ViewStyle>; delay?: number }) {
  const reduced = useReducedMotion();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, { toValue: 1, duration: 300, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [delay, reduced, v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
