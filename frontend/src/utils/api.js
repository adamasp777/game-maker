// Dynamically determine API URL based on window location
export const getApiUrl = () => {
  // If VITE_API_URL is set at build time, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('[API] Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  console.log('[API] Detecting API URL - protocol:', protocol, 'hostname:', hostname);
  
  // If accessing via Cloudflare tunnel, use apifight subdomain (no port)
  // Changed from api.fight.acunraid.com to apifight.acunraid.com
  if (hostname.includes('fight.acunraid.com')) {
    const apiUrl = `${protocol}//apifight.acunraid.com`;
    console.log('[API] Cloudflare tunnel detected, using:', apiUrl);
    return apiUrl;
  }
  
  // Otherwise, use same host as frontend but port 3001
  const apiUrl = `${protocol}//${hostname}:3001`;
  console.log('[API] Using local API URL:', apiUrl);
  return apiUrl;
};

export const API_URL = getApiUrl();
console.log('[API] Using API URL:', API_URL);
