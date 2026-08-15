import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const r = await prisma.product.updateMany({ data: { status: 'APPROVED' } })
  console.log('✅ Approved', r.count, 'existing products')
}
main().finally(() => prisma.$disconnect())
