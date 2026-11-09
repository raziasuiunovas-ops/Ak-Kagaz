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

export function getCurrentDisplayPrice(prices?: ProductPrice[]) {
  const now = Date.now();
  const isEffective = (price: ProductPrice) =>
    new Date(price.effectiveFrom).getTime() <= now &&
    (!price.effectiveUntil || new Date(price.effectiveUntil).getTime() >= now);
  const confirmed = prices?.find((price) => price.isActive && !price.isEstimate && isEffective(price));
  if (confirmed) return { price: confirmed, isEstimate: false };
  // Draft estimates are preview values, so do not hide them just because their
  // effectiveFrom timestamp is ahead of a storefront clock. Expired estimates remain hidden.
  const estimate = prices
    ?.filter((price) => price.isEstimate && (!price.effectiveUntil || new Date(price.effectiveUntil).getTime() >= now))
    .sort((left, right) => new Date(right.effectiveFrom).getTime() - new Date(left.effectiveFrom).getTime())[0];
  return estimate ? { price: estimate, isEstimate: true } : undefined;
}
