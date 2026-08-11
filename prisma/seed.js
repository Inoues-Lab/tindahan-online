const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@tindahan.com' },
    update: {},
    create: {
      email: 'admin@tindahan.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // Create Customer User
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@tindahan.com' },
    update: {},
    create: {
      email: 'customer@tindahan.com',
      password: customerPassword,
      name: 'Juan Dela Cruz',
      phone: '09551652430',
      address: 'Becques, Tagudin, Ilocos Sur',
      role: 'CUSTOMER',
    },
  })

  // Create Merchant User
  const merchantPassword = await bcrypt.hash('merchant123', 10)
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@tindahan.com' },
    update: {},
    create: {
      email: 'merchant@tindahan.com',
      password: merchantPassword,
      name: 'Grace Encarnacion',
      phone: '09551652431',
      address: 'Tagudin, Ilocos Sur',
      role: 'MERCHANT',
    },
  })

  // Create Merchant Profile
  const merchantProfile = await prisma.merchantProfile.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      storeName: 'Grace Store',
      businessType: 'Grocery',
      status: 'APPROVED',
    },
  })

  // Create Rider User
  const riderPassword = await bcrypt.hash('rider123', 10)
  const riderUser = await prisma.user.upsert({
    where: { email: 'rider@tindahan.com' },
    update: {},
    create: {
      email: 'rider@tindahan.com',
      password: riderPassword,
      name: 'Pedro Rider',
      phone: '09551652432',
      role: 'RIDER',
    },
  })

  // Create Rider Profile
  await prisma.riderProfile.upsert({
    where: { userId: riderUser.id },
    update: {},
    create: {
      userId: riderUser.id,
      status: 'APPROVED',
      vehicleType: 'Motorcycle',
      plateNumber: 'ABC-123',
    },
  })

  // Create Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Canned Corned Beef (150g)',
        description: 'Delicious corned beef',
        price: 45.0,
        stock: 200,
        merchantId: merchantProfile.id,
      },
      {
        name: 'Coca Cola 1.5L',
        description: 'Refreshing soda',
        price: 95.0,
        stock: 150,
        merchantId: merchantProfile.id,
      },
      {
        name: 'Daing',
        description: 'Dried fish',
        price: 10.0,
        stock: 500,
        merchantId: merchantProfile.id,
      },
      {
        name: 'Eggs (1 dozen)',
        description: 'Fresh eggs',
        price: 120.0,
        stock: 100,
        merchantId: merchantProfile.id,
      },
      {
        name: 'Rice (5kg)',
        description: 'Premium rice',
        price: 350.0,
        stock: 100,
        merchantId: merchantProfile.id,
      },
    ],
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })