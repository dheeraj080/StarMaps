const BASE_URL = "http://localhost:8000"; 

export async function apiGet<T>(endpoint: string): Promise<T> {
  // Ensure the endpoint starts with /
  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}