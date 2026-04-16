import { Router } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const LOCATIONS = [
  { location: "NL", locationName: "Netherlands", flag: "NL", server: "nl1.ftp-vpn.net" },
  { location: "DE", locationName: "Germany", flag: "DE", server: "de1.ftp-vpn.net" },
  { location: "FI", locationName: "Finland", flag: "FI", server: "fi1.ftp-vpn.net" },
  { location: "FR", locationName: "France", flag: "FR", server: "fr1.ftp-vpn.net" },
  { location: "US", locationName: "United States", flag: "US", server: "us1.ftp-vpn.net" },
];

const LOCATION_IPS: Record<string, string> = {
  NL: "185.220.101.1",
  DE: "185.220.102.1",
  FI: "185.220.103.1",
  FR: "185.220.104.1",
  US: "185.220.105.1",
};

function requireAuth(req: any, res: any): string | null {
  const licenseKey = req.headers["x-license-key"] as string | undefined;
  if (!licenseKey) {
    res.status(401).json({ error: "unauthorized", message: "Требуется авторизация" });
    return null;
  }
  return licenseKey.toUpperCase().trim();
}

function generateWireguardConfig(location: string, licenseKey: string): string {
  const ip = LOCATION_IPS[location] || "0.0.0.0";
  const keyHash = Buffer.from(licenseKey).toString("base64").slice(0, 32).padEnd(44, "=");
  const clientIp = `10.${Math.floor(Math.random() * 250 + 2)}.${Math.floor(Math.random() * 250 + 2)}.2`;

  return `[Interface]
PrivateKey = ${keyHash}
Address = ${clientIp}/32
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = ${Buffer.from(location + "server_public_key").toString("base64").slice(0, 44)}
PresharedKey = ${Buffer.from(licenseKey + location).toString("base64").slice(0, 44)}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${ip}:51820
PersistentKeepalive = 25
`;
}

router.get("/configs", async (req, res) => {
  const licenseKey = requireAuth(req, res);
  if (!licenseKey) return;

  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.licenseKey, licenseKey))
    .limit(1);

  if (subscription.length === 0) {
    res.status(401).json({ error: "unauthorized", message: "Ключ не найден" });
    return;
  }

  const sub = subscription[0];
  const isActive = sub.status === "active";

  const configs = LOCATIONS.map((loc) => ({
    ...loc,
    status: isActive ? "available" : "unavailable",
  }));

  res.json({ configs, total: configs.length });
});

router.get("/configs/:location/download", async (req, res) => {
  const licenseKey = requireAuth(req, res);
  if (!licenseKey) return;

  const { location } = req.params;
  const validLocation = LOCATIONS.find((l) => l.location === location?.toUpperCase());

  if (!validLocation) {
    res.status(404).json({ error: "not_found", message: "Локация не найдена" });
    return;
  }

  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.licenseKey, licenseKey))
    .limit(1);

  if (subscription.length === 0) {
    res.status(401).json({ error: "unauthorized", message: "Ключ не найден" });
    return;
  }

  const sub = subscription[0];

  if (sub.status !== "active") {
    res.status(403).json({ error: "forbidden", message: "Подписка неактивна. Оформите подписку для скачивания конфигов." });
    return;
  }

  await db
    .update(subscriptionsTable)
    .set({ totalDownloads: sql`${subscriptionsTable.totalDownloads} + 1` })
    .where(eq(subscriptionsTable.licenseKey, licenseKey));

  const content = generateWireguardConfig(location.toUpperCase(), licenseKey);
  const filename = `ftp-vpn-${location.toLowerCase()}.conf`;

  res.json({ location: validLocation.location, filename, content });
});

export default router;
