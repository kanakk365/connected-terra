// Terra API base URL and shared helpers
const TERRA_BASE = "https://api.tryterra.co/v2";

export function terraHeaders() {
  return {
    "dev-id": process.env.TERRA_DEV_ID || "",
    "x-api-key": process.env.TERRA_API_KEY || "",
    "Content-Type": "application/json",
  };
}

export { TERRA_BASE };
