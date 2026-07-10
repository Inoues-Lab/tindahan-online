// src/app/admin/page.tsx
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminPage() {
  // Fetch all data
  const [products, orders, users] = await Promise.all([
    prisma.product.findMany(),
    prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.findMany({
      include: {
        riderProfile: true
      }
    })
  ])

  const riders = users.filter(u => u.role === 'RIDER')
  const customers = users.filter(u => u.role === 'CUSTOMER')

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Admin Dashboard </h1>
          <p className="text-black font-semibold">Manage products, orders, and riders</p>
        </div>
        
        <AdminDashboard 
          products={JSON.parse(JSON.stringify(products))}
          orders={JSON.parse(JSON.stringify(orders))}
          riders={JSON.parse(JSON.stringify(riders))}
          stats={{
            totalRevenue,
            totalOrders,
            completedOrders,
            pendingOrders
          }}
        />
      </div>
    </main>
  )
}