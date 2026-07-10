// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const products = [
    { name: 'Jasmine Rice (5kg)', price: 350.00, weightKg: 5.0, stock: 50, description: 'Premium Jasmine Rice' },
    { name: 'Canned Corned Beef (150g)', price: 45.00, weightKg: 0.15, stock: 100, description: 'Delicious corned beef' },
    { name: 'Fresh Eggs (1 tray)', price: 220.00, weightKg: 1.5, stock: 30, description: 'Farm fresh eggs' },
    { name: 'Coca Cola 1.5L', price: 95.00, weightKg: 1.5, stock: 40, description: 'Refreshing soda' },
    { name: 'Instant Noodles (Pack of 5)', price: 65.00, weightKg: 0.5, stock: 80, description: 'Quick and easy meal' },
  ]
  
  for (const p of products) {
    await prisma.product.create({ data: p })
  }
  console.log('✅ Seeded database with sample products!')
}

main()