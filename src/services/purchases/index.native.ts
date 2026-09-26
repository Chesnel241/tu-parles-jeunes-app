import { Platform } from 'react-native';
import { NO_ADS_ENTITLEMENT } from '@/data/shop';
import { config } from '../config';
import type { PurchaseResult, PurchasesService } from './types';

type RC = typeof import('react-native-purchases');

let rc: RC | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  rc = require('react-native-purchases') as RC;
} catch {
  rc = null;
}

let configured = false;

function apiKey(): string | undefined {
  return Platform.OS === 'ios' ? config.revenueCat.ios : config.revenueCat.android;
}

async function init(appUserId?: string): Promise<void> {
  const key = apiKey();
  if (!rc || !key || configured) return;
  try {
    rc.default.configure({ apiKey: key, appUserID: appUserId ?? null });
    configured = true;
  } catch {
    configured = false;
  }
}

async function noAdsPackage() {
  if (!rc || !configured) return null;
  const offerings = await rc.default.getOfferings();
  return offerings.current?.lifetime ?? offerings.current?.availablePackages[0] ?? null;
}

async function noAdsPrice(): Promise<string | null> {
  try {
    const pkg = await noAdsPackage();
    return pkg?.product.priceString ?? null;
  } catch {
    return null;
  }
}

async function buyNoAds(): Promise<PurchaseResult> {
  try {
    const pkg = await noAdsPackage();
    if (!rc || !pkg) return 'unavailable';
    const { customerInfo } = await rc.default.purchasePackage(pkg);
    return customerInfo.entitlements.active[NO_ADS_ENTITLEMENT] ? 'purchased' : 'error';
  } catch (e) {
    const err = e as { userCancelled?: boolean | null };
    return err?.userCancelled ? 'cancelled' : 'error';
  }
}

async function restore(): Promise<boolean> {
  if (!rc || !configured) return false;
  try {
    const info = await rc.default.restorePurchases();
    return Boolean(info.entitlements.active[NO_ADS_ENTITLEMENT]);
  } catch {
    return false;
  }
}

async function hasNoAds(): Promise<boolean> {
  if (!rc || !configured) return false;
  try {
    const info = await rc.default.getCustomerInfo();
    return Boolean(info.entitlements.active[NO_ADS_ENTITLEMENT]);
  } catch {
    return false;
  }
}

export const purchases: PurchasesService = {
  init,
  noAdsPrice,
  buyNoAds,
  restore,
  hasNoAds,
  get available() {
    return Boolean(rc) && configured;
  },
};
