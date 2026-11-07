/**
 * Get or create session ID for guest users
 * Session ID is used for tracking anonymous user activity (views, recommendations)
 */
export function getSessionId(): string {
  const SESSION_KEY = 'ak-kagaz-session-id';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}

/**
 * Get user ID from token (simplified - in production use proper JWT decoding)
 */
export function getUserId(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  try {
    // In production, decode JWT properly
    // For now, we assume backend provides userId
    const userId = localStorage.getItem('user_id');
    return userId;
  } catch {
    return null;
  }
}
