/**
 * Clear all session data from localStorage and sessionStorage
 */
export function clearAllSessionData() {
    console.log('🧹 [Session] Clearing all session data');

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    console.log('✅ [Session] All session data cleared');
}

/**
 * Clear specific visitor session data
 */
export function clearVisitorSession() {
    console.log('🧹 [Session] Clearing visitor session');

    const keysToRemove = [
        'visitor-session-id',
        'visitor-id',
        'chat-visitor-name',
        'chat-visitor-email',
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('✅ [Session] Visitor session cleared');
}

/**
 * Logout and clear all data
 */
export async function performLogout(redirectUrl: string = '/login') {
    console.log('🚪 [Session] Performing logout');

    try {
        // Call logout API
        await fetch('/api/logout', {
            method: 'POST',
        });
    } catch (error) {
        console.error('❌ [Session] Logout API error:', error);
    }

    // Clear all session data
    clearAllSessionData();

    // Redirect
    window.location.href = redirectUrl;
}
