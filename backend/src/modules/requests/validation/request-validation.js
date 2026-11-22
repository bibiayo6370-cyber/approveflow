import { validationError } from '../../../shared/errors/app-error.js';

function requiredString(value, name, maxLength) {
  if (typeof value !== 'string' || !value.trim() || (maxLength && value.trim().length > maxLength)) throw validationError(`${name} is required.`);
  return value.trim();
}

function cents(value) {
  if (typeof value !== 'string' && typeof value !== 'number') throw validationError('Unit cost must be a positive monetary amount.');
  const normalized = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) throw validationError('Unit cost must be a positive monetary amount with at most two decimal places.');
  const [whole, fractional = ''] = normalized.split('.');
  const amount = BigInt(whole) * 100n + BigInt((fractional + '00').slice(0, 2));
  if (amount <= 0n) throw validationError('Unit cost must be greater than zero.');
  return amount;
}

function decimalFromCents(amount) { return `${amount / 100n}.${String(amount % 100n).padStart(2, '0')}`; }

export function validateCreateRequest(input) {
  const quantity = Number(input?.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) throw validationError('Quantity must be a positive integer.');
  const unitCostCents = cents(input?.unitCost);
  const totalCostCents = unitCostCents * BigInt(quantity);
  if (totalCostCents > 99999999999999n) throw validationError('Total cost exceeds the supported limit.');
  const requiredDate = requiredString(input?.requiredDate, 'Required date');
  const dateParts = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(requiredDate);
  if (!dateParts) throw validationError('Required date must be a valid ISO date.');
  const [year, month, day] = dateParts.slice(1).map(Number); const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (parsedDate.getUTCFullYear() !== year || parsedDate.getUTCMonth() !== month - 1 || parsedDate.getUTCDate() !== day) throw validationError('Required date must be a valid ISO date.');
  return { title: requiredString(input?.title, 'Title', 255), description: requiredString(input?.description, 'Description'), category: requiredString(input?.category, 'Category', 50), quantity, unitCost: decimalFromCents(unitCostCents), totalCost: decimalFromCents(totalCostCents), requiredDate, justification: requiredString(input?.justification, 'Justification') };
}

export function validateDecisionComment(input) { return requiredString(input?.comment, 'Rejection comment'); }
