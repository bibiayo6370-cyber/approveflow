/** Exact display-only total calculation; the API remains authoritative. */
export function calculateTotal(quantity: string, unitCost: string): string {
  if (!/^\d+(?:\.\d{0,2})?$/.test(unitCost) || !/^\d+$/.test(quantity)) return '0.00';
  const [whole, fraction = ''] = unitCost.split('.');
  const cents = (BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2))) * BigInt(quantity);
  return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
}
