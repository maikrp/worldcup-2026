const SOURCE_URL = "https://worldcup26.ir/get/games";

export default async function handler(_request, response) {
  try {
    const sourceResponse = await fetch(SOURCE_URL, {
      headers: { Accept: "application/json" },
    });

    if (!sourceResponse.ok) {
      return response.status(502).json({ error: "Live data source unavailable" });
    }

    const payload = await sourceResponse.json();
    response.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
    return response.status(200).json({
      games: payload.games || [],
      syncedAt: new Date().toISOString(),
    });
  } catch {
    return response.status(502).json({ error: "Unable to synchronize live matches" });
  }
}
