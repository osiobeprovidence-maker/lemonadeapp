export type SharePayload = {
  title?: string;
  text?: string;
  url: string;
};

export type ShareResult = {
  method: "native" | "clipboard" | "prompt";
  url: string;
};

export const shareLink = async (payload: SharePayload): Promise<ShareResult> => {
  const url = payload.url;

  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await (navigator as any).share({ title: payload.title, text: payload.text, url });
      return { method: "native", url };
    } catch {
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return { method: "clipboard", url };
  }

  window.prompt("Copy this link:", url);
  return { method: "prompt", url };
};

