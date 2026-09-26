import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Platform, Share, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import { config } from './config';

export function duelLink(duelId: string): string {
  return `${config.shareBaseUrl}/duel/${duelId}`;
}

/** Ouvre la feuille de partage native (WhatsApp, SMS, Instagram…). */
export async function shareText(message: string, url?: string): Promise<boolean> {
  try {
    const result = await Share.share(
      Platform.OS === 'ios' && url ? { message, url } : { message: url ? `${message}\n${url}` : message },
    );
    return result.action !== Share.dismissedAction;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/** Capture une carte (story, expression) en image et ouvre le partage. */
export async function shareCard(ref: RefObject<View | null>, dialogTitle: string): Promise<'shared' | 'unavailable' | 'error'> {
  try {
    if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) return 'unavailable';
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle, UTI: 'public.png' });
    return 'shared';
  } catch {
    return 'error';
  }
}
