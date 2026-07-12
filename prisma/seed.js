const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Jasmine Rice (5kg)',
        description: 'Premium Jasmine Rice',
        price: 350,
        stock: 100,
        image: '/images/rice.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Canned Corned Beef (150g)',
        description: 'Delicious corned beef',
        price: 45,
        stock: 50,
        image: '/images/cornedbeef.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Fresh Eggs (1 tray)',
        description: 'Farm fresh eggs',
        price: 220,
        stock: 30,
        image: '/images/eggs.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Coca Cola 1.5L',
        description: 'Refreshing soda',
        price: 95,
        stock: 40,
        image: '/images/coke.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Instant Noodles (Pack of 5)',
        description: 'Quick and easy meal',
        price: 65,
        stock: 100,
        image: '/images/noodles.jpg'
      }
    }),
    prisma.product.create({
      data: {
        name: 'test',
        description: 'test',
        price: 100,
        stock: 10,
        image: '/images/test.jpg'
      }
    })
  ])

  const hashedPassword = await bcrypt.hash('123456', 10)

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@tindahan.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      phone: '09123456789'
    }
  })

  await prisma.user.create({
    data: {
      name: 'Rider Mark',
      email: 'rider@mark.com',
      passwordHash: hashedPassword,
      role: 'RIDER',
      phone: '09987654321'
    }
  })

  await prisma.user.create({
    data: {
      name: 'Customer Juan',
      email: 'customer@juan.com',
      passwordHash: hashedPassword,
      role: 'CUSTOMER',
      phone: '09111222333'
    }
  })

  console.log('✅ Seeding completed!')
  console.log(`Created ${products.length} products`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })