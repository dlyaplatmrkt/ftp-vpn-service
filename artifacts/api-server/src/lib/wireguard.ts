export function generateWireguardConfig(params: {
  clientPrivateKey: string;
  serverPublicKey: string;
  presharedKey: string;
  clientIp: string;
  serverEndpoint: string;
  dns: string;
  allowedIps: string;
}): string {
  return `[Interface]
PrivateKey = ${params.clientPrivateKey}
Address = ${params.clientIp}
DNS = ${params.dns}
MTU = 1280

[Peer]
PublicKey = ${params.serverPublicKey}
PresharedKey = ${params.presharedKey}
Endpoint = ${params.serverEndpoint}
AllowedIPs = ${params.allowedIps}
PersistentKeepalive = 25
`;
}

export const SERVER_LOCATIONS: Record<string, { flag: string; endpoint: string; publicKey: string }> = {
  "Netherlands": {
    flag: "🇳🇱",
    endpoint: "nl1.ftpvpn.io:51820",
    publicKey: "Nh62FtIxl0b7W3xVbExAMPLEpublicKeyNL==",
  },
  "Germany": {
    flag: "🇩🇪",
    endpoint: "de1.ftpvpn.io:51820",
    publicKey: "De89KjMxl0b7W3xVbExAMPLEpublicKeyDE==",
  },
  "Finland": {
    flag: "🇫🇮",
    endpoint: "fi1.ftpvpn.io:51820",
    publicKey: "Fi45QwRxl0b7W3xVbExAMPLEpublicKeyFI==",
  },
  "France": {
    flag: "🇫🇷",
    endpoint: "fr1.ftpvpn.io:51820",
    publicKey: "Fr23TpNxl0b7W3xVbExAMPLEpublicKeyFR==",
  },
  "United States": {
    flag: "🇺🇸",
    endpoint: "us1.ftpvpn.io:51820",
    publicKey: "Us67LkXxl0b7W3xVbExAMPLEpublicKeyUS==",
  },
};
