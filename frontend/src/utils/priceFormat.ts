export function PriceFormat(
  price: number,
  locale: Intl.LocalesArgument,
  currency: string
) {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(price);
}
