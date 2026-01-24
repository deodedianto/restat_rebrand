/**
 * Work History Utilities
 * 
 * Helper functions for processing work history data in the dashboard
 */

import type { WorkHistoryItem } from "@/components/dashboard/work-progress"

/**
 * Counts work items that are currently in progress (Sedang Dikerjakan)
 * Only counts items where type is "Pengerjaan" (actual work) and status is "Sedang Dikerjakan"
 * 
 * @param workHistory - Array of work history items
 * @returns Number of items currently being worked on
 */
export function countSedangDikerjakan(workHistory: WorkHistoryItem[]): number {
  return workHistory.filter(
    (item) => item.type === "Pengerjaan" && item.status === "Sedang Dikerjakan"
  ).length
}

/**
 * Counts work items by status
 * 
 * @param workHistory - Array of work history items
 * @param status - Status to filter by
 * @returns Number of items with the specified status
 */
export function countByStatus(
  workHistory: WorkHistoryItem[],
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan"
): number {
  return workHistory.filter((item) => item.status === status).length
}

/**
 * Counts work items by type
 * 
 * @param workHistory - Array of work history items
 * @param type - Type to filter by (e.g., "Konsultasi", "Pembayaran", "Pengerjaan")
 * @returns Number of items with the specified type
 */
export function countByType(workHistory: WorkHistoryItem[], type: string): number {
  return workHistory.filter((item) => item.type === type).length
}

/**
 * Gets work items by type and status
 * 
 * @param workHistory - Array of work history items
 * @param type - Type to filter by
 * @param status - Status to filter by
 * @returns Array of filtered work items
 */
export function getWorkItemsByTypeAndStatus(
  workHistory: WorkHistoryItem[],
  type: string,
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan"
): WorkHistoryItem[] {
  return workHistory.filter((item) => item.type === type && item.status === status)
}

/**
 * Gets statistics for all work items
 * 
 * @param workHistory - Array of work history items
 * @returns Object with various statistics
 */
export function getWorkStatistics(workHistory: WorkHistoryItem[]) {
  return {
    total: workHistory.length,
    selesai: countByStatus(workHistory, "Selesai"),
    sedangDikerjakan: countByStatus(workHistory, "Sedang Dikerjakan"),
    dijadwalkan: countByStatus(workHistory, "Dijadwalkan"),
    konsultasi: countByType(workHistory, "Konsultasi"),
    pembayaran: countByType(workHistory, "Pembayaran"),
    pengerjaan: countByType(workHistory, "Pengerjaan"),
    pengerjaanAktif: countSedangDikerjakan(workHistory),
  }
}
