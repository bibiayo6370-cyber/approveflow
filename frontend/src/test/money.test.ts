import { describe, expect, it } from 'vitest';
import { calculateTotal } from '../lib/money';

describe('calculateTotal', () => {
  it('uses integer cents instead of floating point arithmetic', () => {
    expect(calculateTotal('3', '0.10')).toBe('0.30');
    expect(calculateTotal('7', '12.34')).toBe('86.38');
  });

  it('does not produce a misleading total for malformed input', () => {
    expect(calculateTotal('1.5', '12.00')).toBe('0.00');
    expect(calculateTotal('1', '1.234')).toBe('0.00');
  });
});
