/**
 * Order Sync Utility
 * Synchronizes orders between user work history and admin order table
 */

export interface AdminOrder {
  id: string
  no: number
  date: string
  deadline: string
  customer: string
  customerEmail?: string
  analysis: string
  package: string
  price: number
  analyst: string
  analystFee: number
  workStatus: "Selesai" | "Diproses" | "Menunggu"
  paymentStatus: "Dibayar" | "Belum Dibayar"
  userId?: string
  researchTitle?: string
  description?: string
  deliveryDate?: string
}

export interface WorkHistoryItem {
  id: number
  type: string
  date: string
  time?: string
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan" | "Belum Dibayar" | "Dibayar"
  note: string
  orderId?: string
  orderDetails?: {
    analysisMethod: { id: string; name: string; description: string }
    package: { id: string; name: string; price: number; priceFormatted: string; description: string; features: string[] }
    researchTitle: string
    description: string
    deliveryDate?: string
    totalPrice: number
  }
}

const ADMIN_ORDERS_KEY = "admin_orders_all"

/**
 * Get all orders from admin storage
 */
export function getAllAdminOrders(): AdminOrder[] {
  if (typeof window === "undefined") return []
  
  const stored = localStorage.getItem(ADMIN_ORDERS_KEY)
  return stored ? JSON.parse(stored) : []
}

/**
 * Save all orders to admin storage
 */
export function saveAllAdminOrders(orders: AdminOrder[]): void {
  if (typeof window === "undefined") return
  
  localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders))
}

/**
 * Convert work history item to admin order
 */
export function workHistoryToAdminOrder(
  item: WorkHistoryItem,
  userId: string,
  userName: string,
  userEmail?: string
): AdminOrder | null {
  // Only convert items with type "Order"
  if (item.type !== "Order" || !item.orderDetails) {
    return null
  }

  // Parse date from "DD Month YYYY" format to "YYYY-MM-DD"
  const parsedDate = parseDateString(item.date)
  
  // Calculate deadline (delivery date)
  const deadline = item.orderDetails.deliveryDate || parsedDate

  // Determine work status based on payment status
  // Note: Initial sync always sets to "Menunggu" because analyst is not yet assigned
  // Status will auto-update to "Diproses" when both paid AND analyst is assigned
  let workStatus: "Selesai" | "Diproses" | "Menunggu" = "Menunggu"
  if (item.status === "Selesai") {
    workStatus = "Selesai"
  }
  // Don't auto-set to "Diproses" here - wait until analyst is assigned

  // Determine payment status
  const paymentStatus: "Dibayar" | "Belum Dibayar" = 
    item.status === "Dibayar" ? "Dibayar" : "Belum Dibayar"

  // Get all existing orders to calculate "no"
  const existingOrders = getAllAdminOrders()
  const maxNo = existingOrders.length > 0 ? Math.max(...existingOrders.map(o => o.no)) : 0

  return {
    id: item.orderId || `ORD-${Date.now()}-${userId}`,
    no: maxNo + 1,
    date: parsedDate,
    deadline: deadline,
    customer: userName,
    customerEmail: userEmail,
    analysis: item.orderDetails.analysisMethod.name,
    package: item.orderDetails.package.name,
    price: item.orderDetails.totalPrice,
    analyst: "-", // To be assigned by admin
    analystFee: 0, // To be set by admin
    workStatus: workStatus,
    paymentStatus: paymentStatus,
    userId: userId,
    researchTitle: item.orderDetails.researchTitle,
    description: item.orderDetails.description,
    deliveryDate: item.orderDetails.deliveryDate,
  }
}

/**
 * Parse date string from "DD Month YYYY" to "YYYY-MM-DD"
 */
function parseDateString(dateStr: string): string {
  try {
    const parts = dateStr.split(' ')
    if (parts.length !== 3) {
      // Fallback to current date
      const now = new Date()
      return now.toISOString().split('T')[0]
    }

    const day = parts[0].padStart(2, '0')
    const monthStr = parts[1]
    const year = parts[2]

    const monthMap: Record<string, string> = {
      'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
      'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
      'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    }

    const month = monthMap[monthStr] || '01'
    return `${year}-${month}-${day}`
  } catch {
    // Fallback to current date
    const now = new Date()
    return now.toISOString().split('T')[0]
  }
}

/**
 * Sync work history item to admin orders
 * Call this when user creates or updates an order
 */
export function syncWorkHistoryToAdmin(
  item: WorkHistoryItem,
  userId: string,
  userName: string,
  userEmail?: string
): void {
  if (typeof window === "undefined") return

  const adminOrder = workHistoryToAdminOrder(item, userId, userName, userEmail)
  if (!adminOrder) return

  const allOrders = getAllAdminOrders()
  
  // Check if order already exists (by orderId)
  const existingIndex = allOrders.findIndex(o => o.id === adminOrder.id)
  
  if (existingIndex >= 0) {
    // Update existing order
    allOrders[existingIndex] = {
      ...allOrders[existingIndex],
      ...adminOrder,
      // Preserve admin-set fields
      analyst: allOrders[existingIndex].analyst,
      analystFee: allOrders[existingIndex].analystFee,
    }
  } else {
    // Add new order
    allOrders.push(adminOrder)
  }

  saveAllAdminOrders(allOrders)
}

/**
 * Delete order from admin storage
 */
export function deleteAdminOrder(orderId: string): void {
  if (typeof window === "undefined") return

  const allOrders = getAllAdminOrders()
  const filtered = allOrders.filter(o => o.id !== orderId)
  saveAllAdminOrders(filtered)
}

/**
 * Update order payment status when user pays
 * Auto-updates workStatus to "Diproses" only if analyst is already assigned
 */
export function updateOrderPaymentStatus(orderId: string, status: "Dibayar" | "Belum Dibayar"): void {
  if (typeof window === "undefined") return

  const allOrders = getAllAdminOrders()
  const order = allOrders.find(o => o.id === orderId)
  
  if (order) {
    order.paymentStatus = status
    if (status === "Dibayar") {
      // Only change to "Diproses" if analyst is assigned
      const hasAnalyst = order.analyst && order.analyst !== "-" && order.analyst.trim() !== ""
      if (hasAnalyst) {
        order.workStatus = "Diproses"
      }
      // Otherwise, stays as "Menunggu" until admin assigns analyst
    }
    saveAllAdminOrders(allOrders)
  }
}

/**
 * Update order when analyst is assigned
 * Auto-updates workStatus to "Diproses" if already paid
 */
export function updateOrderAnalyst(orderId: string, analyst: string, analystFee: number): void {
  if (typeof window === "undefined") return

  const allOrders = getAllAdminOrders()
  const order = allOrders.find(o => o.id === orderId)
  
  if (order) {
    order.analyst = analyst
    order.analystFee = analystFee
    
    // If order is paid and analyst is now assigned, change status to "Diproses"
    const hasAnalyst = analyst && analyst !== "-" && analyst.trim() !== ""
    if (order.paymentStatus === "Dibayar" && hasAnalyst && order.workStatus === "Menunggu") {
      order.workStatus = "Diproses"
    }
    
    saveAllAdminOrders(allOrders)
  }
}
