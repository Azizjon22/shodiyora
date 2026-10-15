import { InventoryService } from './inventory.service';
import { DEFAULT_PRODUCTS } from './default-products';

/** Just enough of Prisma for productCatalog()/stockForChef(). */
function setup(items: Partial<Record<string, unknown>>[]) {
  const prisma = {
    inventoryItem: {
      findMany: jest.fn().mockResolvedValue(items),
    },
  };
  const service = new InventoryService(
    prisma as never,
    {} as never,
    {} as never,
  );
  return { service, prisma };
}

describe('InventoryService.productCatalog', () => {
  it('fills in every standard product missing from the warehouse', async () => {
    const { service } = setup([]);
    const catalog = await service.productCatalog();
    expect(catalog).toHaveLength(DEFAULT_PRODUCTS.length);
  });

  it('does not list a standard product twice when the warehouse already has it', async () => {
    const { service } = setup([
      {
        id: 'w1',
        name: 'Bodring',
        productCategory: 'VEGETABLE',
        unit: 'KG',
        photoUrl: null,
      },
    ]);
    const catalog = await service.productCatalog();
    const bodrings = catalog.filter((p) => p.name.toLowerCase() === 'bodring');
    expect(bodrings).toHaveLength(1);
    expect(bodrings[0].id).toBe('w1');
    expect(catalog).toHaveLength(DEFAULT_PRODUCTS.length);
  });

  it('also matches a warehouse name written with a different apostrophe', async () => {
    const { service } = setup([
      {
        id: 'w2',
        name: 'Qo‘y go’shti',
        productCategory: 'MEAT',
        unit: 'KG',
        photoUrl: null,
      },
    ]);
    const catalog = await service.productCatalog();
    const matches = catalog.filter(
      (p) => p.id === 'w2' || p.name === "Qo'y go'shti",
    );
    expect(matches).toHaveLength(1);
  });

  it('gives a warehouse item its own photo over the standard one', async () => {
    const { service } = setup([
      {
        id: 'w1',
        name: 'Bodring',
        productCategory: 'VEGETABLE',
        unit: 'KG',
        photoUrl: '/uploads/own-cucumber.jpg',
      },
    ]);
    const catalog = await service.productCatalog();
    const bodring = catalog.find((p) => p.id === 'w1');
    expect(bodring?.photoUrl).toBe('/uploads/own-cucumber.jpg');
  });

  it('backfills a blank category from the matching standard product', async () => {
    const { service } = setup([
      {
        id: 'w1',
        name: 'Bodring',
        productCategory: null,
        unit: 'KG',
        photoUrl: null,
      },
    ]);
    const catalog = await service.productCatalog();
    const bodring = catalog.find((p) => p.id === 'w1');
    expect(bodring?.productCategory).toBe('VEGETABLE');
  });

  it('never returns a price or cost field', async () => {
    const { service } = setup([
      {
        id: 'w1',
        name: 'Bodring',
        productCategory: 'VEGETABLE',
        unit: 'KG',
        photoUrl: null,
      },
    ]);
    const catalog = await service.productCatalog();
    for (const row of catalog) {
      expect(row).not.toHaveProperty('unitPrice');
      expect(row).not.toHaveProperty('totalCost');
      expect(row).not.toHaveProperty('price');
    }
  });
});

describe('InventoryService.stockForChef', () => {
  it('only lists what is actually in the warehouse, never a standard product on its own', async () => {
    const { service } = setup([
      {
        id: 'w1',
        name: 'Bodring',
        productCategory: 'VEGETABLE',
        unit: 'KG',
        quantity: '3.5',
        photoUrl: null,
      },
    ]);
    const stock = await service.stockForChef();
    expect(stock).toHaveLength(1);
    expect(stock[0].id).toBe('w1');
  });

  it('gives an unphotographed warehouse item the matching standard photo', async () => {
    const { service } = setup([
      {
        id: 'w1',
        name: 'Bodring',
        productCategory: 'VEGETABLE',
        unit: 'KG',
        quantity: '3.5',
        photoUrl: null,
      },
    ]);
    const stock = await service.stockForChef();
    expect(stock[0].photoUrl).toBe('/products/bodring.webp');
  });

  it('never returns a price or cost field', async () => {
    const { service } = setup([
      {
        id: 'w1',
        name: 'Bodring',
        productCategory: 'VEGETABLE',
        unit: 'KG',
        quantity: '3.5',
        photoUrl: null,
      },
    ]);
    const stock = await service.stockForChef();
    for (const row of stock) {
      expect(row).not.toHaveProperty('unitPrice');
      expect(row).not.toHaveProperty('totalCost');
      expect(row).not.toHaveProperty('price');
    }
  });
});
