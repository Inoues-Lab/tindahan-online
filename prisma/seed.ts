// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Niekoh1128*', 10)
  await prisma.user.upsert({
    where: { email: 'admin@tindahan.com' },
    update: {},
    create: {
      email: 'admin@tindahan.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '09551652430',
    },
  })

  // Create rider user
  const riderPassword = await bcrypt.hash('123456', 10)
  await prisma.user.upsert({
    where: { email: 'rider@mark.com' },
    update: {},
    create: {
      email: 'rider@mark.com',
      name: 'rider1',
      passwordHash: riderPassword,
      role: 'RIDER',
    },
  })

  // Create customer user
  const customerPassword = await bcrypt.hash('123456', 10)
  await prisma.user.upsert({
    where: { email: 'marky@gmail.com' },
    update: {},
    create: {
      email: 'marky@gmail.com',
      name: 'marky',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '09551652430',
    },
  })

  // Create products (without image field to avoid type errors)
  await prisma.product.upsert({
    where: { id: 'prod-1' },
    update: {},
    create: {
      id: 'prod-1',
      name: 'Jasmine Rice (5kg)',
      description: 'Premium Jasmine Rice',
      price: 350,
      stock: 100,
      weightKg: 5.0,
    },
  })

  await prisma.product.upsert({
    where: { id: 'prod-2' },
    update: {},
    create: {
      id: 'prod-2',
      name: 'Canned Corned Beef (150g)',
      description: 'Delicious corned beef',
      price: 45,
      stock: 200,
      weightKg: 0.15,
    },
  })

  await prisma.product.upsert({
    where: { id: 'prod-3' },
    update: {},
    create: {
      id: 'prod-3',
      name: 'Fresh Eggs (1 tray)',
      description: 'Farm fresh eggs',
      price: 220,
      stock: 30,
      weightKg: 0.5,
    },
  })

  await prisma.product.upsert({
    where: { id: 'prod-4' },
    update: {},
    create: {
      id: 'prod-4',
      name: 'Coca Cola 1.5L',
      description: 'Refreshing soda',
      price: 95,
      stock: 40,
      weightKg: 1.5,
    },
  })

  await prisma.product.upsert({
    where: { id: 'prod-5' },
    update: {},
    create: {
      id: 'prod-5',
      name: 'Instant Noodles (Pack of 5)',
      description: 'Quick and easy meal',
      price: 65,
      stock: 100,
      weightKg: 0.4,
    },
  })

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })