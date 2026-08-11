const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating admin password...')

  const newPassword = 'Niekoh1128*'
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email: 'admin@tindahan.com' },
    data: { password: hashedPassword }
  })

  console.log('✅ Admin password updated successfully!')
  console.log('👉 Email: admin@tindahan.com')
  console.log(`👉 New Password: ${newPassword}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during update:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })