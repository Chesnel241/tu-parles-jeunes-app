import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export function tapLight(): void {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function success(): void {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function failure(): void {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}
