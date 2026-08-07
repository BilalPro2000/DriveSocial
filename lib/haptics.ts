export function triggerHaptic(pattern: number | number[] = 15) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors or unallowed permissions
    }
  }
}
