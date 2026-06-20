const SOURCE_URL = "https://worldcup26.ir/get/games";

export default async function handler(_request, response) {
  try {
    const sourceResponse = await fetch(SOURCE_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(26000),
      cache: "no-store",
    });

    if (!sourceResponse.ok) {
      return response.status(502).json({ error: "Live data source unavailable" });
    }

    const payload = await sourceResponse.json();
    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.setHeader("CDN-Cache-Control", "no-store");
    return response.status(200).json({
      games: payload.games || [],
      syncedAt: new Date().toISOString(),
    });
  } catch {
    return response.status(502).json({ error: "Unable to synchronize live matches" });
  }
}
