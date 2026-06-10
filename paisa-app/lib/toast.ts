// Simple toast using a custom event — no extra library needed
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-toast', { detail: { message, type } })
    window.dispatchEvent(event)
  }
}
