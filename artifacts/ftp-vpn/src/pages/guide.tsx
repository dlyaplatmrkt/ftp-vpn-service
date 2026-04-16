import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, MonitorSmartphone } from "lucide-react";

const TABS = [
  { id: "windows", label: "Windows" },
  { id: "macos", label: "macOS" },
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
  { id: "linux", label: "Linux" },
];

const STEPS: Record<string, {
  title: string;
  subtitle: string;
  links: { label: string; href: string }[];
  steps: { title: string; desc: string }[];
  note?: string;
}> = {
  windows: {
    title: "Windows",
    subtitle: "AmneziaVPN или WireGuard для Windows",
    links: [
      { label: "AmneziaVPN (GitHub)", href: "https://github.com/amnezia-vpn/amnezia-client/releases" },
      { label: "WireGuard для Windows", href: "https://www.wireguard.com/install/" },
    ],
    steps: [
      { title: "Купите подписку", desc: "Перейдите в раздел «Тарифы», выберите план и оплатите удобным способом." },
      { title: "Скачайте конфигурацию", desc: "В разделе «Конфигурации» выберите нужную страну и скачайте .conf файл." },
      { title: "Установите AmneziaVPN", desc: "Скачайте последнюю версию с GitHub или WireGuard с официального сайта." },
      { title: "Импортируйте конфигурацию", desc: "AmneziaVPN: нажмите «+» → «Импорт из файла». WireGuard: «Добавить туннель» → выберите .conf файл." },
      { title: "Подключитесь", desc: "Нажмите «Подключить». VPN активирован — ваш трафик защищён." },
    ],
    note: "Брандмауэр Windows может запросить разрешение на доступ — нажмите «Разрешить».",
  },
  macos: {
    title: "macOS",
    subtitle: "AmneziaVPN из App Store или .dmg с GitHub",
    links: [
      { label: "AmneziaVPN (App Store)", href: "https://apps.apple.com/app/amneziavpn/id1642631512" },
      { label: "AmneziaVPN (GitHub)", href: "https://github.com/amnezia-vpn/amnezia-client/releases" },
    ],
    steps: [
      { title: "Купите подписку", desc: "Раздел «Тарифы» → выбор плана → оплата." },
      { title: "Скачайте конфигурацию", desc: "Раздел «Конфигурации» → нужная страна → кнопка «Скачать»." },
      { title: "Установите AmneziaVPN", desc: "Из Mac App Store (рекомендуется) или загрузите .dmg с GitHub." },
      { title: "Импортируйте конфиг", desc: "Сохраните .conf файл → AmneziaVPN → «+» → «Импорт из файла»." },
      { title: "Подключитесь", desc: "Нажмите «Подключить». Разрешите добавление VPN-конфигурации при запросе системы." },
    ],
    note: "Gatekeeper: Системные настройки → Конфиденциальность и безопасность → «Всё равно открыть».",
  },
  ios: {
    title: "iOS / iPadOS",
    subtitle: "AmneziaVPN из App Store",
    links: [
      { label: "AmneziaVPN (App Store)", href: "https://apps.apple.com/app/amneziavpn/id1642631512" },
    ],
    steps: [
      { title: "Купите подписку", desc: "Перейдите в раздел «Тарифы», выберите план и оплатите." },
      { title: "Получите конфигурацию", desc: "Откройте раздел «Конфигурации», нажмите «Скачать» для нужной страны." },
      { title: "Установите AmneziaVPN", desc: "Скачайте из App Store (бесплатно)." },
      { title: "Импортируйте конфигурацию", desc: "Нажмите «+» в приложении → «Импорт из файла» → выберите скачанный .conf файл." },
      { title: "Подключитесь", desc: "Нажмите кнопку подключения. Разрешите добавление VPN-конфигурации при запросе iOS." },
    ],
    note: "Конфиг можно открыть прямо из браузера Safari — нажмите «Открыть в AmneziaVPN».",
  },
  android: {
    title: "Android",
    subtitle: "AmneziaVPN из Google Play или APK с GitHub",
    links: [
      { label: "AmneziaVPN (Google Play)", href: "https://play.google.com/store/apps/details?id=org.amnezia.vpn" },
      { label: "AmneziaVPN APK (GitHub)", href: "https://github.com/amnezia-vpn/amnezia-client/releases" },
    ],
    steps: [
      { title: "Купите подписку", desc: "Раздел «Тарифы» → выбор плана → оплата." },
      { title: "Скачайте конфигурацию", desc: "Раздел «Конфигурации» → нужный сервер → «Скачать»." },
      { title: "Установите AmneziaVPN", desc: "Из Google Play или APK с GitHub (разрешите установку из неизвестных источников)." },
      { title: "Импортируйте конфиг", desc: "В приложении нажмите «+» → «Импорт конфигурации» → выберите .conf файл." },
      { title: "Подключитесь", desc: "Нажмите кнопку подключения. Разрешите создание VPN при запросе Android." },
    ],
    note: "На Android 12+ может потребоваться разрешение на управление VPN в настройках.",
  },
  linux: {
    title: "Linux",
    subtitle: "AmneziaVPN AppImage или WireGuard через CLI",
    links: [
      { label: "AmneziaVPN AppImage (GitHub)", href: "https://github.com/amnezia-vpn/amnezia-client/releases" },
    ],
    steps: [
      { title: "Купите подписку", desc: "Раздел «Тарифы» → выбор плана → оплата." },
      { title: "Скачайте конфигурацию", desc: "Раздел «Конфигурации» → нужная страна → «Скачать»." },
      { title: "Установите AmneziaVPN", desc: "Скачайте AppImage с GitHub, дайте права: chmod +x AmneziaVPN*.AppImage и запустите." },
      {
        title: "Или через CLI (WireGuard)",
        desc: "Установите wireguard-tools, скопируйте .conf в /etc/wireguard/ftpvpn.conf"
      },
      {
        title: "Подключитесь",
        desc: "GUI: импорт через «+». CLI: sudo wg-quick up ftpvpn. Автозапуск: sudo systemctl enable wg-quick@ftpvpn"
      },
    ],
    note: "Отключение: sudo wg-quick down ftpvpn",
  },
};

export default function Guide() {
  const [activeTab, setActiveTab] = useState("windows");
  const current = STEPS[activeTab];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-4"
           style={{background:"rgba(10,10,15,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(0,212,255,0.1)"}}>
        <Link href="/" className="flex items-center gap-3 mr-auto text-foreground hover:text-primary transition-colors">
          <img src="/logo.jpg" alt="FTPVPN" className="w-8 h-8 rounded-lg" />
          <span className="font-bold gradient-text">FTPVPN</span>
        </Link>
        <div className="hidden md:flex items-center gap-5">
          <Link href="/guide" className="text-sm font-medium text-primary transition-colors">Инструкция</Link>
          <Link href="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Оферта</Link>
          <a href="https://t.me/ftpvpn_support" target="_blank" rel="noopener"
             className="text-sm text-muted-foreground hover:text-foreground transition-colors">Поддержка</a>
        </div>
        <Link href="/dashboard"
          className="px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={{background:"linear-gradient(135deg,#00d4ff,#8b5cf6)", color:"#0a0a0f"}}>
          Кабинет
        </Link>
      </nav>

      {/* Hero */}
      <div className="pt-28 pb-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono mb-6"
             style={{background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.15)", color:"#00d4ff"}}>
          <MonitorSmartphone className="w-3.5 h-3.5" />
          Поддержка всех платформ
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="gradient-text">Инструкция</span> по настройке
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Подключитесь к FTPVPN за 5 минут на любом устройстве
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={activeTab === tab.id ? {
                background:"rgba(0,212,255,0.12)",
                border:"1px solid rgba(0,212,255,0.3)",
                color:"#00d4ff"
              } : {
                background:"rgba(22,22,42,0.8)",
                border:"1px solid rgba(0,212,255,0.1)",
                color:"#8888aa"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{current.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{current.subtitle}</p>
          </div>

          {/* Download links */}
          <div className="flex flex-wrap gap-3">
            {current.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background:"rgba(22,22,42,0.9)",
                  border:"1px solid rgba(0,212,255,0.15)",
                  color:"#e8e8f0"
                }}
              >
                <Download className="w-4 h-4" style={{color:"#00d4ff"}} />
                {link.label}
              </a>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {current.steps.map((step, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-2xl"
                style={{background:"rgba(22,22,42,0.8)", border:"1px solid rgba(0,212,255,0.08)"}}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                     style={{background:"rgba(0,212,255,0.12)", color:"#00d4ff", border:"1px solid rgba(0,212,255,0.2)"}}>
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          {current.note && (
            <div className="p-4 rounded-xl text-sm"
                 style={{background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.2)", color:"#c4b5fd"}}>
              <strong>Примечание:</strong> {current.note}
            </div>
          )}

          {/* CTA */}
          <div className="pt-4 text-center">
            <Link href="/plans"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all"
              style={{background:"linear-gradient(135deg,#00d4ff,#8b5cf6)", color:"#0a0a0f"}}>
              Получить подписку
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground"
              style={{borderColor:"rgba(0,212,255,0.08)"}}>
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <img src="/logo.jpg" alt="FTPVPN" className="w-6 h-6 rounded-md" />
          <span className="font-bold gradient-text">FTPVPN</span>
        </Link>
        <div className="flex gap-6">
          <a href="https://t.me/ftpvpn_support" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">Поддержка</a>
          <Link href="/plans" className="hover:text-foreground transition-colors">Тарифы</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Кабинет</Link>
          <Link href="/legal" className="hover:text-foreground transition-colors">Оферта</Link>
        </div>
        <span>© 2026 FTPVPN</span>
      </footer>
    </div>
  );
}
