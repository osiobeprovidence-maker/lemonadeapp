const PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";

const getSecretKey = () => process.env.PAYSTACK_SECRET_KEY || process.env.VITE_PAYSTACK_SECRET_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = getSecretKey();
  if (!secretKey) {
    return res.status(500).json({ error: "Paystack secret key is not configured." });
  }

  const { email, amount, reference, metadata, callbackUrl, plan } = req.body || {};
  if (!email || (!amount && !plan)) {
    return res.status(400).json({ error: "A valid email and either amount or plan are required." });
  }

  const response = await fetch(PAYSTACK_INITIALIZE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: plan ? undefined : amount,
      plan,
      reference,
      metadata,
      callback_url: callbackUrl,
      channels: ["card", "bank", "ussd", "bank_transfer"],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({
      error: payload?.message || "Failed to initialize Paystack transaction.",
    });
  }

  return res.status(200).json(payload);
}
