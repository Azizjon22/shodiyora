import { formatQuantity } from './format-quantity';

describe('formatQuantity', () => {
  it('shows less than a kilo in grams', () => {
    expect(formatQuantity('0.2', 'KG')).toBe('200 g');
    expect(formatQuantity(0.05, 'KG')).toBe('50 g');
  });

  it('shows whole kilos as kg', () => {
    expect(formatQuantity('15.000', 'KG')).toBe('15 kg');
  });

  it('shows a sum like 10 kg + 500 g as both', () => {
    expect(formatQuantity(10.5, 'KG')).toBe('10 kg 500 g');
  });

  it('leaves litres and pieces as they are', () => {
    expect(formatQuantity('2.5', 'LITER')).toBe('2.5 litr');
    expect(formatQuantity(30, 'DONA')).toBe('30 dona');
  });
});
