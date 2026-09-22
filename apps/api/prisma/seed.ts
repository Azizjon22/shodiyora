import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminPhone = process.env.SEED_SUPER_ADMIN_PHONE ?? '+998900000000';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Shodiyora2024!';

  const existing = await prisma.staffUser.findUnique({ where: { phone: superAdminPhone } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);
    await prisma.staffUser.create({
      data: {
        fullName: 'Bosh Administrator',
        phone: superAdminPhone,
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });
    console.log(`Super admin yaratildi: ${superAdminPhone} / ${superAdminPassword}`);
  } else {
    console.log('Super admin allaqachon mavjud, o\'tkazib yuborildi.');
  }

  const menuCount = await prisma.menu.count();
  if (menuCount === 0) {
    await prisma.menu.createMany({
      data: [
        { name: "160 ming menyu", pricePerPerson: 160000, description: "Standart to'y menyusi", isVip: false },
        { name: "200 ming menyu", pricePerPerson: 200000, description: "Kengaytirilgan to'y menyusi", isVip: false },
        { name: "260 ming menyu", pricePerPerson: 260000, description: "Premium to'y menyusi", isVip: false },
        { name: 'VIP menyu', pricePerPerson: 350000, description: "Eng yuqori darajadagi VIP menyu", isVip: true },
      ],
    });
    console.log("4 ta boshlang'ich menyu yaratildi.");
  }

  const productCatalog: { name: string; unit: 'KG' | 'LITER' | 'DONA'; productCategory: string }[] = [
    { name: 'Kartoshka', unit: 'KG', productCategory: 'VEGETABLE' },
    { name: 'Piyoz', unit: 'KG', productCategory: 'VEGETABLE' },
    { name: 'Sabzi', unit: 'KG', productCategory: 'VEGETABLE' },
    { name: 'Pomidor', unit: 'KG', productCategory: 'VEGETABLE' },
    { name: 'Bodring', unit: 'KG', productCategory: 'VEGETABLE' },
    { name: "Qalampir (bulg'or)", unit: 'KG', productCategory: 'VEGETABLE' },
    { name: 'Karam', unit: 'KG', productCategory: 'VEGETABLE' },
    { name: 'Olma', unit: 'KG', productCategory: 'FRUIT' },
    { name: "Uzum", unit: 'KG', productCategory: 'FRUIT' },
    { name: 'Banan', unit: 'KG', productCategory: 'FRUIT' },
    { name: 'Anor', unit: 'KG', productCategory: 'FRUIT' },
    { name: 'Limon', unit: 'KG', productCategory: 'FRUIT' },
    { name: "Mol go'shti", unit: 'KG', productCategory: 'MEAT' },
    { name: "Qo'y go'shti", unit: 'KG', productCategory: 'MEAT' },
    { name: "Tovuq go'shti", unit: 'KG', productCategory: 'MEAT' },
    { name: 'Qiyma', unit: 'KG', productCategory: 'MEAT' },
    { name: 'Sut', unit: 'LITER', productCategory: 'DAIRY' },
    { name: 'Qatiq', unit: 'LITER', productCategory: 'DAIRY' },
    { name: "Tvorog", unit: 'KG', productCategory: 'DAIRY' },
    { name: "Sariyog'", unit: 'KG', productCategory: 'DAIRY' },
    { name: 'Ukrop', unit: 'DONA', productCategory: 'GREENS' },
    { name: 'Jambil', unit: 'DONA', productCategory: 'GREENS' },
    { name: 'Rayhon', unit: 'DONA', productCategory: 'GREENS' },
    { name: 'Petrushka', unit: 'DONA', productCategory: 'GREENS' },
    { name: 'Guruch', unit: 'KG', productCategory: 'GRAIN' },
    { name: 'Un', unit: 'KG', productCategory: 'GRAIN' },
    { name: 'Makaron', unit: 'KG', productCategory: 'GRAIN' },
    { name: "O'simlik yog'i", unit: 'LITER', productCategory: 'OIL' },
    { name: 'Tuz', unit: 'KG', productCategory: 'SPICE' },
    { name: 'Qora murch', unit: 'KG', productCategory: 'SPICE' },
    { name: 'Zira', unit: 'KG', productCategory: 'SPICE' },
  ];

  for (const item of productCatalog) {
    await prisma.inventoryItem.upsert({
      where: { name: item.name },
      create: {
        name: item.name,
        unit: item.unit,
        category: 'PRODUCT',
        productCategory: item.productCategory as never,
      },
      update: {
        productCategory: item.productCategory as never,
      },
    });
  }
  console.log(`${productCatalog.length} ta mahsulot katalogga qo'shildi/yangilandi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
