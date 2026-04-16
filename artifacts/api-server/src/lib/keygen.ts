import crypto from "crypto";

export function generateAccessKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const groups = 4;
  const groupLength = 4;
  const parts: string[] = [];

  for (let g = 0; g < groups; g++) {
    let part = "";
    for (let i = 0; i < groupLength; i++) {
      part += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(part);
  }

  return parts.join("-");
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateWireguardKeys(): { privateKey: string; publicKey: string } {
  const privateKey = crypto.randomBytes(32).toString("base64");
  const publicKey = crypto.randomBytes(32).toString("base64");
  return { privateKey, publicKey };
}

export function generatePresharedKey(): string {
  return crypto.randomBytes(32).toString("base64");
}

export function generateClientIp(index: number): string {
  const base = 10 + (index % 240);
  const host = 1 + (Math.floor(index / 240) % 254);
  return `10.${base}.${host}.2/32`;
}
