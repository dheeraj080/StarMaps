import { TLE } from "../interfaces/tle";

export async function getSatTLE(satId: string): Promise<TLE> {
    if (!satId) {
        throw new Error("Satellite ID is required");
    }

    const response = await fetch(`/api/satellite/${satId}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch satellite data' }));
        throw new Error(error.error || 'Failed to fetch satellite data');
    }

    return response.json();
}