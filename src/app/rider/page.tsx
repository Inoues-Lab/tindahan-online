// src/app/rider/page.tsx
import { prisma } from '@/lib/prisma'
import Header from '@/components/Header'
import { RiderDashboard } from './RiderDashboard'

export default async function RiderPage() {
  // Fetch all orders with their items
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true
        }
      },
      delivery: {
        include: {
          rider: {
            include: {
              user: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Rider Dashboard 🏍️</h1>
          <p className="text-black font-semibold">Accept deliveries and earn money</p>
        </div>
        
        <RiderDashboard orders={JSON.parse(JSON.stringify(orders))} />
      </div>
    </main>
  )
}