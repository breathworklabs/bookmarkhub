/**
 * Activity Logger Utility
 * Manages activity log operations
 */

export interface ActivityLog {
  id: string
  action: string
  timestamp: Date
  details?: string
}

const MAX_ACTIVITY_LOGS = 50

/**
 * Create a new activity log entry
 */
export const createActivityLog = (
  action: string,
  details?: string
): ActivityLog => {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    action,
    timestamp: new Date(),
    details,
  }
}

/**
 * Add activity log to existing logs, maintaining max limit
 */
export const addActivityToLogs = (
  existingLogs: ActivityLog[],
  action: string,
  details?: string
): ActivityLog[] => {
  const newActivity = createActivityLog(action, details)
  return [newActivity, ...existingLogs].slice(0, MAX_ACTIVITY_LOGS)
}

/**
 * Get recent activity logs
 */
export const getRecentLogs = (
  logs: ActivityLog[],
  limit: number = 10
): ActivityLog[] => {
  return logs.slice(0, limit)
}
