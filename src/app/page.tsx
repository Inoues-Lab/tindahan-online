// src/app/page.tsx
import { prisma } from '../lib/prisma'
import Header from '../components/Header'
import { CartButton } from '../components/CartButton'

export default async function Home() {
  const products = await prisma.product.findMany()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Fresh Groceries</h2>
          <p className="text-gray-600">Delivered to your door within the day</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-4xl">
                🛍️
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{product.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">₱{product.price.toFixed(2)}</span>
                <CartButton product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  weightKg: product.weightKg
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}