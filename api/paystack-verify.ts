const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

const getSecretKey = () => process.env.PAYSTACK_SECRET_KEY || process.env.VITE_PAYSTACK_SECRET_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = getSecretKey();
  if (!secretKey) {
    return res.status(500).json({ error: "Paystack secret key is not configured." });
  }

  const reference = String(req.query?.reference || "");
  if (!reference) {
    return res.status(400).json({ error: "Payment reference is required." });
  }

  const response = await fetch(`${PAYSTACK_VERIFY_URL}/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({
      error: payload?.message || "Failed to verify Paystack transaction.",
    });
  }

  return res.status(200).json(payload);
}
