const MUX_UPLOAD_URL = "https://api.mux.com/video/v1/uploads";

const getMuxCredentials = () => ({
  tokenId: process.env.MUX_TOKEN_ID || process.env.VITE_MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET || process.env.VITE_MUX_TOKEN_SECRET,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tokenId, tokenSecret } = getMuxCredentials();
  if (!tokenId || !tokenSecret) {
    return res.status(500).json({ error: "Mux credentials are not configured." });
  }

  const origin = req.headers.origin || "https://lemonadeapp.vercel.app";
  const authHeader = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");

  const response = await fetch(MUX_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cors_origin: origin,
      new_asset_settings: {
        playback_policy: ["public"],
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({
      error: payload?.error?.message || payload?.message || "Failed to create Mux upload.",
    });
  }

  return res.status(200).json(payload);
}
