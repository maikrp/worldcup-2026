const SOURCE_URL = "https://worldcup26.ir/get/games";
const SOURCE_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": "Mozilla/5.0 (compatible; WorldCup2026Dashboard/1.0)",
};

async function fetchLivePayload() {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const sourceResponse = await fetch(SOURCE_URL, {
        headers: SOURCE_HEADERS,
        signal: AbortSignal.timeout(12000),
        cache: "no-store",
      });

      if (!sourceResponse.ok) {
        lastError = new Error(`Live source responded ${sourceResponse.status}`);
        continue;
      }

      return await sourceResponse.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Live source unavailable");
}

export default async function handler(_request, response) {
  try {
    const payload = await fetchLivePayload();
    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.setHeader("CDN-Cache-Control", "no-store");
    return response.status(200).json({
      games: payload.games || [],
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Live synchronization failed", error);
    return response.status(502).json({ error: "Unable to synchronize live matches" });
  }
}
