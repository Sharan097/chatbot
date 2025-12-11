// lib/apiFetch.ts
export async function apiFetch(url: string, options: RequestInit = {}) {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    throw new Error('NO_TOKEN');
  }

  // Add Authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, { ...options, headers });

  // If 401 (unauthorized), try to refresh token once
  if (response.status === 401) {
    console.log('🔄 Access token expired, attempting refresh...');

    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = '/login?error=session_expired';
      throw new Error('UNAUTHORIZED');
    }

    // Try to refresh token
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
        accessToken,
      }),
    });

    const refreshResult = await refreshResponse.json();

    if (refreshResponse.ok && refreshResult.success) {
      console.log('Token refreshed, retrying request');
      
      // Update token
      localStorage.setItem('access_token', refreshResult.accessToken);
      localStorage.setItem('user', JSON.stringify(refreshResult.user));

      // Retry original request with new token
      headers['Authorization'] = `Bearer ${refreshResult.accessToken}`;
      response = await fetch(url, { ...options, headers });
    } else {
      // Refresh failed, clear tokens and redirect to login
      localStorage.clear();
      window.location.href = '/login?error=session_expired';
      throw new Error('UNAUTHORIZED');
    }
  }

  return response;
}
