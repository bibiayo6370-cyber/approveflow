import { describe, expect, it } from 'vitest';
import { rejectionSchema, requestSchema } from '../lib/validation';
describe('G3 validation', () => {
  it('rejects impossible dates and excess monetary precision', () => { expect(requestSchema.safeParse({ title:'T',description:'D',category:'C',quantity:1,unitCost:'1.234',requiredDate:'2026-02-31',justification:'J' }).success).toBe(false); });
  it('requires a meaningful rejection reason', () => { expect(rejectionSchema.safeParse({ comment:' ' }).success).toBe(false); });
});
