import type { ProductPrice } from '@/types';

export function getCurrentConfirmedPrice(prices?: ProductPrice[]) {
  const now = Date.now();
  return prices?.find((price) =>
    price.isActive &&
    !price.isEstimate &&
    new Date(price.effectiveFrom).getTime() <= now &&
    (!price.effectiveUntil || new Date(price.effectiveUntil).getTime() >= now),
  );
}
