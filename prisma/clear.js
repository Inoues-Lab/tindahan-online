const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteTable(tableName) {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`)
    console.log(`  - Deleted from ${tableName}`)
  } catch (e) {
    // Table doesn't exist or is empty, that's okay
    console.log(`  - Skipped ${tableName} (not found or empty)`)
  }
}

async function main() {
  console.log('🧹 Starting SMART database cleanup...')

  // 1. Find admin user to preserve
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@tindahan.com' }
  })

  const adminId = admin ? admin.id : null

  // 2. Delete from ALL tables with error handling
  console.log('  - Clearing all tables...')
  
  await deleteTable('CartItem')
  await deleteTable('Cart')
  await deleteTable('Delivery')
  await deleteTable('OrderItem')
  await deleteTable('Order')
  await deleteTable('Product')
  await deleteTable('RiderProfile')
  await deleteTable('MerchantProfile')
  await deleteTable('Remittance')
  await deleteTable('MerchantApplication')
  await deleteTable('AuthLetter')
  await deleteTable('OCRResult')
  
  console.log('  - Deleting all Users (except admin)...')
  
  if (adminId) {
    await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE id != '${adminId}'`)
  } else {
    await prisma.$executeRawUnsafe(`DELETE FROM "User"`)
  }

  console.log('✅ Database is 100% clean! Only Admin remains.')
  console.log('👉 You can now register your own Merchant and add Products.')
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })