import { productKey, defaultProduct, defaultPhoto } from './default-catalog';
import { DEFAULT_PRODUCTS } from './default-products';

describe('productKey', () => {
  it('treats every apostrophe variant as the same character', () => {
    const variants = [
      "Qo'y go'shti",
      'Qo‘y go’shti',
      'Qo`y go`shti',
      "qo'y  go'shti",
    ];
    const keys = new Set(variants.map(productKey));
    expect(keys.size).toBe(1);
  });

  it('lowercases and collapses extra whitespace', () => {
    expect(productKey('  Sabzi   ')).toBe('sabzi');
    expect(productKey('Qizil   Piyoz')).toBe('qizil piyoz');
  });
});

describe('defaultProduct', () => {
  it('finds a product by its exact name', () => {
    expect(defaultProduct('Bodring')?.name).toBe('Bodring');
    expect(defaultProduct("mol go'shti")?.name).toBe("Mol go'shti");
  });

  it('ignores a parenthetical note', () => {
    expect(defaultProduct("Mol go'shti (lahm, suyaksiz)")?.name).toBe(
      "Mol go'shti",
    );
    expect(defaultProduct('Guruch (devzira)')?.name).toBe('Guruch');
  });

  it('returns undefined for an unknown name', () => {
    expect(defaultProduct("Hech qachon bo'lmagan mahsulot")).toBeUndefined();
  });
});

describe('defaultPhoto', () => {
  it('returns the /products/ path for a product with a photo', () => {
    expect(defaultPhoto('Bodring')).toBe('/products/bodring.webp');
  });

  it('returns null for a product with no photo', () => {
    expect(defaultPhoto('Kashnich')).toBeNull();
  });

  it('returns null for an unknown name', () => {
    expect(defaultPhoto("Hech qachon bo'lmagan mahsulot")).toBeNull();
  });
});

describe('DEFAULT_PRODUCTS', () => {
  it('has no two entries with the same productKey', () => {
    const keys = DEFAULT_PRODUCTS.map((p) => productKey(p.name));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('has 95 products', () => {
    expect(DEFAULT_PRODUCTS.length).toBe(95);
  });

  it('only uses units Shodiyora actually has', () => {
    const allowed = new Set(['KG', 'LITER', 'DONA']);
    for (const p of DEFAULT_PRODUCTS) {
      expect(allowed.has(p.unit)).toBe(true);
    }
  });
});
