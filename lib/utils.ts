// Utility functions for SnapVote

/**
 * Generate a UUID with fallback for environments that don't support crypto.randomUUID
 */
export function generateUUID(): string {
  // Try to use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Check if the current environment supports crypto.randomUUID
 */
export function supportsCryptoUUID(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
}

/**
 * Get or create a persistent anonymous session ID stored in localStorage.
 * This is used to ensure a single vote per browser for each poll.
 */
export function getPersistentSessionId(key = 'snapvote-session-id'): string {
  if (typeof window === 'undefined') return generateUUID()

  let id = localStorage.getItem(key)
  if (!id) {
    id = generateUUID()
    localStorage.setItem(key, id)
  }
  return id
} 