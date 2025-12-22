/**
 * Utility to generate and manage a unique user ID per browser session
 * The user ID is regenerated on every page refresh
 */

export function generateUserId(): string {
  // Generate a random UUID-like string
  return `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function getUserId(): string {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return '';
  }

  // Try to get existing user ID from sessionStorage (cleared on refresh)
  let userId = sessionStorage.getItem('mermaid-user-id');
  
  // If no user ID exists, generate a new one
  if (!userId) {
    userId = generateUserId();
    sessionStorage.setItem('mermaid-user-id', userId);
  }
  
  return userId;
}

export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('mermaid-user-id');
  }
}
