const fetchRiderData = async () => {
  try {
    console.log('🔄 Fetching rider orders...')
    const ordersRes = await fetch('/api/rider/orders')
    
    console.log('📊 Response status:', ordersRes.status)
    const ordersData = await ordersRes.json()
    console.log('📦 Orders data:', ordersData)
    
    if (ordersRes.ok) {
      setPendingOrders(ordersData.pendingOrders || [])
      setMyOrders(ordersData.myOrders || [])
      
      // Calculate today's income from COMPLETED deliveries
      const today = new Date().toISOString().split('T')[0]
      
      // Filter myOrders that are COMPLETED and completed today
      const todaysCompleted = (ordersData.myOrders || []).filter((order: any) => {
        // Check if order is completed
        if (order.status !== 'COMPLETED') return false
        
        // Use delivery.completedAt if available, otherwise fall back to updatedAt
        const completedDate = order.delivery?.completedAt 
          ? new Date(order.delivery.completedAt).toISOString().split('T')[0]
          : new Date(order.updatedAt).toISOString().split('T')[0]
        
        return completedDate === today
      })
      
      console.log('✅ Today\'s completed orders:', todaysCompleted)
      
      // Calculate total earnings from today's completed orders
      const todaysIncome = todaysCompleted.reduce((sum: number, order: any) => {
        return sum + (order.riderPayout || 0)
      }, 0)
      
      console.log('💰 Today\'s income:', todaysIncome)
      setTodayEarnings(todaysIncome)
      
      // Also update cash on hand from completed orders
      const totalCashOnHand = todaysCompleted.reduce((sum: number, order: any) => {
        return sum + (order.riderPayout || 0)
      }, 0)
      setCashOnHand(totalCashOnHand)
      
      setError('')
    } else {
      console.error('❌ Failed to fetch orders:', ordersData)
      setError(ordersData.error || ordersData.details || 'Failed to load orders')
    }
  } catch (error) {
    console.error('💥 Error fetching rider data:', error)
    setError('Error loading orders: ' + String(error))
  } finally {
    setLoading(false)
  }
}