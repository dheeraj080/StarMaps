// app/api/tles/active/route.ts
export const runtime = "edge"; // or "nodejs" if you prefer
export const revalidate = 60 * 60; // 1 hour ISR caching

export async function GET() {
  // CelesTrak "active" group as TLE text
  const url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";

  const res = await fetch(url, {
    // Helps Next cache upstream
    next: { revalidate: 60 * 60 },
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch active TLEs" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tleText = await res.text();

  return new Response(tleText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Vercel/CDN cache:
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}